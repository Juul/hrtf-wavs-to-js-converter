#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var minimist = require('minimist');
var glob = require('glob-fs')();
var async = require('async');
var WavDecoder = require('wav-decoder');

var argv = minimist(process.argv.slice(2), {
  alias: {
    d: 'debug',
    h: 'help'
    
  },
  boolean: [
    'debug',
    'help'
  ],
});

function usage(f) {
  f("Usage: ", path.basename(__filename), "./cmd.js hrtf_dir > hrtf.js")
  f("");
}

function fail(err) {
  console.error(err);
  process.exit(1);
}

function failUsage(err) {
  console.error(err + "\n");
  usage(console.error);
  process.exit(1);
}

if(argv.help) {
  usage(console.log);
  process.exit(0);
}

if(argv._.length !== 1) {
  failUsage("You must specify a .wav file to convert.");
}

var wavDirPath = argv._[0];

function round(n, precision) {
  return Number((n).toFixed(precision));
}


function wav_to_js(fileName, precision, cb) {

  var out0 = [];
  var out1 = [];
  var i, chan0, chan1;
  fs.readFile(fileName, function(err, data) {
    if(err) return cb(err);  

    WavDecoder.decode(data).then(function(decoded) {
      // TODO handle error

      chan0 = decoded.channelData[0];
      chan1 = decoded.channelData[0];
      for(i=0; i < chan0.length; i++) {
        out0.push(round(chan0[i], precision));
        out1.push(round(chan1[i], precision));
      }

      cb(null, out0, out1);
    });
  });  
}


function convertFile(filePath, cb) {

  var fileName = path.basename(filePath);
  
  // File name format:
  // IRC_{subject_id}_{'C'ompensated or 'R'aw}_R{radius in cm}_T{azimuth}_P{elevation}.wav
  /*
    Elevation is: Elevation in degrees, modulo 360 (3 digits, from 315 to 345 for source below your head, 0 for source in front of your head, and from 015 to 090 for source above your head)
      ^ from http://recherche.ircam.fr/equipes/salles/listen/download.html 
  */
  
  var m = fileName.match(/IRC_(\d+)_([CD])_R(\d+)_T(\d+)_P(\d+)\.wav/);
  if(!m) return cb(new Error("File name not recognized as an IRCAM HRTF filename"));


  // elevation for sources below your head are represented as negative numbers
  // in the IRCAM js format
  var elevation = parseInt(m[5]);
  elevation = (elevation > 180) ? elevation - 360 : elevation

  var o = {
    azimuth: parseInt(m[4]),
    distance: 1, // TODO this is always 1 in the binauralFIR js HRTF example, why?
    elevation: elevation
  };
  
  wav_to_js(filePath, 7, function(err, chan0, chan1) {
    if(err) fail(err);
    
    o.fir_coeffs_left = chan0;
    o.fir_coeffs_right = chan1;

    cb(null, o);
  });
}


glob.readdir(path.join(wavDirPath, '*.wav'), function(err, files) {
  if(err) fail(err);

  var o = [];

  async.eachSeries(files, function(filePath, cb) {

    convertFile(filePath, function(err, data) {
      if(err) cb(err);
      
      o.push(data);
      cb();
    });    

  }, function(err) {
    if(err) fail(err);
    
    console.log("var hrtfs = " + JSON.stringify(o, null, 2) + ";");
  });

});



