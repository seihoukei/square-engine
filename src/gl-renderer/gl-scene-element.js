import GLPositionBuffers from "./gl-position-buffers.js"


export default class GLSceneElement {
    length = 0
    uniforms = {}
    specialUniforms = {}

    constructor(scene) {
        this.scene = scene
        this.renderer = scene.renderer
        this.init()
    }
    
    init() {
        const gl = this.renderer.gl
        this.vao = gl.createVertexArray()
        gl.bindVertexArray(this.vao)
        this.build()
    }
    
    useProgram(name) {
        this.program = this.renderer.programs[name]
    }
    
    setPositionAttribute(name, array = GLPositionBuffers.QUAD_ARRAYS.CENTERED) {
        const attribute = this.program.attributes[name]
        if (!attribute)
            return
        
        attribute.setPosition(true)

        const buffer = this.renderer.positionBuffers.get(array)
        attribute.setBuffer(buffer)
    }
    
    setAttributeBuffer(name, buffer, length, options = {}) {
        const attribute = this.program.attributes[name]
        if (!attribute)
            return
        
        if (typeof buffer === "string")
            buffer = this.scene.getBuffer(buffer, attribute.type, length)

        attribute.setBuffer(buffer, options)
    }
    
    setViewUniforms(center, size, pixel) {
        this.setSpecialUniform("viewCenter", center)
        this.setSpecialUniform("viewSize", size)
        this.setSpecialUniform("pixelSize", pixel)
    }
    
    setTimeUniform(uniform) {
        this.setSpecialUniform("now", uniform)
    }
    
    setPhaseUniform(uniform) {
        this.setSpecialUniform("phase", uniform)
    }
    
    setCursorUniform(uniform) {
        this.setSpecialUniform("cursor", uniform)
    }
    
    setSpecialUniform(type, uniform) {
        if (uniform === undefined) {
            delete this.specialUniforms[type]
            return
        }
        
        if (this.program.uniforms[uniform] === undefined)
            console.warn("Unknown uniform "+uniform)
        
        Object.defineProperty(this.specialUniforms, type, {
            set: (value) => {
                this.uniforms[uniform] = value
            }
        })
    }
    
    setSpecialUniformData(type, value) {
        if (!this.specialUniforms.hasOwnProperty(type))
            return
        
        this.specialUniforms[type] = value
    }
    
    setLength(length) {
        this.length = length
    }
    
    setAlpha(value) {
        this.alpha = value
    }
    
    render() {
        if (this.length <= 0)
            return
    
        const gl = this.renderer.gl
        
        this.program.use()
    
        if (this.alpha !== undefined)
            if (this.alpha) {
                gl.enable(gl.BLEND);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            } else {
                gl.disable(gl.BLEND)
            }
    
        gl.bindVertexArray(this.vao)
    
        for (let [name, value] of Object.entries(this.uniforms)) {
            this.program.setUniform(name, value)
        }
    
/*
        if (this.textures !== undefined) {
            this.scene.setTextures(this.textures)
        }
*/
    
        gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, this.length)
    }
    
    build() {}
}