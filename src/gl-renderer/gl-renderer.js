import Trigger from "../utility/trigger.js"
import GLProgram from "./gl-program.js"
import GLPositionBuffers from "./gl-position-buffers.js"
import Viewport from "../viewport/viewport.js"

export default class GLRenderer {
    active = false
    boundFrame = this.frame.bind(this)
    nextFrame = -1
    programs = {}
    target
    
    constructor(canvas, settings = {}) {
        this.canvas = canvas
        this.viewport = new Viewport(this.canvas, settings.viewportSettings)
        
        this.sources = settings.sources
        
        Trigger.on(this.viewport.events.change, () => {
            this.resetViewport()
        })
        
        this.init()
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
    
    getViewport() {
        return this.viewport
    }
    
    resetViewport() {
        if (this.target === undefined)
            this.gl.viewport(0, 0, this.viewport.width, this.viewport.height)
    }
    
    setTarget(texture, clearColor = null, layer = 0) {
        this.target = texture
        const gl = this.gl
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.renderFramebuffer)
        
        texture.setFramebufferSlot(0, layer)
        if (clearColor !== null) {
            gl.clearColor(...clearColor)
            gl.clear(gl.COLOR_BUFFER_BIT)
        }
    }
    
    resetTarget() {
        if (!this.target)
            return
        
        delete this.target
        
        const gl = this.gl
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        
        this.resetViewport()
    
    }
    
    setScene(scene) {
        this.scene?.deactivate()
        this.scene = scene
        this.scene?.activate()
    }
    
    activate() {
        if (this.active || !this.scene)
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
        if (this.scene === undefined || !this.active) {
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
    
    
        const gl = this.gl
    
        gl.clearColor(0.0, 0.0, 0.0, 0.0)
        gl.clear(gl.COLOR_BUFFER_BIT)
    
        this.scene.view.advance(deltaTime)
        this.scene.render(now)
    
        gl.bindVertexArray(null)
    
        this.nextFrame = requestAnimationFrame(this.boundFrame)
    }
}