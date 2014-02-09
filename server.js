
// var express = require('express');
var smtp = require("simplesmtp");
var MailParser = require("mailparser").MailParser,
    mailparser = new MailParser();
// var fs = require("fs");

smtp.createSimpleServer({SMTPBanner:"My Server", debug: true}, function(req){
    process.stdout.write("\r\nNew Mail:\r\n");
    req.on("data", function(chunk){
      // process.stdout.write(chunk);
      mailparser.write(chunk);
      mailparser.end();

      mailparser.on('end', function(mail){
        console.log("From:",      mail.from); //[{address:'sender@example.com',name:'Sender Name'}]
        console.log("Subject:",   mail.subject); // Hello world!
        console.log("Text body:", mail.text); // How are you today?
      });
    });

    req.accept(); // close req

}).listen(25, function(err){
    if(!err){
        console.log("SMTP server listening on port 25");
    }else{
        console.log("Could not start server on port 25. Ports under 1000 require root privileges.");
        console.log(err.message);
    }
});

var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Welcome to Partyline! Join for free simply email us at signup@partyline.cc with the participants as the CC and we\'ll setup the forward.');
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