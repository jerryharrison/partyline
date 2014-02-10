
// var express = require('express');
var config = require("./config.json");
var simplesmtp = require("simplesmtp");
var MailParser = require("mailparser").MailParser,
    mailparser = new MailParser();

var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill(config.mandrill);

var partylines = {
  bni: [
    {email: 'fivesecondrule@gmail.com', name: 'Jery Harrison', type: 'to'},
    {email: 'fivesecondrule@gmail.com', name: 'Jery Luna', type: 'to'}
  ]
};

var smtp = simplesmtp.createServer({
  SMTPBanner:"Partyline Server", 
  name: 'partyline.cc',
  validateRecipients : false,
  disableDNSValidation: true,
  debug: true
}, function(req){

  req.on("data", function(chunk){
    mailparser.write(chunk);
    mailparser.end();
  });

  req.accept();

});
smtp.listen(25);

/*

Validate Recipient -- and sender
Pipe all data to a .eml file
On dataReady pipe file to mailparser...




*/

mailparser.on("end", function(mail_object){
    console.log("Subject:", mail_object.subject);
});

smtp.on('validateRecipient', function(connection, email, done){
  console.log('validateRecipient');
  email = email.split("@");
  var partyline = {};
      partyline.name = email[0].toLowerCase().trim();
      partyline.host = email.pop().toLowerCase().trim();

  if (partylines[partyline.name]) {
    partyline.recipients = partylines[partyline.name];
    connection.partyline = partyline;
    return done();
  } else {
    return done(new Error("Invalid Partyline"));
  }
});


smtp.on('validateSender', function(connection, email, done){
  console.log('validateSender');
  return done();
});


smtp.on("startData", function(connection){
  console.log('startData');
  console.log('===================================================');
  console.log('begin');
  console.log('===================================================');
  connection.emailData = '';
});

smtp.on("data", function(connection, chunk){
  console.log('Reading Data..');
  connection.emailData += chunk;
});

smtp.on('dataReady', function(connection, done){
  console.log('dataReady');
  console.log('===================================================');
  console.log('End');
  console.log('===================================================');
  return done();
});


smtp.on('close', function(connection){
  
  console.log('close event...');

  mailparser.write(connection.emailData);
  mailparser.end();
  mailparser.on('end', function(mail){
    connection.parsedMail = mail;

    var email;
    // Loop over all the partyline recipients for this partyline
    // And send them all individual emails with the from being the partyline email
    if (connection.partyline && connection.partyline.recipients) {
      connection.partyline.recipients.forEach(function(recipient){

        email = {
          html: connection.parsedMail.html,
          text: connection.parsedMail.text,
          subject: connection.parsedMail.subject,
          to: recipient,
          from_name: connection.partyline,
          from_email: connection.partyline.name + '@partyline.cc',
          headers: {
            'Reply-To': connection.partyline.name + '@partyline.cc'
          }
        };

        if (connection.parsedMail.attachments && connection.parsedMail.attachments.length > 0) {
          email.attachments = [];
          for (var i = connection.parsedMail.attachments.length - 1; i >= 0; i--) {
            email.attachments.push({
              type: connection.parsedMail.attachments[i].contentType,
              name: connection.parsedMail.attachments[i].fileName,
              content: connection.parsedMail.attachments[i].content
            });
          }
        }

        console.log('Email:', email);

        // mandrill_client.messages.send({
        //   message: email,
        //   async: true
        // }, function(result){
        //   console.log('Sent Result:', result);
        // });

      });
    }

  });

});






// var http = require('http');
// http.createServer(function (req, res) {
//   res.writeHead(200, {'Content-Type': 'text/plain'});
//   res.end('Welcome to Partyline! Join for free simply email us at signup@partyline.cc with the participants as the CC and we\'ll setup the forward.');
// }).listen(80);
// console.log('HTTP Server is running at http://partyline.cc/');
