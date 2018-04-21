Modules.Game = Game

function Game() {

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
    var entity = this.boardApi.newEntity()
    entity.putTo(coords.x,coords.y)
}