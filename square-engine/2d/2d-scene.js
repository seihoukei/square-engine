import WorldView from "../viewport/world-view.js"
import Trigger from "../utility/trigger.js"

export default class Square2DScene extends Trigger.Class(["updateView", "activate", "deactivate"]) {
    elements = {}
    viewData = {}
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
        for (let element of Object.values(this.elements)) {
            element.init()
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

    render(now) {
        if (this.pointer?.activity?.lastInput?.getWorldPosition !== undefined)
            this.cursorPosition = this.pointer.activity.lastInput.getWorldPosition(this.cursorPosition)

        const c = this.renderer.context

        c.save()

        c.translate(this.renderer.viewport.width / 2, this.renderer.viewport.height / 2)
        c.scale(this.viewData.zoom, this.viewData.zoom)
        c.translate(-this.viewData.x, this.viewData.y)

        for (let {element} of this.renderQueue) {
            element.render(now)
        }

        c.restore()
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
        view.getView(this.viewData)

        this.events.updateView(this.viewData)
    }

    advanceView(time) {
        this.view.advance(time)
    }
}