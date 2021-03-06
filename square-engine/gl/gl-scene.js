import Trigger from "../utility/trigger.js"
import WorldView from "../viewport/world-view.js"
import SquareGL from "./square-gl.js"

export default class GLScene extends Trigger.Class(["updateView", "activate", "deactivate"]) {
    buffers = {}
    elements = {}
    viewData = {}
    textures = {}
    renderQueue = []
    
    constructor(renderer, data = {}) {
        super()
        
        this.renderer = renderer
        this.pointer = data.pointer
        
        this.setView(new WorldView(renderer.getViewport(), data.viewSettings))
        
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
    
    getElement(elementName) {
        const element = this.elements[elementName]
        if (!element) {
            console.warn(`Element ${elementName} not found`)
            return
        }
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
    
    createBuffer(name, type, length, options) {
        const buffer = new SquareGL.Buffer(this.renderer, length)
    
        buffer.initBuffer()
        buffer.initData(options.normalize ?? type, SquareGL.Types.get(type).size)
    
        this.buffers[name] = buffer
        return buffer
    }
    
    getBuffer(name, type, length, options = {}) {
        if (this.buffers[name] !== undefined) {
            const buffer = this.buffers[name]
            if (type !== undefined && buffer.type !== (options.normalize ?? SquareGL.Types.get(type).type))
                throw new Error ("Buffer type collision")
            if (length !== undefined && buffer.length !== length)
                console.warn("Buffer length mismatch")
        
            return buffer
        }
        
        return this.createBuffer(name, type, length, options)
    }
    
    createTexture(name, options = {}) {
        const texture = new SquareGL.Texture(this.renderer, options)
    
        texture.init()
    
        this.textures[name] = texture
        return texture
    }
    
    createViewportTexture(name, options = {}) {
        options.width = this.renderer.viewport.width
        options.height = this.renderer.viewport.height
        
        const texture = this.createTexture(name, options)
        
        Trigger.on(this.renderer.viewport.events.change, (width, height) => {
            texture.setSize(width, height)
        })
        
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
        
        if (this.pointer?.activity?.lastInput?.getWorldPosition !== undefined)
            this.cursorPosition = this.pointer.activity.lastInput.getWorldPosition(this.cursorPosition)
        
        for (let {element} of this.renderQueue) {
            element.setSpecialUniformData("now", now)
            if (this.cursorPosition !== undefined)
                element.setSpecialUniformData("cursor", [this.cursorPosition.x, this.cursorPosition.y])
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
    
    setBoundaries(boundaries, zoomOut) {
        this.view.setBoundaries(boundaries, zoomOut)
    }
    
    setLength(elementName, length = 0) {
        const element = this.getElement(elementName)
        element?.setLength(length)
    }
    
    getLength(elementName) {
        return this.getElement(elementName)?.getLength() ?? 0
    }
    
    activate() {
        this.events.activate()
    }
    
    deactivate() {
        this.events.deactivate()
    }
    
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
    
    advanceView(time) {
        this.view.advance(time)
    }
}
