(function(exports) {
  
  var Puzzle = function(htiles, vtiles) {
    this.htiles = htiles;
    this.vtiles = vtiles;
    this.state = {};
    this.tileWidth = Math.floor(Puzzle.WIDTH / this.htiles);
    this.tileHeight = Math.floor(Puzzle.HEIGHT / this.vtiles);
  }
  
  Puzzle.WIDTH = 598;
  Puzzle.HEIGHT = 598;
  
  var createId = function(x,y) {
    return (new String(x) + new String(y));
  };
  
  Puzzle.prototype.getOppositeSide = function(sideId) {
    if(sideId === 'left') return 'right';
    if(sideId === 'right') return 'left';
    if(sideId === 'bottom') return 'top';
    if(sideId === 'top') return 'bottom';
  }
  
  var getOppositeGender = function(gender) {
    if(gender === Side.FEMALE) return Side.MALE;
    return Side.FEMALE;
  };
  
  var getRandomIntFunc = function  (a, b) {
    return function() {
      return (Math.floor( Math.random()* (1+b-a) ) ) + a;
    }
  };
  
  var dnaDie = getRandomIntFunc(10, 40);
  var genderDie = getRandomIntFunc(0,1);
  Puzzle.prototype.genderizeTileSides = function() {
    var tiles = this.state.tiles;
    for(var tId in tiles) {
      var tile = tiles[tId];
      for(var sideId in tile.sides) {
        var side = tile.sides[sideId];
        if(side.type === Side.INNER) {
          var neighborSide = tiles[side.neighborId].sides[this.getOppositeSide(sideId)];
          var nGender = neighborSide.gender;
          if (typeof nGender !== 'undefined') {
            side.gender = getOppositeGender(nGender);
            side.dna = neighborSide.dna;
          } else {
            if(genderDie() === 0)  // Random gender
              side.gender = Side.FEMALE;
            else 
              side.gender = Side.MALE;
            side.dna = dnaDie();
            //side.dna = 10; 
          }
        }
      }
    }
  };
  
  Puzzle.prototype.loadDefaultState = function() {
    this.state = {
      tiles : {}
    };
   
    for(var i = 0; i < this.htiles; i++) {
      for(var j = 0; j < this.vtiles; j++) {
        var tId = createId(i,j);
        this.state.tiles[tId] = new Tile(i,j, this);
      }
    }
    this.genderizeTileSides();
    return this;
  }
  
  var json2Tile = function(params, puzzle) {
    if(!params)
      return;
    var tile = new Tile(params.originX, params.originY, puzzle);
    tile.selected = params.selected;
    for(var sideId in params.sides) {
      var side = params.sides[sideId];
      if(typeof side.gender !== 'undefined') {
        tile.sides[sideId].gender = side.gender;
      }
      if(typeof side.neighborId !== 'undefined') {
        tile.sides[sideId].neighborId = side.neighborId;
      }
      if(typeof side.dna !== 'undefined') {
        tile.sides[sideId].dna = side.dna;
      }
    }
    return tile;
  }
  
  Puzzle.prototype.load = function(dumpedState) {
    var tiles = dumpedState.tiles;
    this.state = {
      tiles: {}
    };
    for(var objId in tiles) {
      var obj = tiles[objId];
      var id = createId(obj.originX, obj.originY);
      this.state.tiles[id] = json2Tile(obj, this);
    }
    return this;
  }
  
  Puzzle.prototype.dump = function() {
    var tiles = this.state.tiles;
    var dumpedState = {
      tiles : {}
    }
    for(var tileId in tiles) {
      dumpedState.tiles[tileId] = tiles[tileId].toJson();
    }
    return dumpedState;
  }

  var Side = function(type) {
    this.type = type;
    this.connected = false;
  };
  
  Side.prototype.toJson = function() {
    var json = {
      type : this.type
    }
    if(typeof this.gender !== 'undefined') {
      json['gender'] = this.gender;
    }
    if(typeof this.neighborId !== 'undefined') {
      json['neighborId'] = this.neighborId;
    }
    if(typeof this.dna !== 'undefined') {
      json['dna'] = this.dna;
    }
    return json;
  };
  
  Side.INNER = 'inner';
  Side.OUTER = 'outer';
  Side.MALE = 'M';
  Side.FEMALE = 'F';
  
  var Tile = function(x, y, puzzle) {
    this.id = createId(x,y);
    this.originX = x;
    this.originY = y;
    this.sides = {};
    this.selected = false;
    if(y === 0) {
      this.sides['top'] = new Side(Side.OUTER);
    } else {
      this.sides['top'] = new Side(Side.INNER);
      this.sides['top'].neighborId = createId(x,y-1);
    }
    
    if(y === puzzle.vtiles-1) {
      this.sides['bottom'] = new Side(Side.OUTER);
    } else {
      this.sides['bottom'] = new Side(Side.INNER);
      this.sides['bottom'].neighborId = createId(x,y+1);
    }
    
    if(x === 0) {
      this.sides['left'] = new Side(Side.OUTER);
    } else {
      this.sides['left'] = new Side(Side.INNER);
      this.sides['left'].neighborId = createId(x-1,y);
    }
    
    if(x === puzzle.htiles-1) {
      this.sides['right'] = new Side(Side.OUTER);
    } else {
      this.sides['right'] = new Side(Side.INNER);
      this.sides['right'].neighborId = createId(x+1,y);
    }

    if(!this.type) {
      this.type = 'tile'
    }
  }
  
  Tile.prototype.toJson = function() {
    var sides = {};
    for(var s in this.sides) {
      sides[s] = this.sides[s].toJson()
    }
    return {
      originX : this.originX,
      originY : this.originY,
      sides : sides,
      selected : this.selected
    };
  };
  
  exports.Puzzle = Puzzle;
  exports.Tile = Tile;
  exports.Side = Side;
  
})(typeof global === 'undefined' ? window : exports);