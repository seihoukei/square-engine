export default class PointerInteraction {
    element
    pointer
    inputs = {}
    
    constructor(pointer) {
        this.pointer = pointer
        this.boundEventHandler = this.eventHandler.bind(this)
    }
    
    registerEvents(element) {
        this.element = element
    }
    
    addInput(name, InputClass) {
        this.inputs[name] = new InputClass(this, name)
    }
    
    addIndexedInput(name, index, InputClass) {
        this.inputs[name] ??= {}
        
        const input = new InputClass(this, `${name}${index}`)
        input.setIndex(index)
        
        this.inputs[name][index] = input
    }
    
    getInput(name, index) {
        const input = this.inputs[name]
        if (index === undefined)
            return input
        return input[index]
    }
    
    eventHandler() {}
}
