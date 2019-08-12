const express = require('express')
const router = express.Router()
const VideoController = require('./controller')

router.get('/:id', VideoController.stream);
router.post('/upload', VideoController.upload);
router.post('/upload-with-caption', VideoController.uploadWithCaption);

module.exports= router;