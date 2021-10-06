import "../src/dev/dev.js"  //debug module
import DOM from "../src/utility/dom.js"
import Viewport from "../src/viewport/viewport.js"
import Trigger from "../src/utility/trigger.js"
import WorldView from "../src/viewport/world-view.js"

window.onload = () => {
    const grid = DOM.createDiv(document.body, "layout")
    const holder = DOM.createDiv(grid, "main-container")
    const canvas = DOM.createElement("canvas", "main", holder)
    
    const viewport = new Viewport(canvas)
    const view = new WorldView(viewport)
    
    if (window.dev?.isVerbose() ?? 0) {
        function logCanvasSize(x = canvas.width, y = canvas.height) {
            dev.report("canvas.client", `${canvas.clientWidth}x${canvas.clientHeight}`, "canvas.client.old")
            dev.report("canvas.real", `${canvas.width}x${canvas.height}`, "canvas.real.old")
            dev.report("logCanvas.data", `${x}x${y}`)
        }
        
        logCanvasSize()
        Trigger.on(viewport.events.change, logCanvasSize)
        
        function logView() {
            dev.report("view.x", view.current.x, "view.x.last")
            dev.report("view.y", view.current.y, "view.y.last")
            dev.report("view.zoom", view.current.zoom, "view.zoom.last")
        }
        
        logView()
        Trigger.on(view.events.change, logView)
    }
    
    window.canvas = canvas
    window.viewport = viewport
    window.view = view
    
    requestAnimationFrame(frame)
}

function frame() {
    window.viewport.updateSize()
    window.view.advance()

    requestAnimationFrame(frame)
}