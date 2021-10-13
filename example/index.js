import "../src/dev/dev.js" //debug module
import "../src/utility/math.js"
import DOM from "../src/utility/dom.js"
import GLScene from "../src/gl-renderer/gl-scene.js"
import GLSceneElement from "../src/gl-renderer/gl-scene-element.js"
import Web from "../src/utility/web.js"
import Pointer from "../src/pointer/pointer.js"
import PointerActivity from "../src/pointer/pointer-activity.js"
import Viewport from "../src/viewport/viewport.js"
import WorldView from "../src/viewport/world-view.js"

const SOURCES = {
    nodes : "./shaders/nodes",
    bg : "./shaders/bg",
    bg_nodes : "./shaders/bg_nodes",
}

class BGElement extends GLSceneElement {
    build() {
        this.setAlpha(true)
        this.setMaxLength(1)
        this.useProgram("bg")
        this.setViewUniforms("u_center", "u_size")
        this.setTimeUniform("u_now")
        this.setPositionAttribute("a_position")
        this.setTexture("u_bg_nodes", "bg_nodes")
    }
}

class NodesElement extends GLSceneElement {
    build() {
        this.setAlpha(true)
        this.setMaxLength(1024, 0)
        this.useProgram("nodes")
        this.setViewUniforms("u_center", "u_size")
//        this.setTimeUniform("u_now")
        this.setPositionAttribute("a_position")
        this.setAttributeBuffer("a_node_data", "nodeData")
        this.setNormalizedAttributeBuffer("a_node_color", "nodeColor")
//        this.setTargetTexture("bg_nodes", true)
    }
}

class BGNodesElement extends GLSceneElement {
    build() {
        this.setAlpha(true)
        this.setMaxLength(1024, 0)
        this.useProgram("bg_nodes")
        this.setViewUniforms("u_center", "u_size")
//        this.setTimeUniform("u_now")
        this.setPositionAttribute("a_position")
        this.setAttributeBuffer("a_node_data", "nodeData")
        this.setTargetTexture("bg_nodes", [0.5,0.5,0.5,1.0])
    }
}

class TestGLScene extends GLScene {
    build() {
        this.createViewportTexture("bg_nodes")
        
        this.addElement(new BGNodesElement(this), "bg_nodes")
        this.addElement(new BGElement(this), "bg").setUniform("u_front", 0)
        this.addElement(new NodesElement(this), "nodes")
        this.addElement(new BGElement(this), "fg").setUniform("u_front", 1)
    }
}

class MapActivity extends PointerActivity {
    name = "Map"
    defaultState = "Empty"

    build() {
        this.addAction("target", (input, cellNext, emptyNext) => {
            console.log("target", input, cellNext, emptyNext)
        })
        
        this.addActions({
            cell_action : (input) => {
                console.log("cell", input)
            },
            
            cell_special_action : (input) => {
                console.log("cell_special", input)
            },
    
            empty_action : (input) => {
                console.log("cell", input)
            },
    
            empty_space_special_action : (input) => {
                console.log("empty_special", input)
            },
            
        })
        
        this.addActions({
            drag_view : (input) => {
            
            },
            pinch_view : (input) => {
            
            },
            zoom_view : (input) => {
            
            },
        })
        
        this.addStateTemplate("Browsable", `
            mouse.move = $1
            
            wheel.scroll = zoom_view

            lmb.down = anchor(mouse) {
                lmb.up = unanchor(mouse) $2 ^
                
                mouse.move = >DragView
            }
            
            first.down = anchor(first) unanchor(second) {
                first.up = unanchor(first) $2 ^
                idle.200 = $3
                
                first.move = >DragView
            }
            
            rmb.down = {
                rmb.up = $3 ^
            }
            
            #DragView {
                mouse first second.move_real = drag_view
                first second.down = anchor(first, second) >PinchView
                mouse first second.up = $1
            
                #PinchView {
                    first second.move_real = pinch_view
                    
                    first.up = unanchor(first) \
                               anchor(second) \
                               >DragView
                               
                    second.up = unanchor(second) \
                                anchor(first) \
                                >DragView
                }
            }
            
        `)
        
        this.addState("Empty", `
            %Browsable(
                target(>Node, >Empty),
                empty_action,
                empty_space_special_action
            )
        `)

        this.addState("Node", `
            %Browsable(
                target(>Node, >Empty),
                cell_action,
                cell_special_action
            )
        `)
    }
}

window.onload = async () => {
    window.dev?.setVerbose("canvasSize", 0)
    window.dev?.setVerbose("viewSize", 0)
//    window.dev?.setVerbose("shaders", 0)
    
    const shaders = await Web.loadShaders(SOURCES)
    
    window.stopServiceWorkerLoader?.()
    document.getElementById("loader").remove()
    
    // layout
    const grid = DOM.createDiv(document.body, "layout")
    const holder = DOM.createDiv(grid, "main-container")
    const canvas = DOM.createElement("canvas", "main", holder)
    
    const viewport = new Viewport(canvas)
    window.view = new WorldView(viewport)
    const pointer = new Pointer(viewport)
        .addActivity(new MapActivity())
    
    pointer.setView(view)
    pointer.setActivity("Map")
    
    window.pointer = pointer

    requestAnimationFrame(frame)
/*
    // renderer
    const renderer = new GLRenderer(canvas, {
        sources: shaders,
    })
    
    const scene = new TestGLScene(renderer, {
        viewSettings: {
            expandView: 100,
        }
    })
    
    const pointer = new Pointer(renderer.viewport)
        .addActivity(new BrowseActivity())
        
    pointer.setView(scene.view)
    pointer.setActivity("Map")
    
    renderer.setScene(scene)
    
    renderer.activate()
    
    const nodes = []
    
    let distance = 0
    let angle = 0
    for (let i = 0; i < 16; i++) {
        angle += Math.PI / 2 + Math.random() * Math.PI
        const size = Math.random() * 50 + 30
        
        const node = {
            index : i,
            x : distance * Math.cos(angle),
            y : distance * Math.sin(angle),
            size,
            color: [
                Math.random() * 255 | 0,
                Math.random() * 255 | 0,
                Math.random() * 255 | 0,
                255,
            ]
        }
        
        nodes.push(node)
        
        if (i === 0)
            distance += 80
        
        distance += size
    }
    
    const bounds = {
        left : Infinity,
        right : -Infinity,
        top : -Infinity,
        bottom : Infinity,
    }
    
    const dataBuffer = scene.getBuffer("nodeData")
    const colorBuffer = scene.getBuffer("nodeColor")
    for (let node of nodes) {
        if (node.x < bounds.left) bounds.left = node.x
        if (node.x > bounds.right) bounds.right = node.x
        if (node.y < bounds.bottom) bounds.bottom = node.y
        if (node.y > bounds.top) bounds.top = node.y
        
        dataBuffer.setInstanceData(node.index, node.x, node.y, node.size, node.index)
        colorBuffer.setInstanceData(node.index, node.color)
    }
    bounds.left -= 100
    bounds.bottom -= 100
    bounds.right += 100
    bounds.top += 100
    scene.setBoundaries(bounds)
    scene.setLength("nodes", nodes.length)
    scene.setLength("bg_nodes", nodes.length)
    
    if (window.dev?.isVerbose("canvasSize") ?? 0) {
        function logCanvasSize(x = canvas.width, y = canvas.height) {
            dev.report("canvas.client", `${canvas.clientWidth}x${canvas.clientHeight}`, "canvas.client.old")
            dev.report("canvas.real", `${canvas.width}x${canvas.height}`, "canvas.real.old")
            dev.report("logCanvas.data", `${x}x${y}`)
        }
    
        logCanvasSize()
        Trigger.on(renderer.events.change, logCanvasSize)
    }

    if (window.dev?.isVerbose("viewSize") ?? 0) {
        function logView() {
            const info = {}
            scene.view.getSize(info)
            scene.view.getView(info)
            
            dev.report("view.center", `${info.x}, ${info.y}`, "view.center.last")
            dev.report("view.zoom", info.zoom, "view.zoom.last")
            dev.report("view.size", `${info.width}, ${info.height}`, "view.size.last")
        }
        
        logView()
        Trigger.on(scene.view.events.change, logView)
    }

    window.renderer = renderer*/
}

function frame() {
    view.advance()
    requestAnimationFrame(frame)
}
