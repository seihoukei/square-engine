import PointerStateCompiler from "./pointer-state-compiler.js"
import PointerState from "./pointer-state.js"

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
        this.actions[name] = func.bind(this.pointer)
        return this
    }
    
    addActions(actions) {
        for (let [name, func] of Object.entries(actions))
            this.addAction(name, func)
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
    
    setState(state) {
        if (typeof state === "string") {
            state = this.state?.getSubstate?.(state) ?? this.states[state]
        }
        
        if (!state)
            throw new Error ("Unknown state")
        
        this.resetIdles()
        
        state.setLast(this.state)
        this.state = state
        
        this.initIdles()
    }
    
    getState(name) {
        return this.state?.getSubstate(name) ?? this.states[name]
    }
    
    getAction(name) {
        return this.actions[name]
    }
    
    initIdles() {
        if (this.state === undefined)
            return
        for (let trigger of this.state.getIdles()) {
            if (trigger.timeout !== undefined)
                clearTimeout(trigger.timeout)
        
            trigger.timeout = setTimeout(() => this.executeChain(this.lastInput, ...trigger.actions), trigger.duration)
        }
    }
    
    resetIdles() {
        if (this.state === undefined)
            return
        for (let trigger of this.state.idleTriggers) {
            if (trigger.timeout !== undefined)
                clearTimeout(trigger.timeout)
        
            delete trigger.timeout
        }
    }
    
    trigger(input, event) {
        this.lastInput = input
        this.initIdles()
        
        const trigger = this.state?.getTrigger(event)
        if (!trigger) return false
        
        this.executeChain(input, ...trigger)
        
        return true
    }
    
    executeChain(input, ...chain) {
        while (chain.length) {
            const element = chain.pop()
            
            if (typeof element === "string") {
                if (element === ">") {
                    const next = chain.pop()
                    this.setState(next)
                    return
                }
                
                if (element === "^") {
                    this.setState(this.state.getLast())
                    return
                }
                
                const action = this.getAction(element)
                
                let result
                if (chain[chain.length-1] instanceof Array) {
                    result = action(input, ...chain.pop())
                } else
                    result = action(input)
                
                if (typeof result === "string") {
                    const actions = PointerStateCompiler.compileActions(result)
                    this.executeChain(input, ...actions)
                    return
                }
                
                if (result instanceof Array) {
                    this.executeChain(input, ...result)
                    return
                }
            } else if (element instanceof PointerState) {
                this.setState(element)
                return
            }
        }
    }
    
    build() {}
}
