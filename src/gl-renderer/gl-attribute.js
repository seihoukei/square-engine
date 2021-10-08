import GLTypes from "./gl-types.js"

export default class GLAttribute {
    isPosition = false
    
    constructor(renderer) {
        this.renderer = renderer
    }
    
    setBuffer(buffer, options = {}) {
        const gl = this.renderer.gl
    
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.enableVertexAttribArray(this.address)
    
        this.setPointer(
            options.normalized ?? false,
            options.offset ?? 0,
            options.stride ?? 0)
    
        if (!this.isPosition)
            gl.vertexAttribDivisor(this.address, 1)
    }
    
    setPosition(value) {
        this.isPosition = value
    }
    
    init(program, index) {
        const gl = this.renderer.gl
    
        const data = gl.getActiveAttrib(program, index)
        this.name = data.name
    
        const type = GLTypes.get(data.type)
        this.type = type.type
        this.size = type.size
        this.arrayType = type.arrayType
    
        const address = gl.getAttribLocation(program, this.name)
        this.address = address
    
        this.setPointer = gl[type.attributePointerSetter]?.bind(gl, address, type.size, type.type)
    }
}