import "../../../square-engine/dev/dev.js" //debug module
import "../../../square-engine/utility/math.js"
import DOM from "../../../square-engine/utility/dom.js"
import MapScenario from "./scenario.js"
import SquareSurface from "../../../square-engine/surface/square-surface.js"
import Square2D from "../../../square-engine/2d/square-2d.js"

const NODE_COUNT = 256

window.onload = async () => {
    window.stopServiceWorkerLoader?.()
    document.getElementById("loader").remove()
    
    // layout
    const grid = DOM.createDiv(document.body, "layout")
    const holder = DOM.createDiv(grid, "main-container")
    const canvas = DOM.createElement("canvas", "main", holder)
    
    const surface = new SquareSurface(canvas, {
        rendererClass : Square2D,
        
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
