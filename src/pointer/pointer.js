import Trigger from "../utility/trigger.js"
import MouseInteraction from "./interactions/mouse-interaction.js"
import TouchInteraction from "./interactions/touch-interaction.js"
import KeyboardInteraction from "./interactions/keyboard-interaction.js"

export default class Pointer {
    activities = {}
    actions = {
        anchor : (input, ...inputList) => {
        
        },
        
        unanchor : (input, ...inputList) => {
        
        },
        
        set_state : (input, state, ...args) => {
        
        },
    }
    
    constructor(viewport, interactions = [MouseInteraction, TouchInteraction, KeyboardInteraction]) {
        this.viewport = viewport
        this.viewData = {}
        this.interactions = interactions.map(Interaction => new Interaction(this))
        this.registerEvents(viewport.canvas)
    }
    
    setView(view) {
        this.view = view
    
        if (this.view === view)
            return
    
        this.view = view
    
        this.viewTrigger?.cancel?.()
        this.viewTrigger = Trigger.on(this.view.events.change, () => {
            this.updateView(this.view)
        })
    }
    
    updateView(view) {
        view.getSize(this.viewData)
        view.getCenter(this.viewData)
    }
    
    addActivity(activity, name = activity.name) {
        if (name === undefined)
            throw Error("can't register activity without a name")
        activity.register()
        this.activities[name] = activity
        return this
    }
    
    addAction(name, func) {
        this.actions[name] = func
        return this
    }
    
    addActions(actions) {
        Object.assign(this.actions, actions)
        return this
    }
    
    setActivity(name, state) {
        this.activity = this.activities[name]
        if (!this.activity)
            throw new Error(`Unknown activity ${name}`)
        this.activity.setState(state ?? this.activity.defaultState)
    }
    
    registerEvents(element) {
        for (let interaction of this.interactions)
            interaction.registerEvents(element)
    }
}

