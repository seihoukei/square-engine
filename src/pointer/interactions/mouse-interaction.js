import PointerInteraction from "../pointer-interaction.js"

export default class MouseInteraction extends PointerInteraction {
    constructor(pointer) {
        super(pointer)
    }
    
    registerEvents(element) {
        super.registerEvents(element)
    
        const options = {
            passive : false,
            capture : true,
        }

        element.addEventListener("mousemove", this.boundEventHandler, options)
        element.addEventListener("mousedown", this.boundEventHandler, options)
        element.addEventListener("mouseup", this.boundEventHandler, options)
        element.addEventListener("mouseout", this.boundEventHandler, options)

        element.addEventListener("contextmenu", (event) => event.preventDefault(), options)
    }
    
    eventHandler(event) {
        if (event.target !== this.element)
            return
    
        event.preventDefault()
        event.stopPropagation()

        const x = event.offsetX
        const y = event.offsetY
        const button = event.button
        
        if (window.dev?.isVerbose("mouse"))
            dev.report("mouse", `${event.type}: ${x}, ${y}${event.type === "mousedown" || event.type === "mouseup" ? `, button${button}` : ""}`, "mouse.before")
    }
    
}