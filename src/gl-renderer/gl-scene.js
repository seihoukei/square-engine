import GLBuffer from "./gl-buffer.js"
import Trigger from "../utility/trigger.js"
import GLTexture from "./gl-texture.js"

export default class GLScene extends Trigger.Class(["updateView"]) {
    buffers = {}
    elements = {}
    viewData = {}
    textures = {}
    renderQueue = []
    
    constructor(renderer) {
        super()
        this.renderer = renderer
        this.build()
        this.init()
    }
    
    init() {
        for (let buffer of Object.values(this.buffers)) {
            buffer.initBuffer()
        }
        for (let element of Object.values(this.elements)) {
            element.init()
        }
        for (let texture of Object.values(this.textures)) {
            texture.init()
        }
    }
    
    addElement(element, id = `_element${Object.values(this.elements).length}`, order = this.renderQueue.length) {
        this.elements[id] = element
        if (order < 0)
            return
        this.queueElement(element, order)
        return element
    }
    
    queueElement(element, order = this.renderQueue.length) {
        if (typeof element === "string")
            element = this.elements[element]
        if (element === undefined)
            return
        
        for (let i = 0; i < this.renderQueue.length; i++) {
            if (this.renderQueue[i].order <= order)
                continue
        
            this.renderQueue.splice(i, 0, [{element, order}])
            return
        }
        
        this.renderQueue.push({
            element, order
        })
    }
    
    disableElement(element, order) {
        if (typeof element === "string")
            element = this.elements[element]
        if (element === undefined)
            return
        
        for (let i = this.renderQueue.length - 1; i >= 0; i--) {
            if (this.renderQueue[i].element === element && (order === undefined || this.renderQueue[i].order === order))
                this.renderQueue.splice(i,1)
        }
    }
    
    createBuffer(name, type, length) {
        const buffer = new GLBuffer(this.renderer, length)
    
        buffer.initBuffer()
        buffer.initData(type)
    
        this.buffers[name] = buffer
        return buffer
    }
    
    getBuffer(name, type, length) {
        if (this.buffers[name] !== undefined) {
            const buffer = this.buffers[name]
            if (type !== undefined && buffer.glType !== type)
                throw new Error ("Buffer type collision")
            if (length !== undefined && buffer.length !== length)
                console.warn("Buffer length mismatch")
        
            return buffer
        }
        
        return this.createBuffer(name, type, length)
    }
    
    createTexture(name, options = {}) {
        const texture = new GLTexture(this.renderer, options)
    
        texture.init()
    
        this.textures[name] = texture
        return texture
    }

    getTexture(name) {
        if (this.textures[name] !== undefined)
            return this.textures[name]
        
        return this.createTexture(name)
    }
    
    render(now) {
        for (let buffer of Object.values(this.buffers))
            buffer.update()
        
        for (let {element} of this.renderQueue) {
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
    
    setLength(elementName, length = 0) {
        const element = this.elements[elementName]
        if (!element) {
            console.warn(`Element ${elementName} not found`)
            return false
        }
        element.setLength(length)
    }
    
    activate() {}
    
    deactivate() {}
    
    updateView(view) {
        view.getSize(this.viewData)
        view.getCenter(this.viewData)
        this.pixelSize = view.getWorldPixelSize()
    
        for (let element of Object.values(this.elements)) {
            element.setSpecialUniformData("viewCenter", [this.viewData.x, this.viewData.y])
            element.setSpecialUniformData("viewSize", [this.viewData.width, this.viewData.height])
            element.setSpecialUniformData("pixelSize", this.pixelSize)
        }
        
        this.events.updateView(this.viewData)
    }
}