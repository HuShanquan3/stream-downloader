'use strict';
const path = require('path')
const fs = require('fs-extra')
const ffmpeg = require('fluent-ffmpeg')
const {unlink, sleep} = require(path.join(__dirname,'../utils'))
var {default: PQueue} = require('p-queue')

const ffmpeg_concat = async (video, audio, outputpath, outputfilename, opts) => {
	await new Promise((resolve, reject) =>{
	    ffmpeg(video)
		    .input(audio)
			.outputOptions('-c:v', 'copy', '-c:a', 'aac', '-strict', 'experimental')
			.output(path.join(outputpath,outputfilename))
			.on('start', function(commandLine) {
				console.log('debug: Ffmpeg with command: ' + commandLine)
			})
			.on('end', () => {
				resolve()
			})
			.on('error', reject)
			.run()
		})
}

var exec = async function(video, audio, outputpath, outputfilename, opts){

	var ffmpegPath = await require(path.join(__dirname,'./check_ffmpeg_installed')).exec(opts)
	console.log("debug: ffmpegPath " + ffmpegPath)

	ffmpeg.setFfmpegPath(ffmpegPath)

	outputfilename = "merge_"+outputfilename

	console.log('debug: staring merge video')
	try{
		await ffmpeg_concat(video, audio, outputpath, outputfilename, opts)
		await Promise.all([video, audio].map(unlink))
		console.log('debug: merge completed')
		return {
			'state':'success',
			'outputfile':path.join(outputpath,outputfilename)
		}
	}catch(err){
		console.log('debug: merge error' +err)
		return {
			'state':'fail',
			'err':err
		}
	}
}

exports = module.exports = {exec}