import GLBuffer from "./gl-buffer.js"

export default class GLScene {
    buffers = {}
    elements = []
    
    constructor(renderer) {
        this.renderer = renderer
        this.build()
    }
    
    addElement(element) {
        this.elements.push(element)
    }
    
    getBuffer(name, type, length) {
        if (this.buffers[name]) {
            //check compatibility
            return this.buffers[name]
        }
        
        const buffer = new GLBuffer(this.renderer, length)
        //init buffer
        this.buffers[name] = buffer
        return buffer
    }
    
    render() {
        for (let buffer of Object.values(this.buffers))
            buffer.update()
        
        for (let element of this.elements)
            element.render()
    }
    
    build() {}
}