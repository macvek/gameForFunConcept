module.exports = class GameEngine {
    mapBuilder() {
        return new MapBuilder()
    }
}

class MapBuilder {
    
    constructor() {
        this.sizeX = 0
        this.sizeY = 0
        this.layers = []
    }

    defineGrid(x,y) {
        this.sizeX = x
        this.sizeY = y
    }

    addLayer(level) {
        var layer = new Layer(level,this.sizeX,this.sizeY)
        this.layers.push(layer)
        this.sortLayers()
        return layer
    }

    sortLayers() {
        this.layers.sort( (a,b) => a.level < b.level ? -1 : a.level == b.level ? 0 : 1)
    }
}

class Layer {

    constructor(level,x,y) {
        this.level = level
        this.sizeX = x
        this.sizeY = y
        this.grid = new Array(y)
        for (var i=0;i<y;i++) {
            this.grid[i] = new Array(x)
        }
    }

    newEntity() {
        return new Entity(this)
    }

    putAtEmpty(ent) {
        var p = ent.position
        if (this.grid[p.y][p.x]) {
            throw "Error: position already set "+p.x+" "+p.y
        }
        this.grid[p.y][p.x] = ent
    }
}

class Entity {
    constructor(layer) {
        this.layer = layer
    }

    putAt(x,y) {
        if (this.position) {
            throw "putAt should be set for unpositioned entity only"
        }
        this.position = new XY(x,y)
        this.layer.putAtEmpty(this)
        
    }
}

class XY {
    constructor(x,y) {
        this.x = x
        this.y = y
    }
}
