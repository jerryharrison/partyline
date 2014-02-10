
var http = require('http');

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Welcome to Partyline!\r\nJoin for free.\r\nSimply email [group_name]@partyline.cc (ex. stjameschurch@partyline.cc) with the participants as the CC and we\'ll setup the rest.\r\nFrom this point on everyone in your partyline can simply email your group\'s partyline and you\'re good to go\r\n\r\nHappy Group Emailin\'');
}).listen(80);
console.log('HTTP Server is running at http://partyline.cc/');