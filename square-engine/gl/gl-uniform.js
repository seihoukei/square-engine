import SquareGL from "./square-gl.js"

export default class GLUniform {
    constructor(renderer) {
        this.renderer = renderer
    }
    
    init(program, index) {
        const gl = this.renderer.gl
        const data = gl.getActiveUniform(program, index)
    
        this.name = data.name.match(/[^[]*/)[0]
        
        const type = SquareGL.Types.get(data.type)
        this.type = type.type
        this.size = type.size
        this.isTexture = type.isTexture
    
        const address = gl.getUniformLocation(program, data.name)
        this.address = address
        
        this.setArray = gl[type.arraySetter]?.bind(gl, address)
        this.setValue = gl[type.setter]?.bind(gl, address)
    }
    
    set(value) {
        if (typeof value == "object")
            this.setArray(value)
        else
            this.setValue(value)
    }
}