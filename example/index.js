import "../src/dev/dev.js"  //debug module
import "../src/utility/math.js"
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
        this.setMaxLength(1)
        this.useProgram("bg")
        this.setViewUniforms("u_center", "u_size", "u_pixel")
        this.setTimeUniform("u_now")
        this.setPositionAttribute("a_position")
    }
}

class NodesElement extends GLSceneElement {
    build() {
        this.setAlpha(true)
        this.setMaxLength(1024, 0)
        this.useProgram("nodes")
        this.setViewUniforms("u_center", "u_size", "u_pixel")
        this.setTimeUniform("u_now")
        this.setPositionAttribute("a_position")
        this.setAttributeBuffer("a_node_data", "nodeData")
    }
}

class TestGLScene extends GLScene {
    build() {
        this.addElement(new BGElement(this), "bg")
        this.addElement(new NodesElement(this), "nodes")
    }
}

window.onload = () => {
    window.dev?.setVerbose("canvasSize", 0)
    window.dev?.setVerbose("viewSize", 0)
//    window.dev?.setVerbose("shaders", 0)
    
    // layout
    const grid = DOM.createDiv(document.body, "layout")
    const holder = DOM.createDiv(grid, "main-container")
    const canvas = DOM.createElement("canvas", "main", holder)
    
    // renderer
    const viewport = new Viewport(canvas)
    const renderer = new GLRenderer(viewport, SHADERS)
    
    const view = new WorldView(viewport, {
        expandView: 100,
    })
    const scene = new TestGLScene(renderer)
    
    renderer.setScene(scene)
    renderer.setView(view)
    
    renderer.activate()
    
    const nodes = []
    
    let distance = 0
    for (let i = 0; i < 16; i++) {
        const angle = Math.random() * Math.PI * 2
        const size = Math.random() * 50 + 30
        if (i > 0)
            distance += size + 20
        
        const node = {
            index : i,
            x : distance * Math.cos(angle),
            y : distance * Math.sin(angle),
            size,
        }
        
        nodes.push(node)
        
        distance += size
    }
    
    const bounds = {
        left : Infinity,
        right : -Infinity,
        top : -Infinity,
        bottom : Infinity,
    }
    
    const buffer = scene.getBuffer("nodeData")
    for (let node of nodes) {
        if (node.x < bounds.left) bounds.left = node.x
        if (node.x > bounds.right) bounds.right = node.x
        if (node.y < bounds.bottom) bounds.bottom = node.y
        if (node.y > bounds.top) bounds.top = node.y
        
        buffer.setInstanceData(node.index, node.x, node.y, node.size)
    }
    bounds.left -= 100
    bounds.bottom -= 100
    bounds.right += 100
    bounds.top += 100
    view.setBoundaries(bounds)
    scene.setLength("nodes", nodes.length)
    
    if (window.dev?.isVerbose("canvasSize") ?? 0) {
        function logCanvasSize(x = canvas.width, y = canvas.height) {
            dev.report("canvas.client", `${canvas.clientWidth}x${canvas.clientHeight}`, "canvas.client.old")
            dev.report("canvas.real", `${canvas.width}x${canvas.height}`, "canvas.real.old")
            dev.report("logCanvas.data", `${x}x${y}`)
        }
    
        logCanvasSize()
        Trigger.on(viewport.events.change, logCanvasSize)
    }

    if (window.dev?.isVerbose("viewSize") ?? 0) {
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
