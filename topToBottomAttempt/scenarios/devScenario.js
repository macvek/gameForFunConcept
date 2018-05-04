var GameEngine = require('../GameEngine.js')
var ConsoleDraw = require('../ConsoleDraw.js')
var gameEngine = new GameEngine()
var mapBuilder = gameEngine.mapBuilder()

mapBuilder.defineGrid(10,10)
var layer = mapBuilder.addLayer(0)
var dummyA = layer.newEntity()
dummyA.putAt(1,1)
dummyA.conSymbol ='A'

var dummyB = layer.newEntity()
dummyB.conSymbol ='B'
dummyB.putAt(8,1)

gameEngine.on(gameEngine.EVENTS.start).add( () => console.log("game started"))
gameEngine.on(gameEngine.EVENTS.beforeFrame).add( (count) => console.log(">> frame: "+count))
var consoleDraw = new ConsoleDraw()
consoleDraw.clearBeforeDraw = true

gameEngine.on(gameEngine.EVENTS.afterFrame).add( () => {
    consoleDraw.drawLayer(layer)
})

var frameCallbacks = gameEngine.on(gameEngine.EVENTS.frame)
frameCallbacks.add( (frame) => {
    dummyA.fire(gameEngine.EVENTS.frame, frame)
    dummyB.fire(gameEngine.EVENTS.frame, frame)
})

gameEngine.on(gameEngine.EVENTS.start).add( () => {
    dummyA.mode = 'wait'
    dummyA.waitFrames = 0
})

dummyB.entityScript( when => {
    when.on(gameEngine.EVENTS.frame).add( (entity, frame) => {
        entity.area.randomMove()
    })
})

dummyA.entityScript( when => {
    var anyKey = {}
    var events = {
        idle: anyKey,
        follow: anyKey,
        roam: anyKey,
        found: anyKey,
    }
    gameEngine.populateKeys(events)
    when.on(events.idle).add((entity) => {
        if (entity.area.distanceTo(dummyB) < 5) {
            entity.fire(events.follow)
        }
        else {
            entity.fire(events.roam)
        }
    })

    when.on(events.follow).add((entity) => entity.mode = 'follow')
    when.on(events.roam).add((entity) => entity.mode = 'roam')
    when.on(events.found).add((entity) => {
        console.log("found it!!")
        entity.mode = 'wait'
        entity.waitFrames = 5
    })

    when.on(gameEngine.EVENTS.frame).add( (entity, frame) => {
        if (entity.area.rectDistanceTo(dummyB) == 1) {
            entity.fire(events.found)
        }
        
        switch(entity.mode) {
            case 'wait':
                if (entity.waitFrames-- <= 0) {
                    entity.fire(events.idle);
                }
                break;
            case 'roam':
                entity.area.randomMove()
                entity.fire(events.idle)
                break;
            case 'follow':
                entity.area.moveTowards(dummyB)
                break;
        }
    })
})


gameEngine.start()
setInterval(function() {gameEngine.frame()},1000)


