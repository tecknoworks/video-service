const express = require('express')
const router = express.Router()
const VideoController = require('./controller')

router.get('/frame',VideoController.getFrame);
router.get('/stream', VideoController.stream);
router.post('/upload', VideoController.upload);
router.post('/upload-with-caption', VideoController.uploadWithCaption);

router.delete('/delete-all',  VideoController.deleteAllVideos);

module.exports= router;