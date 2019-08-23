const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const extractFrames = require('ffmpeg-extract-frames')

module.exports = {
  extract: async function(videoName,offset){
    await extractFrames({
      input: `videos/${videoName}.mp4`,
      output: './images/screenshot.jpg',
      offsets: [
        offset
      ]
    })
  }
}