const fs = require('fs');
const { stat, createReadStream } = require('fs');
const { promisify } = require('util')
const path = require('path');
const FormData = require('form-data');

const fileInfo = promisify(stat);
const videoFolder = `${__dirname}/../videos/`;

const ExtractFrames = require('./extract_frames');

module.exports = {
    stream: async function (req, res) {
        let fileName = req.query.videoId;
        
        let videoPath = path.resolve(videoFolder, `${fileName}.mp4`);

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
    upload: function (req, res) {

        if (Object.keys(req.files).length == 0)
            return res.status(400).send('No files were uploaded.');

        let fileName = req.body.name;
        let video = req.files.video;

        let videoPath = path.resolve(videoFolder, `${fileName}.mp4`);

        video.mv(videoPath, function (err) {
            if (err)
                return res.status(500).send(err);

            res.send('File uploaded!');
        });
    },
    uploadWithCaption: function (req, res) {
        if (Object.keys(req.files).length == 0)
            return res.status(400).send('No files were uploaded.');

        let fileName = req.body.name;
        let video = req.files.video;

        let videoPath = path.resolve(videoFolder, `${fileName}.mp4`);

        video.mv(videoPath, function (err) {
            if (err)
                return res.status(500).send(err);
            ExtractFrames.extract(fileName, 1).then(() => {
                var formData = new FormData()

                formData.append('image', fs.createReadStream(`images/screenshot.jpg`))
                formData.append('name', fileName)

                formData.submit('http://localhost:3002/assets/image/upload', function (err, res) { })
            })
            res.send('Video uploaded and caption saved!');
        });
    },
    getFrame: function (req, res) {
        try {
            let videoId = req.query.videoId;
            let offset = req.query.offset;
            
            ExtractFrames.extract(videoId, offset).then(() => {
                res.sendFile(`/images/screenshot.jpg`,{root: './'})
                }
            )
        } catch (error) {
            res.send(error.message)
        }
    },
    //just for seeding
    deleteAllVideos: function(req,res){
        fs.readdir(videoFolder, (err, files) => {
            if (err) throw err;
          
            for (const file of files) {
              fs.unlink(path.join(videoFolder, file), err => {
                if (err) throw err;
              });
            }
          });
    }
}