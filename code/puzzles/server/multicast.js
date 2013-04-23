/** Simulates reliable multicast communication */

var net = require('net');
var tcphelper = require('./lib/tcp_helper.js');

var clients = {};

var sendToGroup = function(group, id, params) {
  for(var g in group) {
    if(typeof clients[group[g]] !== 'undefined') {
      clients[group[g]].write(JSON.stringify({
        id : id,
        params : params
      }) + '\n');
    } else {
      console.log('clients group is out of date');
    }
  }
};

var server = net.createServer();
server.on('connection', function(c) { //'connection' listener
  
  console.log('client ' + c.remoteAddress + ' connected');
  var remoteAddress = c.remoteAddress;
  clients[remoteAddress] = c;
  
  c.on('data', function(data) {
    tcphelper.readJson(data, function(json) {
      sendToGroup(json.group, json.id, json.params);
    });
  });
  
  c.on('end', function() {
    console.log('client' + remoteAddress  + 'disconnected');
    delete clients[remoteAddress];
  });

});


server.listen(8124, function() {
  console.log('multicast server bound');
});