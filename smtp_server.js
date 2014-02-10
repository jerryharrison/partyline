
var config = require("./config.json");
var simplesmtp = require("simplesmtp");
var MailParser = require("mailparser").MailParser;
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill(config.mandrill);

var smtp = simplesmtp.createServer({
  SMTPBanner:"Partyline Server", 
  name: 'partyline.cc',
  validateRecipients : true,
  disableDNSValidation: true,
  debug: false
});
smtp.listen(25);

// Faux partyline data.
var partylines = {
  bni: [
    {email: 'fivesecondrule@gmail.com', name: 'Jerry Harrison', type: 'to'},
    {email: 'jerry@lunadesk.com', name: 'Jerry Luna', type: 'to'}
  ]
};

smtp.on('validateSender', function(connection, email, done){
  console.log('validateSender');
  return done();
});

smtp.on('validateRecipient', function(connection, email, done){
  email = email.split("@");
  var partyline = {};
      partyline.name = email[0].toLowerCase().trim();
      partyline.host = email.pop().toLowerCase().trim();

  if (partylines[partyline.name]) {
    partyline.recipients = partylines[partyline.name];
    connection.partyline = partyline;
    return done();
  } else {
    return done(new Error('Invalid Partyline'));
  }
});

smtp.on('startData', function(connection){

  connection.saveStream = new MailParser({
    streamAttachments: false // need to be set to true for below listener to work.
  });
    
  // connection.saveStream.on('attachment', function (attachment){
    // var output = fs.createWriteStream(path.join(tempDir, attachment.contentId));
    // attachment.stream.pipe(output);
  // });

  connection.saveStream.on('end', function (mailObject){

    console.log('Saving email: ', mailObject.subject);
    console.log('Partylines Object: ', connection.partyline);

    var email = {
      subject: mailObject.subject,
      from_name: connection.partyline,
      from_email: connection.partyline.name + '@partyline.cc',
      headers: {
        'Reply-To': connection.partyline.name + '@partyline.cc'
      }
    };

    if (mailObject.html) {
      email.html = mailObject.html;
    } else {
      email.text = mailObject.text;
    }

    if (mailObject.attachments && mailObject.attachments.length > 0) {
      email.attachments = [];
      for (var i = mailObject.attachments.length - 1; i >= 0; i--) {
        email.attachments.push({
          type: mailObject.attachments[i].contentType,
          name: mailObject.attachments[i].fileName,
          content: mailObject.attachments[i].content
        });
      }
    }

    // Loop over all the partyline recipients for this partyline
    // And send them all individual emails with the from being the partyline email
    if (connection.partyline && connection.partyline.recipients) {
      connection.partyline.recipients.forEach(function(recipient){

        email.to = recipient;

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

smtp.on('data', function(connection, chunk){
  connection.saveStream.write(chunk);
});

smtp.on('dataReady', function(connection, done){
  connection.saveStream.end();
  // ABC123 is the queue id to be advertised to the client
  // There is no current significance to this.
  done(null, 'ABC123');
});

