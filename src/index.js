const express = require('express')
const bodyparser= require('body-parser')
const cors = require('cors')
const path = require('path')
const app = express()
const fileUpload = require('express-fileupload');
const logger = require('morgan');
const fs = require('fs');

//create images and videos folders if they not exist
const imagesFolder = `${__dirname}/../images`;
const videosfolder = `${__dirname}/../videos`;
if(!fs.existsSync(imagesFolder)){
    fs.mkdirSync(imagesFolder);
}
if(!fs.existsSync(videosfolder)){
    fs.mkdirSync(videosfolder);
}


const port = 3003
const router= require('./router')

app.use(cors())
app.use(bodyparser.json())
app.use(logger('dev'));

app.use(fileUpload())

app.use('/videos', router)

app.listen(port, ()=> console.log( `Video microservice listening on port ${port}`));