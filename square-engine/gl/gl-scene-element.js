import SquareGL from "./square-gl.js"


export default class GLSceneElement {
    length = 1
    maxLength = 1
    uniforms = {}
    specialUniforms = {}
    textures = []
    
    lastGl

    constructor(scene) {
        this.scene = scene
        this.renderer = scene.renderer
        this.init()
    }
    
    init() {
        const gl = this.renderer.gl

        if (this.lastGl === gl)
            return
        
        this.lastGl = gl

        this.vao = gl.createVertexArray()
        gl.bindVertexArray(this.vao)
        this.build()
    }
    
    useProgram(name) {
        this.program = this.renderer.programs[name]

        return this
    }
    
    setMaxLength(maxLength, defaultLength = maxLength) {
        this.maxLength = maxLength
        this.length = defaultLength

        return this
    }
    
    setPositionAttribute(name, array = SquareGL.PositionBuffers.QUAD_ARRAYS.CENTERED) {
        const attribute = this.program.attributes[name]
        if (!attribute)
            return
        
        attribute.setPosition(true)

        const buffer = this.renderer.positionBuffers.get(array)
        attribute.setBuffer(buffer)
        
        this.positionLength = array.length / 2

        return this
    }
    
    setAttributeBuffer(name, buffer, options = {}) {
        const attribute = this.program.attributes[name]
        if (!attribute)
            return
        
        if (typeof buffer === "string")
            buffer = this.scene.getBuffer(buffer, attribute.glType, this.maxLength, options)

        attribute.setBuffer(buffer, options)

        return this
    }
    
    setNormalizedAttributeBuffer(name, buffer, options = {}, normalize = WebGL2RenderingContext.UNSIGNED_BYTE) {
        options.normalize = normalize
        this.setAttributeBuffer(name, buffer, options)
    }
    
    setViewUniforms(center, size, pixel) {
        this.setSpecialUniform("viewCenter", center)
        this.setSpecialUniform("viewSize", size)
        this.setSpecialUniform("pixelSize", pixel)

        return this
    }
    
    setTimeUniform(uniform) {
        this.setSpecialUniform("now", uniform)

        return this
    }
    
    setPhaseUniform(uniform) {
        this.setSpecialUniform("phase", uniform)

        return this
    }
    
    setCursorUniform(uniform) {
        this.setSpecialUniform("cursor", uniform)

        return this
    }
    
    setSpecialUniform(type, uniform) {
        if (uniform === undefined) {
            delete this.specialUniforms[type]
            return
        }
        
        if (this.program.uniforms[uniform] === undefined)
            console.warn("Unknown uniform "+uniform)
        
        Object.defineProperty(this.specialUniforms, type, {
            configurable : true,
            set: (value) => {
                this.uniforms[uniform] = value
            }
        })

        return this
    }
    
    setSpecialUniformData(type, value) {
        if (!this.specialUniforms.hasOwnProperty(type))
            return
        
        this.specialUniforms[type] = value

        return this
    }
    
    setLength(length) {
        this.length = Math.clamp(0, length, this.maxLength)

        return this
    }
    
    getLength() {
        return this.length
    }

    setAlpha(value) {
        this.alpha = value

        return this
    }
    
    setUniform(uniform, value) {
        if (this.program.uniforms[uniform] === undefined)
            console.warn("Unknown uniform "+uniform)
        
        this.uniforms[uniform] = value
        
        return this
    }
    
    setTexture(target, name, slot = this.textures.length) {
        if (!this.program.uniforms[target]?.isTexture){
            console.warn(`${target} is not a sampler uniform`)
            return
        }
        this.textures[slot] = this.scene.getTexture(name)
        this.uniforms[target] = slot
        
        return this
    }
    
    setTargetTexture(name, clearColor = [1,1,1,1], layer = 0) {
        this.targetTexture = this.scene.getTexture(name)
        this.targetLayer = layer
        this.clearColor = clearColor
    
        return this
    }
    
    resetTargetTexture() {
        delete this.targetTexture
        delete this.targetLayer
        delete this.clearColor
    }
    
    render() {
        if (this.length <= 0)
            return
    
        const gl = this.renderer.gl
        
        if (this.targetTexture) {
            this.targetTexture.unbind()
            this.renderer.setTarget(this.targetTexture, this.clearColor, this.targetLayer)
        }
        
        this.program.use()
    
        if (this.alpha !== undefined)
            if (this.alpha) {
                gl.enable(gl.BLEND);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
//                gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
            } else {
                gl.disable(gl.BLEND)
            }
    
        gl.bindVertexArray(this.vao)
    
        for (let [name, value] of Object.entries(this.uniforms)) {
            this.program.setUniform(name, value)
        }
    
        for (let [index, texture] of Object.entries(this.textures)) {
            texture.setSlot(+index)
        }
    
        gl.drawArraysInstanced(gl.TRIANGLE_FAN, 0, this.positionLength, this.length)
    
        if (this.targetTexture) {
            this.renderer.resetTarget()
        }
    }
    
    build() {}
}
