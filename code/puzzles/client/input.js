(function(exports) {
  
  var MouseInput = function(puzzle, renderer) {
    this.puzzle = puzzle;
    this.renderer = renderer;
    var that = this;
    
    var canvas = $('#canvas');
    canvas.mousedown(function(e) {
      var r = that.renderer;
      var targetX = e.offsetX;
      var targetY = e.offsetY;
      var selectedTileId = r.playground.getHighestTileAt(targetX, targetY);
      if(typeof selectedTileId !== 'undefined') {
        console.log('selected tile ' + selectedTileId);
        socket.emit('select', {tileId : selectedTileId});  
      }
    });
    
    canvas.mousemove(function(e) {
      var p = that.renderer.playground;
      if(typeof p.lastSelectedTileId !== 'undefined') {
        var r = that.renderer;
        socket.emit('move', {
          tileId : p.lastSelectedTileId,
          targetX : e.offsetX - Math.floor(r.tileWidth / 2),
          targetY : e.offsetY - Math.floor(r.tileHeight / 2)
        });
      }
    });
    
    canvas.mouseup(function(e) {
      var p = that.renderer.playground;
      if(typeof p.lastSelectedTileId !== 'undefined') {
        var r = that.renderer;
        var targetX = e.offsetX - Math.floor(r.tileWidth / 2);
        var targetY = e.offsetY - Math.floor(r.tileHeight / 2);
        socket.emit('laydown', {
          tileId : p.lastSelectedTileId, 
          targetX : targetX, 
          targetY : targetY
        });
        delete p.lastSelectedTileId;
      }
    });
  };
  
  var TouchInput = function(puzzle, renderer) {
    this.puzzle = puzzle;
    this.renderer = renderer;
    var that = this;
    
    var canvas = document.getElementById('canvas');
    canvas.addEventListener('touchstart', function(event)  {
      var r = that.renderer;
      var targetX = event.pageX;
      var targetY = event.pageY;
      var selectedTileId = r.playground.getHighestTileAt(targetX, targetY);
      if(typeof selectedTileId !== 'undefined') {
        console.log('selected tile ' + selectedTileId);
        socket.emit('select', {tileId : selectedTileId});  
      }
    });
    
    canvas.addEventListener('touchmove', function(event)  {
      
      var p = that.renderer.playground;
      if(typeof p.lastSelectedTileId !== 'undefined') {
        var r = that.renderer;
        socket.emit('move', {
          tileId : p.lastSelectedTileId,
          targetX : event.pageX - Math.floor(r.tileWidth / 2),
          targetY : event.pageY - Math.floor(r.tileHeight / 2)
        });
      }
    });
    
    canvas.addEventListener('touchend', function(event)  {
      var p = that.renderer.playground;
      if(typeof p.lastSelectedTileId !== 'undefined') {
        var r = that.renderer;
        var targetX = event.pageX - Math.floor(r.tileWidth / 2);
        var targetY = event.pageY - Math.floor(r.tileHeight / 2);
        socket.emit('laydown', {
          tileId : p.lastSelectedTileId, 
          targetX : targetX, 
          targetY : targetY
        });
        delete p.lastSelectedTileId;
      }
    });
  };
  
  if (window.Touch) {
    exports.Input = TouchInput;
  } else {
    exports.Input = MouseInput;
  }
  
  
})(window);