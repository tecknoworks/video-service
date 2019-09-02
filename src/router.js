const express = require('express')
const router = express.Router()
const VideoController = require('./controller')

router.get('/frame',VideoController.getFrame);
router.get('/stream', VideoController.stream);
router.post('/upload', VideoController.upload);
router.post('/upload-with-poster', VideoController.uploadWithPoster);
router.delete('/delete',  VideoController.deleteVideo);

module.exports= router;