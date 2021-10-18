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
        const input = new InputClass(this, name)
        this.inputs[name] = input

        this.pointer.addInput(input)
        
        return input
    }
    
    addIndexedInput(name, index, InputClass) {
        this.inputs[name] ??= {}
        
        const input = new InputClass(this, `${name}${index}`)
        input.setIndex(index)
        
        this.inputs[name][index] = input
        
        this.pointer.addInput(input)
        
        return input
    }
    
    getInput(name, index) {
        const input = this.inputs[name]
        if (index === undefined)
            return input
        return input[index]
    }
    
    eventHandler() {}
}
