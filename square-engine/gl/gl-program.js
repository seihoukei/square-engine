import SquareGL from "./square-gl.js"

export default class GLProgram {
    constructor(renderer, sources) {
        this.renderer = renderer
        this.sources = sources
    }
    
    init() {
        const debugShaders = window.dev?.isVerbose("shaders")
        const gl = this.renderer.gl
        
        const vertexShader = this.createShader(gl.VERTEX_SHADER, this.sources.vertex, debugShaders)
        const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, this.sources.fragment, debugShaders)
        
        this.program = this.createProgram(vertexShader, fragmentShader, debugShaders)
        
        this.uniforms = this.getParameters(gl.ACTIVE_UNIFORMS, SquareGL.Uniform)
        this.attributes = this.getParameters(gl.ACTIVE_ATTRIBUTES, SquareGL.Attribute)
    }
    
    createShader(type, source, check = false) {
        const gl = this.renderer.gl
        
        const shader = gl.createShader(type)
        gl.shaderSource(shader, source)
        gl.compileShader(shader)
        
        if (!check) return shader
        
        const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
        if (success)
            return shader
        
        const log = `Failed to compile shader:\n${gl.getShaderInfoLog(shader)}`
        gl.deleteShader(shader)
        console.log(log)
        throw new Error (log)
    }
    
    createProgram(vertexShader, fragmentShader, check = false) {
        const gl = this.renderer.gl
        
        const program = gl.createProgram()
        
        gl.attachShader(program, vertexShader)
        gl.attachShader(program, fragmentShader)
        gl.linkProgram(program)
        
        if (!check) return program
        
        const success = gl.getProgramParameter(program, gl.LINK_STATUS)
        if (success)
            return program
        
        const log = gl.getProgramInfoLog(program)
        gl.deleteProgram(program)
        console.log(log)
        throw new Error (log)
    }
    
    getParameters(type, EntryClass) {
        const gl = this.renderer.gl
    
        const result = {}
        const entryCount = gl.getProgramParameter(this.program, type)
    
        for (let i = 0; i < entryCount; ++i) {
            const entry = new EntryClass(this.renderer)
            entry.init(this.program, i)
            
            result[entry.name] = entry
        }
        
        return result
    }
    
    use() {
        const gl = this.renderer.gl
        gl.useProgram(this.program)
    }
    
    setUniform(name, value) {
        const uniform = this.uniforms[name]
        if (uniform === undefined)
            return false
        uniform.set(value)
        return true
    }
    
}