const express = require('express')
const bodyparser= require('body-parser')
const cors = require('cors')
const path = require('path')
const app = express()
const fileUpload = require('express-fileupload');

const port = 3003
const router= require('./router')

app.use(cors())
app.use(bodyparser.json())
app.use(fileUpload())

app.use('/videos', router)

app.listen(port, ()=> console.log( `Video microservice listening on port ${port}`));