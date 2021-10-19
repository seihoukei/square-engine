import PointerInteraction from "../pointer-interaction.js"
import MouseCursorInput from "../inputs/mouse-cursor-input.js"
import MouseButtonInput from "../inputs/mouse-button-input.js"
import MouseWheelInput from "../inputs/mouse-wheel-input.js"

export default class MouseInteraction extends PointerInteraction {
    static MAX_BUTTONS = 3
    static THRESHOLD = 5
    
    constructor(pointer) {
        super(pointer)
        
        const cursor = this.addInput("cursor", MouseCursorInput)
        
        for (let i = 0; i < MouseInteraction.MAX_BUTTONS; i++) {
            this.addIndexedInput("button", i, MouseButtonInput)
                .setCursor(cursor)
            
        }
        this.addInput("wheel", MouseWheelInput)
            .setCursor(cursor)
    }
    
    registerEvents(element) {
        super.registerEvents(element)
    
        const options = {
            passive : false,
            capture : true,
        }

        element.addEventListener("mousemove", this.boundEventHandler, options)
        element.addEventListener("mouseout", this.boundEventHandler, options)
        
        element.addEventListener("mousedown", this.boundEventHandler, options)
        element.addEventListener("mouseup", this.boundEventHandler, options)
        
        element.addEventListener("mousewheel", this.boundEventHandler, options)

        element.addEventListener("contextmenu", (event) => event.preventDefault(), options)
    }
    
    eventHandler(event) {
        if (event.target !== this.element)
            return
    
        event.preventDefault()
        event.stopPropagation()
    
        if (window.dev?.isVerbose("mouse"))
            dev.report("mouse", `${event.type}: ${event.offsetX}, ${event.offsetY}, ${event.button}, ${event.deltaY}`, "mouse.before")
    
        if (event.type === "mousemove") {
            const x = event.offsetX
            const y = event.offsetY
            const input = this.getInput("cursor")
            input.move(x, y)
            
            return
        }
    
        if (event.type === "mouseout") {
            for (let i = 0; i < MouseInteraction.MAX_BUTTONS; i++) {
                const input = this.getInput("button", i)
                input.release()
            }
        
            return
        }
        
        if (event.type === "mousewheel") {
            const input = this.getInput("wheel")
            input.scroll(event.deltaY)
            
            return
        }
    
        const button = event.button
    
        if (event.type === "mousedown") {
            const input = this.getInput("button", button)
            input.press()
            
            const cursor = this.getInput("cursor")
            cursor.threshold(MouseInteraction.THRESHOLD)
            
            return
        }
        
        if (event.type === "mouseup") {
            const input = this.getInput("button", button)
            input.release()
            
            return
        }
        
    }
    
}
