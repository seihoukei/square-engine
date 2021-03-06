import SquareGL from "./square-gl.js"

export default class GLBuffer {
    initialized = false
    changed = false
    forceUpdate = false
    
    lastGl
    
    constructor(renderer, length = 1024) {
        this.length = length
    
        this.renderer = renderer
    }
    
    initData(glType, size) {
        if (this.initialized) {
            if (glType !== this.glType)
                throw new Error ("Buffer type collision")
            
            return
        }
        
        this.glType = glType
        this.glData = SquareGL.Types.get(glType)
    
        this.size = size ?? this.glData.size
        
        this.type = this.glData.type
        this.data = new this.glData.arrayType(this.size * this.length)
        
        this.updateData()
        
        this.initialized = true
    }
    
    initBuffer() {
        if (this.lastGl === this.renderer.gl)
            return
        
        this.buffer = this.renderer.gl.createBuffer()
        this.lastGl = this.renderer.gl
    }
    
    setInstanceData(instance, ...values) {
        if (!this.initialized)
            throw new Error("Buffer not initialized")

        if (typeof values[0] === "object")
            values = values[0]
        
        this.data.set(values, instance * this.size)
        this.changed = true
    }
    
    update(forced = false) {
        if (!this.changed && !forced)
            return
    
        this.updateData()
        
        this.changed = this.forceUpdate
    }
    
    bind() {
        const gl = this.renderer.gl
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
    }
    
    updateData(data = this.data, type = WebGL2RenderingContext.DYNAMIC_DRAW) {
        const gl = this.renderer.gl
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
        gl.bufferData(gl.ARRAY_BUFFER, data, type)
    }
    
    setData(data) {
        this.data.set(data, 0)
    }
}
