import Trigger from "../utility/trigger.js"
import MouseInteraction from "./interactions/mouse-interaction.js"
import TouchInteraction from "./interactions/touch-interaction.js"
import KeyboardInteraction from "./interactions/keyboard-interaction.js"
import PointerState from "./pointer-state.js"

export default class Pointer extends Trigger.Class(["changeView"]) {
    static DEFAULT_INTERACTIONS = {
        mouse: MouseInteraction,
        touch: TouchInteraction,
        keyboard: KeyboardInteraction,
    }
    
    interactions = {}
    activities = {}
    inputs = {}
    alias = {}
    
    actions = {
        anchor : (input, ...inputList) => {
            if (inputList.length === 0) {
                input.setAnchor()
            } else {
                for (let [input] of inputList)
                    this.getInput(input).setAnchor()
            }
        },
        
        unanchor : (input, ...inputList) => {
            if (inputList.length === 0) {
                input.unsetAnchor()
            } else {
                for (let [input] of inputList)
                    this.getInput(input).unsetAnchor()
            }
        },
    }
    
    constructor(viewport, interactions = Pointer.DEFAULT_INTERACTIONS) {
        super()
        this.viewport = viewport
        this.viewData = {}
        
        for (let [name, InteractionClass] of Object.entries(interactions))
            this.interactions[name] = new InteractionClass(this)
        this.registerEvents(viewport.canvas)
    }
    
    setView(view) {
        if (this.view === view)
            return
    
        this.view = view
    
        this.viewTrigger?.cancel?.()
        this.viewTrigger = Trigger.on(this.view.events.change, () => {
            this.updateView(this.view)
        })
        
        this.events.changeView(this.view)
    }
    
    updateView(view) {
        view.getSize(this.viewData)
        view.getCenter(this.viewData)
    }
    
    addActivity(activity, name = activity.name) {
        if (name === undefined)
            throw Error("can't register activity without a name")
        activity.register(this)
        this.activities[name] = activity
        return this
    }
    
    addAction(name, func) {
        this.actions[name] = func.bind(this)
        return this
    }
    
    addActions(actions) {
        for (let [name, func] of Object.entries(actions))
            this.addAction(name, func)
        return this
    }
    
    addInput(input) {
        this.inputs[input.name] = input
    }
    
    setActivity(name, state) {
        this.activity = this.activities[name]
        if (!this.activity)
            throw new Error(`Unknown activity ${name}`)
        this.activity.setState(state ?? this.activity.defaultState)
    }
    
    registerEvents(element) {
        for (let interaction of Object.values(this.interactions))
            interaction.registerEvents(element)
    }
    
    //events = list of events that will be tried until one with bound trigger is found, the rest are ignored
    trigger(input, ...events) {
        for (let event of events) {
            if (this.activity.trigger(input, event))
                return true
        }
    }

    getInput(name) {
        return this.inputs[PointerState.INTERACTION_ALIAS[name] ?? name]
    }
}
