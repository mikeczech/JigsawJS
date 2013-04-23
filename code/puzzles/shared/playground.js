(function(exports) {
  
  var Playground = function(puzzle, srand) {
    this.puzzle = puzzle;
    this.positionData = {};
    this.selectOk = false;
    
    
    if(typeof random === 'undefined') {
      this.random = Math.random
    } else {
      this.random = srand.random;
    }
    
    var that = this;
    this.getRandomIntFunc = function  (a, b) {
      var rand = that.random;
      return function() {
        return (Math.floor( rand()* (1+b-a) ) ) + a;
      }
    };
    this.reset();
  };
  
  Playground.BORDEROFFSET = 20;
  
  
  
  Playground.prototype.reset = function() {
    var tiles = this.puzzle.state.tiles;
    var windowWidth = 1024;
    var windowHeight = 768;
    var xposDie = this.getRandomIntFunc(0, windowWidth - 2*this.puzzle.tileWidth);
    var yposDie = this.getRandomIntFunc(0, windowHeight - 2*this.puzzle.tileHeight);
  
  
    /*for(var tId in tiles) {
      this.positionData[tId] = {
        x : tiles[tId].originX * this.puzzle.tileWidth,
        y : tiles[tId].originY * this.puzzle.tileHeight
      };
    }*/
  
    for(var tId in tiles) {
      this.positionData[tId] = {
        x : xposDie(),
        y : yposDie()
      };
    }
  };
  
  Playground.prototype.dump = function() {
    return this.positionData;
  };
  
  Playground.prototype.load = function(positions) {
    this.positionData = positions;
  };
  
  Playground.prototype.select = function(tId) {
     this.puzzle.state.tiles[tId].selected = true;
  };
  
  Playground.prototype.move = function(tileId, x, y) {
    this.positionData[tileId] = {
      x : x,
      y : y
    };
    if(typeof this.layer !== 'undefined') {
      var node  = this.layer.get('.' + tileId)[0];
      node.setX(x);
      node.setY(y);
    }
    // Move also connected tiles
    /*var sides = this.puzzle.state.tiles[tileId].sides;
    var tileWidth = this.puzzle.tileWidth;
    var tileHeight = this.puzzle.tileHeight;
    this.positionData[tileId].done = true;
    for(var sideId in sides) {
      var side = sides[sideId];
      if(side.type === 'inner' && side.connected && !this.positionData[side.neighborId].done) {
        if(sideId === 'right') {
          this.move(side.neighborId, x + tileWidth - (sides['left'].type === 'outer' ? Playground.BORDEROFFSET : 0), y);
        } else if(sideId === 'left') {
          this.move(side.neighborId, x - tileWidth + (this.puzzle.state.tiles[side.neighborId].sides['left'].type === 'outer' ? Playground.BORDEROFFSET : 0), y);
        } else if(sideId === 'top') {
          this.move(side.neighborId, x, y - tileHeight + (this.puzzle.state.tiles[side.neighborId].sides['top'].type === 'outer' ? Playground.BORDEROFFSET : 0));
        } else if(sideId === 'bottom') {
          this.move(side.neighborId, x, y + tileHeight - (sides['top'].type === 'outer' ? Playground.BORDEROFFSET : 0));
        }
      }
    }*/
    delete this.positionData[tileId].done;
  };
  
  Playground.prototype.getSideMask = function(tId, sideId) {
    var sides = this.puzzle.state.tiles[tId].sides;
    var offset = (sides[sideId].gender === 'M' ? 0 : Playground.BORDEROFFSET);
    var tileWidth = this.puzzle.tileWidth;
    var tileHeight = this.puzzle.tileHeight;
    var pos = this.positionData;
    if(sideId === 'right') {
      return {
        x : pos[tId].x  + tileWidth - offset,
        y : pos[tId].y,
        width : Playground.BORDEROFFSET,
        height : tileHeight
      } 
    } else if(sideId === 'left') {
      return {
        x : pos[tId].x - (sides[sideId].gender === 'F' ? 0 : Playground.BORDEROFFSET),
        y : pos[tId].y,
        width : Playground.BORDEROFFSET,
        height : tileHeight
      }
    } else if(sideId === 'top') {
      return {
        x : pos[tId].x,
        y : pos[tId].y - (sides[sideId].gender === 'F' ? 0 : Playground.BORDEROFFSET),
        width : tileWidth,
        height : Playground.BORDEROFFSET
      }
    } else if(sideId === 'bottom') {
      return {
        x : pos[tId].x,
        y : pos[tId].y + tileHeight - offset,
        width : tileWidth,
        height : Playground.BORDEROFFSET
      }
    }
  };
  
  Playground.prototype.checkOverlap = function(tIdA, sideIdA, tIdB, sideIdB) {
    var maskA = this.getSideMask(tIdA, sideIdA);
    var maskB = this.getSideMask(tIdB, sideIdB);
    if(maskA.x <= maskB.x + maskB.width && maskA.x >= maskB.x) {
      if(maskA.y <= maskB.y + maskB.height && maskB.y >= maskB.y) {
        return true;
      }
    }
    return false;
  };
  
  Playground.prototype.layDown = function(tId, offsetX, offsetY) {
    this.puzzle.state.tiles[tId].selected = false;
    // Is some side overlapping with its origin neighbor? Then connect both tiles!
    /*var sides = this.puzzle.state.tiles[tId].sides;
    var tileWidth = this.puzzle.tileWidth;
    var tileHeight = this.puzzle.tileHeight;
    for(var sideId in sides) {
      var side = sides[sideId];
      if(side.type == 'inner' && !side.connected) {
        var neighborSideId = this.puzzle.getOppositeSide(sideId);
        if(this.checkOverlap(tId, sideId, side.neighborId, neighborSideId)) {
          console.log(tId + ' and ' + side.neighborId + ' connected');
          sides[sideId].connected = true;
          this.puzzle.state.tiles[side.neighborId].sides[neighborSideId].connected = true;
        }
      }
    }*/
    //this.move(tId, offsetX, offsetY);
  };
  
  exports.Playground = Playground;
  
})(typeof global === 'undefined' ? window : exports)