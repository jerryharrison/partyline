

var simplesmtp = require("simplesmtp");
var MailParser = require("mailparser").MailParser;
var mailparser = new MailParser({
        streamAttachments : true
    });

var partylines = {
  bni: [
    {email: 'fivesecondrule@gmail.com', name: 'Jerry Harrison', type: 'to'},
    {email: 'fivesecondrule@gmail.com', name: 'Jerry Luna', type: 'to'}
  ]
};

var smtp = simplesmtp.createServer({
  SMTPBanner:"Partyline Server", 
  name: 'partyline.cc',
  validateRecipients : true,
  disableDNSValidation: true,
  debug: false
});
smtp.listen(25);

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
    // var object = clone(mailObject);
    
    // object.id = makeId();
    // object.time = new Date();
    // object.read = false;
    
    // store.push(object);

    logger.log('Saving email: ', mailObject.subject);
    logger.log('Connection Object: ', connection);

    // eventEmitter.emit('new');
  });

});

smtp.on('data', function(connection, chunk){
  connection.saveStream.write(chunk);
});

smtp.on('dataReady', function(connection, done){
  connection.saveStream.end();
  // ABC is the queue id to be advertised to the client
  // There is no current significance to this.
  done(null, 'ABC123');
});