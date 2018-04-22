Modules.Game = Game

function Game() {
    this.lastId = 1
}

Game.prototype.startWithBoard = function(board) {
    this.boardApi = board
   
    board.fieldSize(20,20)    
    board.viewSize(640,400)
    var entity = board.newEntity()
    
    entity.putTo(0,0)

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
