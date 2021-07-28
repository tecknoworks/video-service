const fs = require('fs');
const { stat, createReadStream } = require('fs');
const { promisify } = require('util')
const path = require('path');
const FormData = require('form-data');
const uuid = require('uuid/v4');
const axios = require('axios');
const { getVideoDurationInSeconds } = require('get-video-duration')

const config = require("./config");
const fileInfo = promisify(stat);
const videoFolder = `${__dirname}/../videos/`;
const imagesFolder = `${__dirname}/../images/`;

const ExtractFrames = require('./extract_frames');

async function uploadLocalImage(url, imagePath){
    try {
        var formData = new FormData()
        formData.append('image', fs.createReadStream(imagePath));
        
        let headers = {headers: {...formData.getHeaders()}};
        var result = await axios.post(url, formData, headers);
        
        return result.data.imageFileName;
    } catch (error) {  
        console.log(error);
        
        throw 'Error uploading the video frame.'
    }
}

module.exports = {
    stream: async function (req, res) {
        let fileName = req.query.video;
        
        let videoPath = path.resolve(videoFolder, fileName);

        const stat = fs.statSync(videoPath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            const file = fs.createReadStream(videoPath, { start, end });

            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4',
            }

            res.writeHead(206, head);
            file.pipe(res);
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            }

            res.writeHead(200, head);
            fs.createReadStream(videoPath).pipe(res);
        }
    },
    upload: async function (req, res) {

        if (Object.keys(req.files).length == 0)
            return res.status(400).send('No files were uploaded.');

        let fileName = req.files.video.name;

        if (!fileName.match(/.(mp4)$/i))
            res.status(400).send('File uploaded is not an mp4 video.')
        else{
            let video = req.files.video;
            
            let newFileName = `${uuid()}.mp4`;
            let videoPath = path.resolve(videoFolder, newFileName);

            video.mv(videoPath, async function (err) {
                if (err)
                    return res.status(500).send(err);

                let runtime = await getVideoDurationInSeconds(videoPath);

                res.send({
                    videoFileName: newFileName,
                    runtime: Math.floor(runtime)
                });
            });
        }
        
    },
    uploadWithPoster: async function (req, res) {
        if (Object.keys(req.files).length == 0)
            return res.status(400).send('No files were uploaded.');

        let fileName = req.files.video.name;
        
        //only .mp4 videos can be uploaded
        if (!fileName.match(/.(mp4)$/i))
            res.status(400).send('File uploaded is not an mp4 video.')
        else{
            let video = req.files.video;

            let newFileName = `${uuid()}.mp4`;
            let videoPath = path.resolve(videoFolder, newFileName);


            video.mv(videoPath, function (err) {
                if (err)
                    return res.status(500).send(err);

                ExtractFrames.extract(newFileName, 1).then(
                    async (videoFrameName) =>{
                        try {
                            let uploadUrl = `${config.assetServiceUrl}/image/upload`;
                            videoFramePath = path.resolve(imagesFolder, videoFrameName);

                            var poster = await uploadLocalImage(uploadUrl, videoFramePath);

                            let runtime = await getVideoDurationInSeconds(videoPath);
                            
                            fs.unlink(videoFramePath,(err)=>{
                                if(err){
                                    console.log(err);
                                    return res.status(400).send('Error uploading the video with the poster.')
                                }
                                return res.send({
                                    imageFileName: poster,
                                    video: {
                                        videoFileName: newFileName,
                                        runtime: Math.floor(runtime)
                                    }
                                })
                            })
                        } catch (error) {
                            console.log(error);
                            
                            fs.unlink(videoPath,(err)=>{
                                if(err){
                                    console.log(err);
                                }
                                res.status(400).send('Error uploading the video with the poster.')
                            });
                        }
                    } 
                )
            });
        }
    },
    getFrame: function (req, res) {
        try {
        
            let videoId = req.query.videoId;
            let offset = req.query.offset;

            ExtractFrames.extract(videoId, offset).then((videoFamePath) => {
                res.sendFile(videoFamePath, (err)=>{
                    if(err){
                        console.log(err);
                    }
                    fs.unlink(videoFamePath,(err)=>{
                        if(err){
                            console.log(err);
                        }
                    });
                });
            });
        } catch (error) {
            res.status(400).send(error.message);
        }
    },
    deleteVideo: function(req,res){
        let videoFileName = req.query.videoFileName;
        if(videoFileName){
            let videoPath = path.resolve(videoFolder, videoFileName);
            fs.unlink(videoPath, (err)=>{
                if(err)
                    return res.status(400).send('Error occured during deletion of the video file.');
                return res.status(204).send();
            });
        }
        else
            res.status(400).send('Invalid request.');
    }
}