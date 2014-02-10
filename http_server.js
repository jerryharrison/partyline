
var http = require('http');

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Welcome to Partyline! Join for free simply email us at signup@partyline.cc with the participants as the CC and we\'ll setup the forward.');
}).listen(80);
console.log('HTTP Server is running at http://partyline.cc/');