
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
    debug: true
});
    smtp.listen(25);

smtp.on('validateRecipient', function(envelope, email, done){
  var partyline = ((email || "").split("@").end() || "").toLowerCase().trim();

  console.log('Partyline:', partyline);
  console.log('Partylines:', partylines);

  if (partylines[partyline]) {
    envelope.partyline = partyline;
    envelope.partylineRecipients = partylines[partyline];
    return done();
  } else {
    return done(new Error("Invalid Partyline"));
  }
});

/*
smtp.on('validateSender', function(connection, email, done){
  return done();
});

smtp.on("startData", function(connection){
  process.stdout.write("\r\nNew Mail:\r\n");
});

smtp.on("data", function(connection, chunk){

  mailparser.write(chunk);
  mailparser.end();
  mailparser.on('end', function(mail){
    connection.mail = mail;
    console.log("From:",      mail.from); //[{address:'sender@example.com',name:'Sender Name'}]
    console.log("Subject:",   mail.subject); // Hello world!
    console.log("Text body:", mail.text); // How are you today?
    console.log("HTML body:", mail.html); // How are you today?
  });

});

smtp.on('end', function(connection){
  
  var email;
  // Loop over all the partyline recipients for this partyline
  // And send them all individual emails with the from being the partyline email
  connection.partylineRecipients.forEach(function(recipient){

    email = {
      html: connection.mail.html,
      text: connection.mail.text,
      subject: connection.mail.subject,
      to: recipient,
      from_name: connection.partyline,
      from_email: connection.partyline + '@partyline.cc',
      headers: {
          'Reply-To': connection.partyline + '@partyline.cc'
      }
    };

    if (connection.mail.attachments && connection.mail.attachments.length > 0) {
      email.attachments = [];
      for (var i = connection.mail.attachments.length - 1; i >= 0; i--) {
        email.attachments.push({
          type: connection.mail.attachments[i].contentType,
          name: connection.mail.attachments[i].fileName,
          content: connection.mail.attachments[i].content
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
*/





// var http = require('http');
// http.createServer(function (req, res) {
//   res.writeHead(200, {'Content-Type': 'text/plain'});
//   res.end('Welcome to Partyline! Join for free simply email us at signup@partyline.cc with the participants as the CC and we\'ll setup the forward.');
// }).listen(80);
// console.log('HTTP Server is running at http://partyline.cc/');
