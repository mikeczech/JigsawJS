$(function() {

  var resourceLoader = new ResourceLoader("resources");
  resourceLoader.onReady = function() {
    
    socket = io.connect('http://' + config.brokerAddress);
    var puzzle = new Puzzle(5,5);
    var playground = new Playground(puzzle);
    var renderer = new Renderer(puzzle, resourceLoader, playground);
    //var input = new Input(puzzle, renderer);
    
    socket.on('start', function(data) {
      console.log('recv state', data);
      clientId = data.clientId;
      console.log("Client ID is " + clientId);
      puzzle.load(data.state);
      renderer.playground.load(data.positions);
      renderer.load();
    });
    
    socket.on('move', function(data) {
      console.log('recv move', data);
      if(data.tileId !== playground.lastSelectedTileId) {
        playground.move(data.tileId, data.targetX, data.targetY);
      }
      if(typeof playground.layer !== 'undefined') {
        playground.layer.draw();
      }
    });
    
    socket.on('accept', function(data) {
      console.log('recv select acknowledgement', data);
      if(data.clientId === clientId) {
        playground.selectOk = true;
      } else {
        renderer.layerTiles[data.tileId].setDraggable(false);
      }
    });
    
    socket.on('reject', function(data) {
      console.log('recv reject', data);
    });
    
    socket.on('deselect', function(data) {
      console.log('recv deselect', data);
      playground.layDown(data.tileId, data.targetX, data.targetY);
      renderer.layerTiles[data.tileId].setDraggable(true);
      if(typeof playground.layer !== 'undefined') {
        playground.layer.draw();
      }
    });
    
    socket.on('reconnecting', function() {
      window.location.replace("http://" + config.loginAddress);
    });
  
  };
  resourceLoader.loadAll();
  
  
});