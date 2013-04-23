(function(exports) {
  
  var files = {
    puzzleImg : "Rye8F.jpg"
  }
  
  var SimpleResourceLoader = function(resDir) {
    this.resDir = resDir;
    this.resources = {};
    this.left = Object.size(files);
  }

  SimpleResourceLoader.prototype.loadAll = function() {
    var that = this;
    for (var filename in files) {
      var res = new Image();
      res.src = this.resDir + "/" + files[filename];
      res.onload = function() {
        that.left--;
        if(that.left == 0) {
          if(typeof that.onReady == "function")
            that.onReady();
        }
      };
      this.resources[filename] = res;
    }
  }
  
  exports.ResourceLoader = SimpleResourceLoader
  
})(window);