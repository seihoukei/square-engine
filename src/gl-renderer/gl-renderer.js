import Trigger from "../utility/trigger.js"

export default class GLRenderer {
    active = false
    boundFrame = this.frame.bind(this)
    nextFrame = -1
    
    constructor(viewport) {
        this.viewport = viewport
        this.canvas = this.viewport.canvas
        this.init()
    }
    
    init() {
        this.gl = this.canvas.getContext("webgl2", {alpha : false})
    }
    
    setScene(scene) {
        this.scene = scene
        
        this.scene.prepare(this.view)
    }
    
    setView(view) {
        this.view = view
    
        this.scene?.updateView(this.view)
    
        this.viewTrigger?.cancel()
        this.viewTrigger = Trigger.on(this.view.events.change, () => {
            this.scene.updateView(this.view)
        })
    }

    activate() {
        if (this.active || !this.scene || !this.view)
            return
        
        this.active = true
        
        this.scene.activate()
        this.nextFrame = requestAnimationFrame(this.boundFrame)
    }
    
    deactivate() {
        if (!this.active)
            return
        
        this.active = false
        
        this.scene?.deactivate()
        
        cancelAnimationFrame(this.nextFrame)
        this.nextFrame = -1
        
        delete this.then
    }
    
    frame(now) {
        if (this.view === undefined || this.scene === undefined || !this.active) {
            return this.deactivate()
        }
    
        if (this.countStart === undefined) {
            this.countFrames = 0
            this.countStart = now
        }
    
        if (now - this.countStart > 200) {
            if (window.dev?.isVerbose("fps"))
			    dev.report("fps",(1000 * this.countFrames / (now - this.countStart)).toFixed(2))
            this.countStart = now
            this.countFrames = 0
        }
    
        this.countFrames++
    
        this.viewport.updateSize()

        const deltaTime = now - (this.then ?? now)
        this.then = now
    
        this.view.advance(deltaTime)
    
        const gl = this.gl
    
        gl.clearColor(0.0, 0.0, 0.0, 0.0)
        gl.clear(gl.COLOR_BUFFER_BIT)
    
        this.scene.render(now)
    
        gl.bindVertexArray(null)
    
        this.nextFrame = requestAnimationFrame(this.boundFrame)
    }
    
    
}