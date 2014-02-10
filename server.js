
// var express = require('express');
var config = require("./config.json");
var fs = require("fs");
var uuid = require("node-uuid");
var simplesmtp = require("simplesmtp");
var MailParser = require("mailparser").MailParser,
    mailparser = new MailParser({
        streamAttachments : true
    });

mailparser.on("attachment", function(attachment){
  if(attachment && attachment.fileName && /(.GIF|.JPEG|.JPG|.PNG)$/.test(attachment.fileName.toUpperCase())){
    picPath = "/tmp/weibo_" + attachment.generatedFileName;
    attachment.stream.pipe(fs.createWriteStream(picPath));
  }
});


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
});
smtp.listen(25);

/*

Validate Recipient -- and sender
Pipe all data to a .eml file
On dataReady pipe file to mailparser...




*/

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

  console.log("Message from:", connection.from);
  console.log("Message to:", connection.to);

  connection.fileUUID = uuid.v4();

  connection.saveStream = fs.createWriteStream(__dirname + '/tmp/' + connection.fileUUID + '.eml');

});

smtp.on("data", function(connection, chunk){
  console.log('Writing Data...');
  connection.saveStream.write(chunk);
});

smtp.on('dataReady', function(connection, done){
  connection.saveStream.end();
  
  console.log('Incoming message saved to /tmp/' + connection.fileUUID + '.eml');

  return done();
});

smtp.on('close', function(connection){
  
  console.log('close event...');

  fs.createReadStream(__dirname + '/tmp/' + connection.fileUUID + '.eml').pipe(mailparser);

  // mailparser.write(connection.emailData);
  // mailparser.end();

  mailparser.on('end', function(mail){
    connection.parsedMail = mail;

    console.log('Email parsed:', connection.parsedMail);

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
