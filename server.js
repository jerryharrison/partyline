
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

// smtp.createSimpleServer({SMTPBanner:"Partyline Server", debug: false}).listen(25, function(err){
//   if(!err){
//     console.log("SMTP server listening on port 25");
//   }else{
//     console.log("Could not start server on port 25. Ports under 1000 require root privileges.");
//     console.log(err.message);
//   }
// });

var smtp = simplesmtp.createServer({
    name: 'partyline.cc',
    validateRecipients : true,
    disableDNSValidation: true,
    debug: false
});
    smtp.listen(25);

smtp.on('validateRecipient', function(connection, email, done){
  email = (email || "").split("@");
  var partyline = {};
      partyline.name = email.pop().toLowerCase().trim();
      partyline.host = email.slice(-1)[0].toLowerCase().trim();

  if (partylines[partyline.name]) {
    partyline.recipients = partylines[partyline.name];
    connection.partyline = partyline;
    return done();
  } else {
    return done(new Error("Invalid Partyline"));
  }
});

/*
smtp.on('validateSender', function(connection, email, done){
  return done();
});
*/

smtp.on("startData", function(connection){
  process.stdout.write("\r\nNew Mail:\r\n");
});

smtp.on("data", function(connection, chunk){

  mailparser.write(chunk);
  mailparser.end();
  mailparser.on('end', function(mail){
    connection.parsedMail = mail;
    console.log("From:",      mail.from); //[{address:'sender@example.com',name:'Sender Name'}]
    console.log("Subject:",   mail.subject); // Hello world!
    console.log("Text body:", mail.text); // How are you today?
    console.log("HTML body:", mail.html); // How are you today?
  });

  console.log(connection.parsedMail);

});

smtp.on('close', function(connection){
  
  console.log(connection);
  console.log(connection.partyline);

  var email;
  // Loop over all the partyline recipients for this partyline
  // And send them all individual emails with the from being the partyline email
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

});






// var http = require('http');
// http.createServer(function (req, res) {
//   res.writeHead(200, {'Content-Type': 'text/plain'});
//   res.end('Welcome to Partyline! Join for free simply email us at signup@partyline.cc with the participants as the CC and we\'ll setup the forward.');
// }).listen(80);
// console.log('HTTP Server is running at http://partyline.cc/');
