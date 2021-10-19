import GLBuffer from "./gl-buffer.js"

export default class GLPositionBuffers {
    static QUAD_ARRAYS = {
        CENTERED : new Float32Array([
            -1, -1,
            -1,  1,
            1,  1,
            1, -1,
        ]),
    }
    
    buffers = new Map()
    
    constructor(renderer) {
        this.renderer = renderer
    }
    
    get(array) {
        const oldBuffer = this.buffers.get(array)
        if (oldBuffer)
            return oldBuffer
        
        const buffer = new GLBuffer(this.renderer, array.length)
        
        buffer.initBuffer()
        buffer.updateData(array, WebGL2RenderingContext.STATIC_DRAW)
        
        this.buffers.set(array, buffer)
        return buffer
    }
}