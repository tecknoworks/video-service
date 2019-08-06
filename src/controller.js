const fs = require('fs');
const { stat, createReadStream } = require('fs');
const { promisify } = require('util')
const path = require('path');

const fileInfo = promisify(stat);
const folder = `${__dirname}/../videos/`;

module.exports = {
    stream: async function (req, res) {
        let fileName = req.params.id;
        let videoPath = path.resolve(folder, `${fileName}.mp4`);

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

        let videoPath = path.resolve(folder, `${fileName}.mp4`);

        video.mv(videoPath, function (err) {
            if (err)
                return res.status(500).send(err);

            res.send('File uploaded!');
        });
    }
}