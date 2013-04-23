(function(exports) {
  
  var networkConfig = {
    mcastAddress : '192.168.178.71',
    mcastPort : 8124,
    loginAddress : '192.168.178.71',
    loginPort : 8125
  };
  
  var serverConfig = {
    isLeader : true
  };
  
  exports.network = networkConfig;
  exports.server = serverConfig;
  
})(exports);