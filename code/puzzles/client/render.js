(function(exports) {
  
  function getDistance(touch1, touch2){
      var x1 = touch1.clientX;
      var x2 = touch2.clientX;
      var y1 = touch1.clientY;
      var y2 = touch2.clientY;

      return Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)));
  }
  
  var CanvasRenderer = function(game, resLoader, playground) {
    this.resources = resLoader.resources;
    this.game = game;
    this.stage = new Kinetic.Stage({
        container: "puzzle",
        width: window.innerWidth,
        height: window.innerHeight
    });
    this.layer = new Kinetic.Layer();
    ///
    var startDistance = undefined;
    var startScale = 1;
    
    var stage = this.stage;
    var layer = this.layer;
    stage.on("touchmove", function(evt){
        var touch1 = evt.touches[0];
        var touch2 = evt.touches[1];

        if (touch1 && touch2) {
            if (startDistance === undefined) {
                startDistance = getDistance(touch1, touch2);
            }
            else {
                var dist = getDistance(touch1, touch2);
                var scale = (dist / startDistance) * startScale;
                stage.setScale(scale);

                // center layer
                var x = stage.width * (1 - scale) / 2;
                var y = stage.height * (1 - scale) / 2;
                layer.setPosition(x, y);
                alert("Hello");
                stage.draw();
            }
        }
    });

    stage.on("touchend", function(){
        startDistance = undefined;
        startScale = stage.scale.x;
    });
    ///
    this.tileWidth = Math.floor(Puzzle.WIDTH / this.game.htiles);
    this.tileHeight = Math.floor(Puzzle.HEIGHT / this.game.vtiles);
    this.playground = playground;
    this.layerTiles = {};
  }
  
  CanvasRenderer.prototype.load = function() {
    var tiles = this.game.state.tiles;
    var width = this.tileWidth;
    var height = this.tileHeight;
    var offset = function(side) {
      if(side.type === Side.OUTER) //|| side.gender === Side.FEMALE)
        return 0;
      return Playground.BORDEROFFSET;
    };
    
    var that = this;
    this.playground.layer = this.layer;
    for(var id in tiles) {
      // anonymous function to induce scope
      
      (function() {
        var tile = tiles[id];
        var pos = that.playground.positionData[id];
        
        var tmpMemCanvas = document.createElement('canvas');
        tmpMemCanvas.setAttribute('width', Puzzle.WIDTH);
        tmpMemCanvas.setAttribute('height', Puzzle.HEIGHT);
        var tmpCtx = tmpMemCanvas.getContext('2d');
        tmpCtx.save();
        clipPuzzle(tmpCtx, tile.originX * width, tile.originY * height, width, height, tile);
        tmpCtx.drawImage(that.resources.puzzleImg, 0, 0);
        tmpCtx.restore();

        var memCanvas = document.createElement('canvas');
        memCanvas.setAttribute('width', width + offset(tile.sides['left']) + offset(tile.sides['right']));
        memCanvas.setAttribute('height', height +  offset(tile.sides['top']) + offset(tile.sides['bottom']));
        
        var ctx = memCanvas.getContext('2d');
        ctx.drawImage(tmpMemCanvas,
          tile.originX * width - offset(tile.sides['left']),
          tile.originY * height - offset(tile.sides['top']),
          width + offset(tile.sides['left']) + offset(tile.sides['right']) ,
          height +  offset(tile.sides['top']) + offset(tile.sides['bottom']),
          0,
          0,
          width + offset(tile.sides['left']) + offset(tile.sides['right']) ,
          height +  offset(tile.sides['top']) + offset(tile.sides['bottom'])
        );
        var img = new Kinetic.Image({  
            x: pos.x,
            y: pos.y,
            image: memCanvas,
            width: width + offset(tile.sides['left']) + offset(tile.sides['right']),
            height: height + offset(tile.sides['top']) + offset(tile.sides['bottom']),
            name: id,
            draggable: true
        });
    
        img.on("dragstart", function() {
            console.log('dragstart');
            socket.emit('select', {
              tileId : tile.id,
              clientId : 1
            });
            img.moveToTop();
            that.playground.lastSelectedTileId = tile.id;
            that.layer.draw();
        });

        img.on("dragmove", function() {
            document.body.style.cursor = "pointer";
            var position = img.getPosition();
            if(that.playground.selectOk) {
              that.playground.move(tile.id, position.x, position.y);
              socket.emit('move', {
                tileId : tile.id,
                targetX : position.x,
                targetY : position.y
              });
            } else {
              var pos = that.playground.positionData[tile.id]; 
              img.setX(pos.x);
              img.setY(pos.y);
            }
            
            that.layer.draw();
        });
        
        img.on("dragend", function() {
          document.body.style.cursor = "default";
          var position = img.getPosition();
          //that.playground.layDown(tile.id, position.x, position.y);
          delete that.playground.lastSelectedTileId;
          that.playground.selectOk = false;
          socket.emit('deselect', {
            tileId : tile.id, 
            targetX : position.x, 
            targetY : position.y
          });
          that.layer.draw();
        });

        that.layerTiles[tile.id] = img;
        that.layer.add(img);
      })();

    }
    
    this.stage.add(this.layer);
  };

  var clipPuzzle = function(ctx, x, y, width, height, tile) {
    var partLengthW = width / 2;
    //var partLengthH = height / 2;
    var partLengthH = partLengthW;
    ctx.beginPath();
    
    var drawSide = function(side, partLength) {
      if(side.type === Side.OUTER) {
        ctx.lineTo(width, 0);
      } else {
        var genderFactor = side.gender === Side.MALE ? 1 : -1;
        ctx.quadraticCurveTo(10, 0, partLength-10, 0);
        ctx.quadraticCurveTo(partLength-side.dna, genderFactor*(-15), partLength-5, genderFactor*(-15));
        ctx.quadraticCurveTo(partLength, genderFactor*(-18), partLength+5, genderFactor*(-15));
        ctx.quadraticCurveTo(partLength+side.dna, genderFactor*(-15), partLength+10, 0);
        ctx.quadraticCurveTo(width-10, 0, width, 0);
      }
    };   
    
    ctx.translate(x,y);
    ctx.moveTo(0,0);
    
    drawSide(tile.sides['top'], partLengthW);
    
    ctx.translate(width, 0);
    ctx.rotate(90 * (Math.PI/180));
    
    drawSide(tile.sides['right'], partLengthH);
    
    ctx.translate(width, 0);
    ctx.rotate(90 * (Math.PI/180));
    
    drawSide(tile.sides['bottom'], partLengthW);
    
    ctx.translate(width, 0);
    ctx.rotate(90 * (Math.PI/180));
    
    drawSide(tile.sides['left'], partLengthH);
    
    ctx.rotate(90 * (Math.PI/180));
    ctx.translate(-x,-y-width);
    
    ctx.closePath();
    
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.clip();
    
    
  };
  
  exports.Renderer = CanvasRenderer
  
})(window)