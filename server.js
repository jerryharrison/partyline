
// var express = require('express');
var simplesmtp = require("simplesmtp");
// var fs = require("fs");

var smtp = simplesmtp.createServer();
    smtp.listen(25);

smtp.on("startData", function(connection){
    console.log("Message from:", connection.from);
    console.log("Message to:", connection.to);
    // connection.saveStream = fs.createWriteStream("/tmp/message.txt");
});


var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(80);
console.log('Server running at http://127.0.0.1:1337/');

/*
smtp.on("data", function(connection, chunk){
    connection.saveStream.write(chunk);
});

smtp.on("dataReady", function(connection, callback){
    connection.saveStream.end();
    console.log("Incoming message saved to /tmp/message.txt");
    callback(null, "ABC1"); // ABC1 is the queue id to be advertised to the client
    // callback(new Error("Rejected as spam!")); // reported back to the client
});
*/