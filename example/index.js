import "../src/dev/dev.js"  //debug module
import DOM from "../src/utility/dom.js"
import Viewport from "../src/viewport/viewport.js"
import Trigger from "../src/utility/trigger.js"
import WorldView from "../src/viewport/world-view.js"
import GLRenderer from "../src/gl-renderer/gl-renderer.js"
import GLScene from "../src/gl-renderer/gl-scene.js"
import GLSceneElement from "../src/gl-renderer/gl-scene-element.js"
import SHADERS from "./shaders.js"

class BGElement extends GLSceneElement {
    build() {
        this.useProgram("bg")
        this.setViewUniforms("u_center", "u_size", "u_pixel")
        this.setTimeUniform("u_now")
        this.setPositionAttribute("a_position")
        this.setLength(1)
    }
}

class NodeElement extends GLSceneElement {
    build() {
        this.setAlpha(true)
        this.useProgram("nodes")
        this.setViewUniforms("u_center", "u_size", "u_pixel")
        this.setTimeUniform("u_now")
        this.setPositionAttribute("a_position")
        this.setAttributeBuffer("a_node_position", "nodePosition", 1024)
        this.setLength(1024)
    }
}

class TestGLScene extends GLScene {
    build() {
        this.addElement(new BGElement(this))
//        this.addElement(new NodeElement(this))
    }
}

window.onload = () => {
    // layout
    const grid = DOM.createDiv(document.body, "layout")
    const holder = DOM.createDiv(grid, "main-container")
    const canvas = DOM.createElement("canvas", "main", holder)
    
    // renderer
    const viewport = new Viewport(canvas)
    const renderer = new GLRenderer(viewport, SHADERS)
    
    const view = new WorldView(viewport)
    const scene = new TestGLScene(renderer)
    
    renderer.setScene(scene)
    renderer.setView(view)
    
    renderer.activate()
    
    
    
    if (window.dev?.isVerbose() ?? 0) {
        function logCanvasSize(x = canvas.width, y = canvas.height) {
            dev.report("canvas.client", `${canvas.clientWidth}x${canvas.clientHeight}`, "canvas.client.old")
            dev.report("canvas.real", `${canvas.width}x${canvas.height}`, "canvas.real.old")
            dev.report("logCanvas.data", `${x}x${y}`)
        }
        
        logCanvasSize()
        Trigger.on(viewport.events.change, logCanvasSize)
        
        function logView() {
            const info = {}
            view.getSize(info)
            view.getView(info)
            
            dev.report("view.center", `${info.x}, ${info.y}`, "view.center.last")
            dev.report("view.zoom", info.zoom, "view.zoom.last")
            dev.report("view.size", `${info.width}, ${info.height}`, "view.size.last")
        }
        
        logView()
        Trigger.on(view.events.change, logView)
    }

    window.renderer = renderer
}
