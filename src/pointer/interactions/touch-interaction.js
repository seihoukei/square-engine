import PointerInteraction from "../pointer-interaction.js"

export default class TouchInteraction extends PointerInteraction {
    constructor(pointer) {
        super(pointer)
        this.boundEventHandler = this.eventHandler.bind(this)
    }
    
    registerEvents(element) {
        super.registerEvents(element)
        
        const options = {
            passive : false,
            capture : true,
        }
    
        element.addEventListener("touchmove", this.boundEventHandler, options)
        element.addEventListener("touchstart", this.boundEventHandler, options)
        element.addEventListener("touchend", this.boundEventHandler, options)
        element.addEventListener("touchcancel", this.boundEventHandler, options)
    }
    
    eventHandler(event) {
        if (event.target !== this.element)
            return
    
        event.preventDefault()
        event.stopPropagation()
    
        for (let touch of event.changedTouches) {
            const x = touch.pageX - this.element.offsetLeft
            const y = touch.pageY - this.element.offsetTop
            const id = touch.identifier
    
            if (window.dev?.isVerbose("touch"))
                dev.report(`touch${id}`, `${event.type}: ${x}, ${y}`, `touch${id}.before`)
        }
    }
    
}