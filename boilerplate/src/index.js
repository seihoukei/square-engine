import "./square-engine/dev/dev.js" //debug module
import "./square-engine/utility/math.js"
import Web from "./square-engine/utility/web.js"
import UI from "./ui/ui.js"
import GameActivity from "./scenarios/game/game-activity.js"
import GameScene from "./scenarios/game/game-scene.js"

const SOURCES = {
    bg : "./shaders/bg",
}

window.onload = async () => {
//    window.dev?.setVerbose("shaders", 0)
    
    const shaders = await Web.loadShaders(SOURCES)
    
    window.stopServiceWorkerLoader?.()
    document.getElementById("loader").remove()

    window.ui = new UI({
        shaders,
        
        scenarios : {
            game : {
                scene : GameScene,
                sceneSettings: {
                    viewSettings: {
                        expandView: 100,
                    }
                },
                activity : GameActivity,
            }
        },
        
        defaultScenario : "game",
    })
    
}
