"use strict";

const http               = require('http');
const express            = require('express');
const RemoteTCPFeedRelay = require('./lib/remotetcpfeed');
const app                = express();

/**
* on the remote rpi run
* raspivid -t 0 -o - -w 1280 -h 720 -fps 25 | nc -k -l 5001
* to create a raw tcp h264 streamer
*/

  //public website
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/vendor/dist'));

const server  = http.createServer(app);

const feed    = new RemoteTCPFeedRelay(server, {
  feed_ip   : "127.0.0.1",
  feed_port : 7001,
});

server.listen(8080);
/*
Server=> 
  gst-launch-1.0 -v filesrc location=./samples/out.h264 ! h264parse ! video/x-h264,stream-format=byte-stream ! tcpserversink port=7001 host=0.0.0.0 recover-policy=keyframe sync-method=latest-keyframe sync=true

Cleint=>
  gst-launch-1.0 -v tcpclientsrc host=127.0.0.1 port=7001 ! typefind ! h264parse ! avdec_h264 ! videoconvert ! autovideosink

1Pipeline=>
  gst-launch-1.0 filesrc location=./samples/out.h264 ! video/x-h264 ! h264parse ! avdec_h264 ! videoconvert ! videorate ! video/x-raw,framerate=30/1 ! autovideosink
*/