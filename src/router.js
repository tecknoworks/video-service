const express = require('express')
const router = express.Router()
const VideoController = require('./controller')

router.get('/:id', VideoController.stream);
router.post('/upload', VideoController.upload);

module.exports= router;