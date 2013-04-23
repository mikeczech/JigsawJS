var express = require('express').createServer();
var net = require('net');

var nodes = ['192.168.178.71'];

var server = net.createServer(function(c) {
  
  c.on('end', function() {
    console.log('client disconnected');
  });
  
  c.write(JSON.stringify({nodes:nodes}) + '\n');
  c.end();

});


server.listen(8125, function() {
  console.log('login server bound');
});

/** Initialize webserver **/
var next = 0;
express.get("/", function(req, res) {
  // Redirect to appropriate broker
  var best = nodes[next]; // Round robin
  next = (next + 1) % nodes.length;
  res.redirect("http://" + best + "/~mike/proseminar/code/codiqa-app/app.html");
});

express.listen(3000);