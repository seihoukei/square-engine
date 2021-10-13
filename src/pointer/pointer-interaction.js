export default class PointerInteraction {
    element
    pointer
    
    constructor(pointer) {
        this.pointer = pointer
        this.boundEventHandler = this.eventHandler.bind(this)
    }
    
    registerEvents(element) {
        this.element = element
    }
    
    eventHandler() {}
}