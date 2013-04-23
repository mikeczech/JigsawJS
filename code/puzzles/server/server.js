var config = require('./config.js');
var io = require('socket.io').listen(5050);
var dgram = require('dgram');
var net = require('net');
var tcphelper = require('./lib/tcp_helper.js');
var puzzlejs = new require('../shared/puzzles.js');
var playgroundjs = new require('../shared/playground.js');
var srand = require('srand');

var Puzzle = puzzlejs.Puzzle;
var Playground = playgroundjs.Playground;
var puzzle = new Puzzle(5,5);
puzzle.loadDefaultState();

srand.seed(4223);
var playground = new Playground(puzzle, srand);

/** Connect to multicast simulator **/
var mcast = net.connect(config.network.mcastPort, config.network.mcastAddress, function() {
  console.log('client connected to mcast');
});

var access = {};

mcast.on('data', function(data) {
  console.log('received ' + data);
  
  tcphelper.readJson(data, function(json) {
    var params = json.params;
    if(json.id === 'move') {
      playground.move(params.tileId, params.targetX, params.targetY);
      io.sockets.emit('move', params);
    } else if(json.id === 'deselect') {
      playground.layDown(params.tileId, params.targetX, params.targetY);
      delete access[params.tileId];
      io.sockets.emit('deselect', params);
    } else if(json.id === 'select') {
      
      if(config.server.isLeader) {
        if(typeof access[params.tileId] === 'undefined') { // tile not accessed currently
          access[params.tileId] = params.clientId;
          mcast.write(JSON.stringify({
            id : 'accept',
            params : params,
            group : members
          })+'\n');
        } else { // tile already accessed from some client
          mcast.write(JSON.stringify({
            id : 'reject',
            params : params,
            group : members
          })+'\n');
        }
      }

    } else if(json.id === 'accept') {
      io.sockets.emit('accept', params);
    } else if(json.id === 'reject') {
      io.sockets.emit('reject', params);
    }
  });

});

mcast.on('end', function() {
  console.log('client disconnected');
});


/** Retrieve super node list from login server **/
var login = net.connect(config.network.loginPort, config.network.loginAddress, function() {
  console.log('client registered at login server');
});

login.on('data', function(msg) {
  console.log('received data ' + msg);
  
  members = JSON.parse(msg).nodes;  // global mcast group
  
  /** After login accept connections from ordinary hosts **/
  
  console.log('Accept connections from ordinary hosts..')
  io.sockets.on('connection', function(socket) {

    socket.emit('start', {
      state : puzzle.dump(),
      positions : playground.dump(),
      clientId : socket.handshake.address.address
    });

    socket.on('move', function(data) {
      console.log('recv move from ordinary host:', data);
      mcast.write(JSON.stringify({
        id : 'move',
        params : data,
        group : members
      }) + '\n');
    });

    socket.on('select', function(data) {
      console.log('recv select from ordinary host:', data);
      data['clientId'] = socket.handshake.address.address;
      mcast.write(JSON.stringify({
        id : 'select',
        params : data,
        group : members
      })+'\n');
    });
    
    socket.on('deselect', function(data) {
      console.log('recv deselect from ordinary host:', data);
      mcast.write(JSON.stringify({
        id : 'deselect',
        params : data,
        group : members
      })+'\n');
    });

  });
  
  
});

login.on('end', function() {
  console.log('client disconnected from login server');
});
