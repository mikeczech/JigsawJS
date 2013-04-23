(function(exports) {
  
  var buffer = '';

  var readJson = function(data, callback) {
    buffer += data;
    var breakIndex = buffer.indexOf('\n');
    while(breakIndex !== -1) {
      var jsonMsg = JSON.parse(buffer.slice(0, breakIndex));
      if(typeof callback === 'function') {
        callback(jsonMsg);
      }
      buffer = buffer.slice(breakIndex + 1);
      breakIndex = buffer.indexOf('\n');
    }
  };
  
  exports.readJson = readJson;
  
})(exports);