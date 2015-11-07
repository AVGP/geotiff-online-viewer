var express = require('express');
var router = express.Router();
var multer = require('multer');
var fs = require('fs');
var Promise = require('bluebird');
var ps = require('geo-pixel-stream');
var median = require('median');

var upload = multer({ dest: '/tmp' })
// INTERNALS

function parseTiff(filePath) {
  return new Promise(function(resolve, reject) {
    var readers = ps.createReadStreams(filePath)
    var numPoints = 0;
    var blocks = [];

    readers[0].on('data', function(data) {
      var blockPoints = [],
          blockLen = data.blockSize.x * data.blockSize.y;

      for(var i=0;i<blockLen;i++) blockPoints.push(data.buffer[i]);
      blocks.push(blockPoints);
    });

    readers[0].on('end', function() {
      resolve(blocks);
    });
  });
}

function linearize(blocks, block_width, blocks_per_row) {
  var points = [];
  console.log('found ' + blocks.length + ' blocks a ' + blocks[0].length + ' points');

  console.log('linearize...');
  var min = 1000, max = 0;

  for(var i=0; i<blocks.length * blocks[0].length; i++) {
    var col = i % (block_width * blocks_per_row), row = Math.floor(i / (block_width * blocks_per_row));
    var block = Math.floor(col / block_width) + Math.floor(row / block_width) * blocks_per_row;

    var colInBlock = col % block_width;
    var rowInBlock = row % block_width;
    try {
      points[i] = blocks[block][colInBlock + rowInBlock * block_width];
    } catch(e) {
      console.error('Error parsing block ' + i, blocks[block]);
      throw new Error('Linearize failed in block #' + i);
    }
    if(points[i] > 0 && points[i] < min) min = points[i];
    if(points[i] > max) max = points[i];
  }

  console.log('points parsed in total: ' + points.length);
  return {points: points, min: min, max: max};
}

function compress(points) {
  var output = [];
  var currentHeight = Math.round(points[0]), currentLen = 1;

  console.log('compressing...');
  for(var i=1, len = points.length; i<len; i++) {
    if(Math.round(points[i]) == currentHeight) currentLen++;
    else {
      output.push(currentHeight);
      output.push(currentLen);

      currentHeight = Math.round(points[i]);
      currentLen = 1;
    }
  }

  console.log('compressed to ' + (output.length / 2) + ' tuples');
  return output;
}

// ROUTES

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/display', upload.single('tiff'), function(req, res, next) {
  console.log('parsing upload.', req.file);
  parseTiff(req.file.path).then(function(blocks) {
    return linearize(blocks, Math.sqrt(blocks[0].length), Math.sqrt(blocks.length));
  }).then(function(pointData) {
    return {
      min: pointData.min,
      max: pointData.max,
      median: median(JSON.parse(JSON.stringify(pointData.points.filter(function(p) { return p >= 0; })))),
      tuples: compress(pointData.points)
    };
  }, function(err) {
    console.error('Parsing failed!');
    console.log(err);
    res.send(500);
  }).then(function(compressedData) {
    console.log('FINAL: ', compressedData.tuples.length / 2);
    res.render('display', {
      points: compressedData.tuples,
      maxHeight: compressedData.max,
      minHeight: compressedData.min,
      medianHeight: compressedData.median,
      averageHeight: compressedData.min + ((compressedData.max-compressedData.min)/2)
    });
  });
});

module.exports = router;
