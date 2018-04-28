Modules.Game = Game

function Game() {
    var self = this
    this.lastId = 1
    this.frame = 0
    this.heartBeat = setInterval(10,function() { self.nextFrame() })
}

Game.prototype.startWithBoard = function(board) {
    this.boardApi = board
   
    board.fieldSize(20,20)    
    board.viewSize(640,400)
    var entity = board.newEntity()
    
    entity.putTo(0,0)

}

Game.prototype.moveSelected = function(x,y) {
    if (this.selected) {
        var selected = this.selected
        var startAt = {x: selected.x, y: selected.y}

        var board = this.boardApi
        board.animMove(100, selected, x,y, function(success) {
            if (success) {
                var fields = board.fields
                fields.at(startAt.x, startAt.y).put(null)
                fields.at(startAt.x+x, startAt.y+y).put(selected)
                selected.x += x
                selected.y += y

            }
            else {
                throw "not implemented"
            }
        })
    }
}

Game.prototype.onClick = function(x,y) {
    var coords = this.boardApi.fieldOf(x,y)
    var atCoords = this.boardApi.fields.at(coords.x, coords.y).is()
    if (atCoords) {
        atCoords.markSelected(true)
        if (this.selected) {
            this.selected.markSelected(false)
        }
        this.selected = atCoords
    }
    else {
        var entity = this.boardApi.newEntity()
        entity.putTo(coords.x,coords.y)
        entity.debugId(this.lastId++)
    }
}
