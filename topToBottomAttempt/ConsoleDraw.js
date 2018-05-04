module.exports = class ConsoleDraw {
    drawLayer(layer) {
        drawLine(border('/','-','\\'))

        for (var y=0;y<layer.sizeY;y++) {
            var line = border('|',' ','|')
            for (var x=0;x<layer.sizeX;x++) {
                if (layer.grid[y][x]) {
                    var each = layer.grid[y][x]
                    line[x+1] = each.conSymbol ? each.conSymbol : 'x'
                }
            }
            drawLine(line)
        }

        drawLine(border('\\','-','/'))

        function drawLine(line) {
            console.log(line.join(''))
        }

        function border(left,middle,right) {
            var b = []
            b.push(left)
            for (var i=1;i<layer.sizeX+1;i++) {
                b.push(middle)
            }
            b.push(right)
            return b
        }
    }
}