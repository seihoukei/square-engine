import PointerStateCompiler from "./pointer-state-compiler.js"

export default class PointerActivity {
    actions = {}
    states = {}
    stateTemplates = {}
    
    name
    defaultState = "Default"
    
    constructor() {
//        this.pointer = pointer
    }
  
    register(pointer) {
        this.pointer = pointer
        this.build()
    }
    
    addAction(name, func) {
        this.actions[name] = func
        return this
    }
    
    addActions(actions) {
        Object.assign(this.actions, actions)
        return this
    }
    
    addGlobalAction(name, func) {
        this.pointer.addAction(name, func)
        return this
    }
    
    addGlobalActions(actions) {
        this.pointer.addActions(actions)
        return this
    }
    
    addState(name, source) {
        const state = PointerStateCompiler.compile(source, this.stateTemplates)
        state.name = name
        this.states[name] = state
    }
    
    addStateTemplate(name, source) {
        this.stateTemplates[name] = PointerStateCompiler.tokenize(source)
    }
    
    setState(name) {
    
    }
    
    build() {}
}