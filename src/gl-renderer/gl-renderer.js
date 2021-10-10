import Trigger from "../utility/trigger.js"
import GLProgram from "./gl-program.js"
import GLPositionBuffers from "./gl-position-buffers.js"

export default class GLRenderer {
    active = false
    boundFrame = this.frame.bind(this)
    nextFrame = -1
    programs = {}
    target
    
    constructor(viewport, sources) {
        this.viewport = viewport
        this.canvas = this.viewport.canvas
        this.sources = sources
        
        Trigger.on(this.viewport.events.change, (width, height) => {
            this.resetViewport()
        })
        
        this.init()
    }
    
    resetViewport() {
        if (this.target === undefined)
            this.gl.viewport(0, 0, this.viewport.width, this.viewport.height)
    }
    
    setTarget(texture, clear = false, layer = 0) {
        this.target = texture
        const gl = this.gl
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.renderFramebuffer)
        texture.setFramebufferSlot(0, layer)
        if (clear)
            gl.clear(gl.COLOR_BUFFER_BIT)
    }
    
    resetTarget() {
        if (!this.target)
            return
        
        delete this.target
        
        const gl = this.gl
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        
        this.resetViewport()
    
    }
    
    init() {
        this.gl = this.canvas.getContext("webgl2", {alpha : false})
        this.positionBuffers = new GLPositionBuffers(this)
        
        for (let [name, sources] of Object.entries(this.sources)) {
            this.programs[name] ??= new GLProgram(this, sources)
            this.programs[name].init()
        }
        
        if (this.scene)
            this.scene.init()
        
        this.renderFramebuffer = this.gl.createFramebuffer()
        
        this.resetTarget()
        this.resetViewport()
    }
    
    setScene(scene) {
        this.scene = scene
    
        this.scene.setView(this.view)
    }
    
    setView(view) {
        this.view = view
    
        this.scene?.setView(this.view)
    
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