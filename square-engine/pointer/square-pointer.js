import Trigger from "../utility/trigger.js"
import PointerState from "./pointer-state.js"
import PointerActivity from "./pointer-activity.js"
import PointerExecutionContext from "./pointer-execution-context.js"
import PointerInput from "./pointer-input.js"
import PointerInteraction from "./pointer-interaction.js"
import PointerStateCompiler from "./pointer-state-compiler.js"
import PointerInputs from "./pointer-inputs.js"
import PointerInteractions from "./pointer-interactions.js"

export default class SquarePointer extends Trigger.Class(["changeView"]) {
    static Activity = PointerActivity
    static ExecutionContext = PointerExecutionContext
    static Input = PointerInput
    static Interaction = PointerInteraction
    static State = PointerState
    static StateCompiler = PointerStateCompiler

    static Inputs = PointerInputs
    static Interactions = PointerInteractions

    static DEFAULT_INTERACTIONS = {
        mouse: this.Interactions.Mouse,
        touch: this.Interactions.Touch,
        keyboard: this.Interactions.Keyboard,
    }
    
    interactions = {}
    activities = {}
    inputs = {}
    data = {}
    
    constructor(viewport, interactions = SquarePointer.DEFAULT_INTERACTIONS) {
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
    
    addInput(input) {
        this.inputs[input.name] = input
    }
    
    setActivity(activity, state) {
        if (typeof activity === "string")
            activity = this.activities[activity]
        if (!activity)
            throw new Error(`Unknown activity ${name}`)
        
        this.activity = activity
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
        return false
    }

    getInput(name) {
        return this.inputs[SquarePointer.State.INTERACTION_ALIAS[name] ?? name]
    }
}
