import GLTypes from "./gl-types.js"

export default class GLBuffer {
    initialized = false
    changed = false
    forceUpdate = false
    
    lastGl
    
    constructor(renderer, length = 1024) {
        this.length = length
    
        this.renderer = renderer
    }
    
    initData(glType) {
        if (this.initialized) {
            if (glType !== this.glType)
                throw new Error ("Buffer type collision")
            
            return
        }
        
        this.glType = glType
        this.glData = GLTypes.get(glType)
        
        this.data = new this.glData.arrayType(this.glData.size * this.length)
        
        this.initialized = true
    }
    
    initBuffer() {
        if (this.lastGl === this.renderer.gl)
            return
        
        this.buffer = this.renderer.gl.createBuffer()
        this.lastGl = this.renderer.gl
    }
    
    setInstanceAttribute(instance, ...values) {
        if (!this.initialized)
            throw new Error("Buffer not initialized")

        if (typeof values[0] === "object")
            values = values[0]
        
        const size = values.length
        
        this.data.set(values, instance * size)
        this.changed = true
    }
    
    update(forced = false) {
        if (!this.changed && !forced)
            return
    
        const gl = this.renderer.gl
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
        gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.DYNAMIC_DRAW)
        
        this.changed = this.forceUpdate
    }
}