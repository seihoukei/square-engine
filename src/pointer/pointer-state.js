export default class PointerState {
    static INTERACTION_ALIAS = {	//for convenient addressing
        lmb    : "button0",
        left   : "button0",
        rmb    : "button2",
        right  : "button2",
        first  : "touch0",
        second : "touch1",
        third  : "touch2",
        mouse  : "cursor",
    }
    
    static EVENT_ALIAS = {	//for touch / button event coupling
        start  : "down",
        end    : "up",
        out    : "up",
        cancel : "up",
        wheel  : "scroll",
    }
    
    states = {}
    triggers = {}
    idleTriggers = []
    name
    
    constructor () {
    }
    
    addSubstate(state) {
        this.states[state.name] = state
        state.setParent(this)
    }
    
    addEntry(entry) {
        for (let event of entry.events) {
            for (let interaction of event.interactions) {
                if (interaction === "idle") {
                    this.addIdle(Number(event.event), entry.actions)
                    continue
                }
                this.addTrigger(interaction, event.event, entry.actions)
            }
        }
    }
    
    addIdle(duration, actions) {
        this.idleTriggers.push({
            duration, actions
        })
    }
    
    getIdles() {
        return this.idleTriggers
    }
    
    getSubstate(name) {
        return this.states[name] ?? this.parent?.getSubstate(name)
    }
    
    addTrigger(interaction, event, actions) {
        this.triggers[`${
            PointerState.INTERACTION_ALIAS[interaction] ?? interaction
        }.${
            PointerState.EVENT_ALIAS[event.event] ?? event
        }`] = actions
    }
    
    getTrigger(trigger) {
        return this.triggers[trigger]
    }
    
    setLast(state) {
        this.lastState = state
    }
    
    getLast() {
        return this.lastState
    }
    
    setParent(state) {
        this.parent = state
    }
    
    getParent() {
        return this.parent
    }
}
