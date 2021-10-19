import PointerInteraction from "../pointer-interaction.js"
import TouchInput from "../inputs/touch-input.js"

export default class TouchInteraction extends PointerInteraction {
    static MAX_TOUCHES = 3
    static THRESHOLD = 20
    
    constructor(pointer) {
        super(pointer)

        for (let i = 0; i < TouchInteraction.MAX_TOUCHES; i++) {
            this.addIndexedInput("touch", i, TouchInput)
        }
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

        const rect = this.element.getBoundingClientRect()
        
        for (let touch of event.changedTouches) {
            const x = touch.pageX - rect.x
            const y = touch.pageY - rect.y
            const id = touch.identifier
            
            const input = this.getInput("touch", id)
            if (!input)
                continue
            
            if (event.type === "touchmove" || event.type === "touchstart") {
                input.move(x, y)
            }

            if (event.type === "touchstart") {
                input.press()
                input.threshold(TouchInteraction.THRESHOLD)
            }

            if (event.type === "touchend" || event.type === "touchout" || event.type === "touchcancel" ) {
                input.release()
            }
    
            if (window.dev?.isVerbose("touch"))
                dev.report(`touch${id}`, `${event.type}: ${x}, ${y}`, `touch${id}.before`)
        }
    }
    
}
