import "../../src/dev/dev.js" //debug module
import "../../src/utility/math.js"
import DOM from "../../src/utility/dom.js"
import Web from "../../src/utility/web.js"
import MapScenario from "./scenario.js"
import Surface from "../../src/surface/surface.js"

const SOURCES = {
    nodes : "./shaders/nodes",
    bg : "./shaders/bg",
    bg_nodes : "./shaders/bg_nodes",
}

window.onload = async () => {
    const shaders = await Web.loadShaders(SOURCES)
    
    window.stopServiceWorkerLoader?.()
    document.getElementById("loader").remove()
    
    // layout
    const grid = DOM.createDiv(document.body, "layout")
    const holder = DOM.createDiv(grid, "main-container")
    const canvas = DOM.createElement("canvas", "main", holder)
    
    const surface = new Surface(canvas, {
        sources: shaders,
        
        scenarios: {
            map : MapScenario
        }
    })

    surface.setScenario("map")
    surface.activate()
    
    window.surface = surface
    
    createNodes(16, surface)
}

function createNodes(amount, surface) {
    const nodes = []
    
    let distance = 0
    let angle = 0
    for (let i = 0; i < amount; i++) {
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
    
    const scene = surface.scenarios.map.scene

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
    
    window.nodes = nodes
}
