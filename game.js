Modules.Game = Game

function Game() {
    var self = this
    this.lastId = 1
    this.frame = 0
    this.heartBeat = setInterval(function() { self.nextFrame() },10)
    this.keyStates = {
        keyUp:false,
        keyDown:false,
        keyLeft:false,
        keyRight:false
    }
}

Game.prototype.nextFrame = function() {
    var moveOffsetY = this.keyStates.keyUp?-1:0 + this.keyStates.keyDown?1:0
    var moveOffsetX = this.keyStates.keyLeft?-1:0 + this.keyStates.keyRight?1:0
    if (moveOffsetX || moveOffsetY) {
        this.moveSelected(moveOffsetX,moveOffsetY)
    }
}

Game.prototype.startWithBoard = function(board) {
    this.boardApi = board
   
    board.fieldSize(20,20)    
    board.viewSize(640,400)
    var entity = board.newEntity()
    
    entity.putTo(0,0)

}

Game.prototype.moveSelected = function(x,y) {
    var selected = this.selected
    if (selected && !selected.moving) {
        selected.moving = true
        var startAt = {x: selected.x, y: selected.y}

        var board = this.boardApi
        var fields = board.fields
        
        fields.at(startAt.x+x, startAt.y+y).put(selected)
        board.animMove(100, selected, x,y, function(success) {
            if (success) {
                fields.at(startAt.x, startAt.y).remove(selected)
                
                selected.x += x
                selected.y += y

                selected.moving = false

            }
            else {
                throw "not implemented"
            }
        })
    }
}

Game.prototype.removeSelected = function() {
    if (this.selected) {
        var s = this.selected
        var board = this.boardApi
        board.fields.at(s.x, s.y).remove(s)
        board.removeEntity(s)
        this.selected = null
    }
}

Game.prototype.transformSelected = function() {
    if (this.selected && !this.selected.transformed) {
        this.selected.transformed = true
        this.boardApi.transformEntity(this.selected)
    }
}

Game.prototype.onClick = function(x,y) {
    var coords = this.boardApi.fieldOf(x,y)
    var atCoords = this.boardApi.fields.at(coords.x, coords.y).is()
    if (atCoords.length > 0) {
        var first = atCoords[0]
        first.markSelected(true)
        if (this.selected) {
            this.selected.markSelected(false)
        }
        this.selected = first
    }
    else {
        var entity = this.boardApi.newEntity()
        entity.putTo(coords.x,coords.y)
        entity.debugId(this.lastId++)
    }
}
