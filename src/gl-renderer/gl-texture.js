export default class GLTexture {
    static DEFAULT_SIZE = 512
    lastGl
    
    constructor(renderer, options = {}) {
        this.renderer = renderer
        this.options = options
    
        const gl = this.renderer.gl

        this.isArray = this.options.layers !== undefined
        this.type = this.isArray ? gl.TEXTURE_2D_ARRAY : gl.TEXTURE_2D
        
        this.init()
    }
    
    init() {
        const gl = this.renderer.gl
        
        if (this.lastGl === gl)
            return

        this.texture = gl.createTexture()
        
        this.updateOptions()
        
        this.lastGl = gl
    }

    updateOptions() {
        const gl = this.renderer.gl
    
        gl.bindTexture(this.type, this.texture)
    
        gl.texParameteri(this.type, gl.TEXTURE_WRAP_S, this.options.repeat ?? gl.CLAMP_TO_EDGE)
        gl.texParameteri(this.type, gl.TEXTURE_WRAP_T, this.options.repeat ?? gl.CLAMP_TO_EDGE)
        gl.texParameteri(this.type, gl.TEXTURE_MIN_FILTER, this.options.filter ?? gl.LINEAR)
        gl.texParameteri(this.type, gl.TEXTURE_MAG_FILTER, this.options.filter ?? gl.LINEAR)
    
        if (!this.isArray) {
            if (this.options.url !== undefined)
                this.load(this.options.url)
            else
                gl.texImage2D(this.type,
                    this.options.mipLevel ?? 0, //mipLevel
                    this.options.internalFormat ?? gl.RGBA,
                    this.options.width ?? GLTexture.DEFAULT_SIZE,
                    this.options.height ?? GLTexture.DEFAULT_SIZE,
                    this.options.border ?? 0,
                    this.options.format ?? gl.RGBA,
                    this.options.type ?? gl.UNSIGNED_BYTE,
                    this.options.data ?? null)
        } else {
            gl.texImage3D(this.type,
                this.options.mipLevel ?? 0, //mipLevel
                this.options.internalFormat ?? gl.RGBA,
                this.options.width ?? GLTexture.DEFAULT_SIZE,
                this.options.height ?? GLTexture.DEFAULT_SIZE,
                this.options.layers ?? 1,
                this.options.border ?? 0,
                this.options.format ?? gl.RGBA,
                this.options.type ?? gl.UNSIGNED_BYTE,
                this.options.data ?? null)
        }
    }
    
    setSize(width, height) {
        this.options.width = width
        this.options.height = height
        this.updateOptions()
    }
    
    setSlot(slot) {
        this.slot = slot
        const gl = this.renderer.gl
        gl.activeTexture(gl.TEXTURE0 + this.slot)
        gl.bindTexture(this.type, this.texture)
    }
    
    unbind() {
        if (this.slot === undefined)
            return
        
        const gl = this.renderer.gl
        gl.activeTexture(gl.TEXTURE0 + this.slot)
        gl.bindTexture(this.type, null)
        
        delete this.slot
    }
    
    setFramebufferSlot(slot = 0, layer = 0) {
        const gl = this.renderer.gl
    
        if (this.isArray)
            gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + slot, this.texture, 0, layer)
        else
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + slot, gl.TEXTURE_2D, this.texture, 0)

        gl.viewport(0, 0, this.options.width ?? GLTexture.DEFAULT_SIZE, this.options.height ?? GLTexture.DEFAULT_SIZE)
    }
    
    assign(data, layer = 0) {
        const gl = this.renderer.gl
    
        if (!this.isArray) {
            gl.bindTexture(gl.TEXTURE_2D, this.texture)
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data)
            if (this.options.mipMaps)
                gl.generateMipmap(gl.TEXTURE_2D)
        }
    
        return this.texture
    }
    
    load(url, layer = 0) {
    
    }
}