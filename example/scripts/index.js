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
    
    surface.scenarios.map.createNodes(32)
    
//    window.surface = surface
}
