import GLBuffer from "./gl-buffer.js"
import Trigger from "../utility/trigger.js"

export default class GLScene {
    buffers = {}
    elements = []
    viewData = {}
    
    constructor(renderer) {
        this.renderer = renderer
        this.build()
    }
    
    init() {
        for (let element of this.elements) {
            element.init()
        }
    }
    
    addElement(element) {
        this.elements.push(element)
    }
    
    getBuffer(name, type, length) {
        if (this.buffers[name]) {
            const buffer = this.buffers[name]
            if (buffer.type !== type)
                throw new Error ("Buffer type collision")
            if (length !== undefined && buffer.length !== length)
                console.warn("Buffer length mismatch")
        
            return buffer
        }
        
        const buffer = new GLBuffer(this.renderer, length)
        
        buffer.initBuffer()
        buffer.initData(type)
        
        this.buffers[name] = buffer
        return buffer
    }
    
    render(now) {
        for (let buffer of Object.values(this.buffers))
            buffer.update()
        
        for (let element of this.elements) {
            element.setSpecialUniformData("now", now)
            element.render()
        }
    }
    
    build() {}
    
    setView(view) {
        if (this.view === view)
            return
        
        this.view = view
        
        this.viewTrigger?.cancel?.()
        this.viewTrigger = Trigger.on(this.view.events.change, () => {
            this.updateView(this.view)
        })
    }
    
    activate() {}
    
    deactivate() {}
    
    updateView(view) {
        view.getSize(this.viewData)
        view.getCenter(this.viewData)
        this.pixelSize = view.getWorldPixelSize()
    
        for (let element of this.elements) {
            element.setSpecialUniformData("viewCenter", [this.viewData.x, this.viewData.y])
            element.setSpecialUniformData("viewSize", [this.viewData.width, this.viewData.height])
            element.setSpecialUniformData("pixelSize", this.pixelSize)
        }
    }
}