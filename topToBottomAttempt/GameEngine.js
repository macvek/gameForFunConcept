module.exports = class GameEngine {
    
    constructor() {
        this.frameCount = 0
        
        var asKey = {}
        this.EVENTS = {
            beforeFrame : asKey,
            frame : asKey,
            afterFrame : asKey,
            start : asKey
        }
        
        this.populateKeys(this.EVENTS)
        this.handlers = new CallbackGroupContainer(this.EVENTS)
    }

    populateKeys(dict) {
        for (var key in dict) {
            dict[key] = key
        }
    }

    on(eventType) {
        return this.handlers.on(eventType)
    }

    mapBuilder() {
        return new MapBuilder(this)
    }

    registerMap(map) {
        if (this.map) {
            throw "map already registered"
        }
        this.map = map
    }

    start() {
        this.on(this.EVENTS.start).trigger(this)
    }

    frame() {
        this.on(this.EVENTS.beforeFrame).trigger(this.frameCount)
        this.on(this.EVENTS.frame).trigger(this.frameCount)
        this.on(this.EVENTS.afterFrame).trigger(this.frameCount)
        this.frameCount++
        
    }


}

class MapBuilder {
    constructor(gameEngine) {
        this.gameEngine
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

    moveIfPossible(ent, nPos) {
        var grid = this.grid
        var pos = ent.position

        if (!grid[nPos.y][nPos.x]) {
            grid[pos.y][pos.x] = null
            grid[nPos.y][nPos.x] = ent
        }

        ent.position = nPos
    }
}

class Entity {
    constructor(layer) {
        this.layer = layer
        this.eventHandler = new CallbackGroupContainer()
        this.area = new Area(this, layer)
    }

    putAt(x,y) {
        if (this.position) {
            throw "putAt should be set for unpositioned entity only"
        }
        this.position = new XY(x,y)
        this.layer.putAtEmpty(this)
        
    }

    entityScript(builder) {
        this.eventHandler = new CallbackGroupContainer()
        this.eventHandler.allowNewEvents = true
        builder(this.eventHandler)
    }

    fire(eventType) {
        var args = [this]
        for (var i=1;i<arguments.length;i++) {
            args.push(arguments[i])
        }
        this.eventHandler.optional(eventType).on(x => x.trigger.apply(x, args))
    }
}

class Area {
    constructor(entity, layer) {
        this.entity = entity
        this.layer = layer    
    }

    rectDistanceTo(other) {
        this.assertSameLayer(other.layer)
        return this.entity.position.rectDistanceTo(other.position)
    }

    distanceTo(other) {
        this.assertSameLayer(other.layer)
        return this.entity.position.distanceTo(other.position)
    }

    randomMove() {
        var pos = this.entity.position;
        var rX = Math.floor(Math.random()*2) - 1
        var rY = Math.floor(Math.random()*2) - 1
        if (rX == 0 && rY == 0) { 
            return;
        }

        var off = new XY(rX,rY)

        var nPos = pos.offsetBy(off).bounds(this.layer.sizeX, this.layer.sizeY)
        this.layer.moveIfPossible(this.entity, nPos)
    }

    moveTowards(other) {
        this.assertSameLayer(other.layer)
        var direction = this.entity.position.directionTo(other.position).round()
        this.layer.moveIfPossible(this.entity, this.entity.position.offsetBy(direction))
    }

    assertSameLayer(layer) {
        if (layer != this.layer) {
            throw "layer mismatch"
        }
    }
}

class XY {
    constructor(x,y) {
        this.x = x
        this.y = y
    }

    rectDistanceTo(other) {
        return Math.max(Math.abs(other.x-this.x), Math.abs(other.y - this.y))
    }

    distanceTo(other) {
        return Math.sqrt(Math.pow(other.x-this.x,2), Math.pow(other.y-this.y,2))
    }

    offsetBy(other) {
        return new XY(this.x + other.x, this.y + other.y)
    }

    directionTo(other) {
        var dist = this.distanceTo(other)
        return new XY(
            (other.x - this.x)/dist,
            (other.y - this.y)/dist
        )
    }
    
    bounds(mX,mY) {
        var nX = Math.min(Math.max(this.x,0),mX)
        var nY = Math.min(Math.max(this.y,0),mY)
        return nX == this.x && nY == this.y ? this : new XY(nX,nY)
    }

    round() {
        return new XY(Math.round(this.x), Math.round(this.y))
    }
}

class CallbackGroupContainer {
    constructor(events = {}) {
        this.events = {}
        for (var key in events) {
            this.events[key] = new CallbackGroup()
        }
        this.allowNewEvents = false
    }

    optional(eventType) {
        if (this.events[eventType]) {
            var toRet = this.events[eventType]
            return {on: (callback) => callback(toRet)}
        }
        else {
            return {on: ()=>{}}
        }
    }

    on(eventType) {
        if (!this.events[eventType]) {
            if (!this.allowNewEvents) {
                throw "unsupported event type "+eventType
            }
            else {
                this.events[eventType] = new CallbackGroup()
            }
        }
        return this.events[eventType]
    }
}

class CallbackGroup {
    constructor() {
        this.group = []
    }

    trigger() {
        for (var each of this.group) {
            each.apply(null, arguments)
        }
    }
    
    add(callback) {
        this.remove(callback)
        this.group.push(callback)
    }

    remove(callback) {
        var index = this.group.indexOf(callback)
        if (index > -1) {
            this.group.splice(index,1)
        }
    }
}