const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const extractFrames = require('ffmpeg-extract-frames')
const path = require('path')

const videoFolder = `${__dirname}/../videos/`;
const imagesFolder = `${__dirname}/../images/`;

module.exports = {
  extract: async function(videoName,offset){
    var videoFrameName = `${videoName.split('.')[0]}.jpg`;

    var videoPath = path.resolve(videoFolder, videoName);
    var videoFramePath = path.resolve(imagesFolder, videoFrameName);
    
    videoFramePath=await extractFrames({
      input: videoPath,
      output: videoFramePath,
      offsets: [
        offset
      ]
    })
    
    return videoFramePath
  }
}