export default class GLPositionBuffers {
    static QUAD_ARRAYS = {
        CENTERED : new Float32Array([
            -1, -1,
            -1,  1,
            1, -1,
            -1,  1,
            1, -1,
            1,  1,
        ]),
    }
    
    buffers = new Map()
    
    constructor(gl) {
        this.gl = gl
    }
    
    get(array) {
        const oldBuffer = this.buffers.get(array)
        if (oldBuffer)
            return oldBuffer
        
        const gl = this.gl
        
        const buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW)
        
        this.buffers.set(array, buffer)
        return buffer
    }
}