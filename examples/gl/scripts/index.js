import "../../../square-engine/dev/dev.js" //debug module
import "../../../square-engine/utility/math.js"
import DOM from "../../../square-engine/utility/dom.js"
import Web from "../../../square-engine/utility/web.js"
import MapScenario from "./scenario.js"
import SquareSurface from "../../../square-engine/surface/square-surface.js"

const SOURCES = {
    nodes : "./shaders/nodes",
    bg : "./shaders/bg",
    bg_nodes : "./shaders/bg_nodes",
    regions : "./shaders/regions"
}

const NODE_COUNT = 256

window.onload = async () => {
    const shaders = await Web.loadShaders(SOURCES)
    
    window.stopServiceWorkerLoader?.()
    document.getElementById("loader").remove()
    
    // layout
    const grid = DOM.createDiv(document.body, "layout")
    const holder = DOM.createDiv(grid, "main-container")
    const canvas = DOM.createElement("canvas", "main", holder)
    
    const surface = new SquareSurface(canvas, {
        sources: shaders,
        
        scenarios: {
            map : MapScenario
        }
    })

    surface.setScenario("map")
    surface.activate()
    
    surface.scenarios.map.createNodes(NODE_COUNT)
    
    surface.scenarios.map.view.setZoom(0.25)
    
//    window.surface = surface
}
