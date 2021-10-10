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
            gl.texImage2D(this.type,
                0, //mipLevel
                this.options.internalFormat ?? gl.RGBA,
                this.options.width ?? GLTexture.DEFAULT_SIZE,
                this.options.height ?? GLTexture.DEFAULT_SIZE,
                0, //border
                this.options.format ?? gl.RGBA,
                this.options.type ?? gl.UNSIGNED_BYTE,
                this.options.data ?? null)
            if (this.options.url !== undefined)
                this.load(this.options.url)
        } else {
            gl.texImage3D(this.type,
                0, //mipLevel
                this.options.internalFormat ?? gl.RGBA,
                this.options.width ?? GLTexture.DEFAULT_SIZE,
                this.options.height ?? GLTexture.DEFAULT_SIZE,
                this.options.layers ?? 1,
                0,
                this.options.format ?? gl.RGBA,
                this.options.type ?? gl.UNSIGNED_BYTE,
                this.options.data ?? null)
            if (this.options.urls !== undefined)
                for (let i = 0; i < this.options.urls.length; i++)
                    this.load(this.options.urls[i], i)
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
    
    assign(data, layer = 0, width, height) {
        const gl = this.renderer.gl
    
        gl.bindTexture(this.type, this.texture)
        if (!this.isArray) {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data)
        } else {
            gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, layer,
                width ?? data.width ?? this.options.width ?? GLTexture.DEFAULT_SIZE,
                height ?? data.height ?? this.options.height ?? GLTexture.DEFAULT_SIZE,
                1,
                gl.RGBA, gl.UNSIGNED_BYTE, data)
        }
        if (this.options.mipMaps)
            gl.generateMipmap(gl.TEXTURE_2D)
    
        return this.texture
    }
    
    load(url, layer = 0) {
        const img = new Image()
        img.src = url
        img.onload = () => {
            this.assign(img, layer, img.width, img.height)
        }
    
        return this.texture
        
    }
}