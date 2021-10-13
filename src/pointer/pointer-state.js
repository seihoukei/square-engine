export default class PointerState {
    static INTERACTION_ALIAS = {	//for convenient addressing
        lmb    : "button0",
        left   : "button0",
        rmb    : "button2",
        right  : "button2",
        first  : "touch0",
        second : "touch1",
        third  : "touch2",
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
    name
    
    constructor () {
    }
    
    addSubstate(state) {
        this.states[state.name] = state
    }
    
    addEntry(entry) {
        for (let event of entry.events) {
            for (let interaction of event.interactions) {
                this.triggers[`${
                    PointerState.INTERACTION_ALIAS[interaction] ?? interaction
                }.${
                    PointerState.EVENT_ALIAS[event.event] ?? event.event
                }`] = entry.actions
            }
        }
    }
}