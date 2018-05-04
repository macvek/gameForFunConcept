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
dummyB.putAt(2,1)



var consoleDraw = new ConsoleDraw()
consoleDraw.drawLayer(layer)




