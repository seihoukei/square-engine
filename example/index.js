import "../src/dev/dev.js"  //debug module
import DOM from "../src/utility/dom.js"
import Viewport from "../src/viewport/viewport.js"
import Trigger from "../src/utility/trigger.js"
import WorldView from "../src/viewport/world-view.js"
import GLRenderer from "../src/gl-renderer/gl-renderer.js"
import GLScene from "../src/gl-renderer/gl-scene.js"
import GLSceneElement from "../src/gl-renderer/gl-scene-element.js"

class BGElement extends GLSceneElement {
    build() {
        this.useProgram("bg")
        this.setPositionAttribute("a_position")
        this.setLength(1)
    }
}

class NodeElement extends GLSceneElement {
    build() {
        this.useProgram("nodes")
        this.setPositionAttribute("a_position")
        this.setAttributeBuffer("a_node_position", "nodePosition", 1024)
        this.setLength(1024)
    }
}

class TestGLScene extends GLScene {
    build() {
        this.addElement(this, new BGElement(this))
        this.addElement(this, new NodeElement(this))
    }
}

window.onload = () => {
    const grid = DOM.createDiv(document.body, "layout")
    const holder = DOM.createDiv(grid, "main-container")
    const canvas = DOM.createElement("canvas", "main", holder)
    
    const viewport = new Viewport(canvas)
    const view = new WorldView(viewport)
    const renderer = new GLRenderer(canvas)
    
    const scene = new TestGLScene(renderer)
    
    renderer.setScene(scene)
    
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
    window.renderer = renderer
    
    
    requestAnimationFrame(frame)
}

function frame() {
    window.viewport.updateSize()
    window.view.advance()
    
    window.renderer.setView(window.view)
    window.renderer.render()

    requestAnimationFrame(frame)
}