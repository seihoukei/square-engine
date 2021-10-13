import PointerInteraction from "../pointer-interaction.js"

export default class KeyboardInteraction extends PointerInteraction {
    alias = {
        shiftleft : "shift",
        shiftright : "shift",
        altleft : "alt",
        altright : "alt",
        controlleft : "ctrl",
        controlright : "ctrl",
        control : "ctrl",
    }
    constructor(pointer) {
        super(pointer)
        this.boundEventHandler = this.eventHandler.bind(this)
    }
    
    registerEvents(element) {
        //super.registerEvents(element)
        this.element = document.body
    
        const options = {
            passive : false,
            capture : true,
        }
    
        this.element.addEventListener("keydown", this.boundEventHandler, options)
        this.element.addEventListener("keyup", this.boundEventHandler, options)
    }
    
    eventHandler(event) {
        if (event.target !== this.element)
            return
        
        event.preventDefault()
        event.stopPropagation()
        
        const code = event.code.toLowerCase()
        dev.report("keyboard", `${event.type}: ${this.alias[code] ?? code}`, "keyboard.before")
    }
    
}