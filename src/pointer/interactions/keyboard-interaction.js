import PointerInteraction from "../pointer-interaction.js"
import KeyboardInput from "../inputs/keyboard-input.js"

export default class KeyboardInteraction extends PointerInteraction {
    static KEY_ALIAS = {
        shiftleft : "shift",
        shiftright : "shift",
        altleft : "alt",
        altright : "alt",
        controlleft : "ctrl",
        controlright : "ctrl",
        control : "ctrl",
    }
    
    static KEYS = [
        "backquote", "backslash", "bracketleft", "bracketright", "comma", "equal", "intlbackslash", "minus", "period", "quote", "semicolon", "slash",
        "digit0", "digit1", "digit2", "digit3", "digit4", "digit5", "digit6", "digit7", "digit8", "digit9",
        "keya", "keyb", "keyc", "keyd", "keye", "keyf", "keyg", "keyh", "keyi", "keyj", "keyk", "keyl", "keym", "keyn", "keyo", "keyp", "keyq", "keyr", "keys", "keyt", "keyu", "keyv", "keyw", "keyx", "keyy", "keyz",
        "tab", "escape", "enter", "backspace", "delete", "insert", "pageup", "pagedown", "home", "end",
        "numpadadd", "numpadsubtract", "numpadmultiply", "numpaddivide", "numpaddecimal", "numpadenter",
        "numpad0", "numpad1", "numpad2", "numpad3", "numpad4", "numpad5", "numpad6", "numpad7", "numpad8", "numpad9",
        "alt", "shift", "ctrl",
        "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "f10", //"f11", "f12",
    ]
    
    constructor(pointer) {
        super(pointer)
        this.boundEventHandler = this.eventHandler.bind(this)
        for (let key of KeyboardInteraction.KEYS) {
            this.addInput(key.toLowerCase(), KeyboardInput)
        }
    }
    
    registerEvents(element) {
        //super.registerEvents(element)
        this.element = document.body
    
        const options = {
            passive : false,
            capture : true,
        }
    
        this.element.addEventListener("keydown", this.boundEventHandler, options)
        this.element.addEventListener("keyup", this.boundEventHandler, options)
    }
    
    getInputCode(keyCode) {
        let code = keyCode.toLowerCase()
        return KeyboardInteraction.KEY_ALIAS[code] ?? code
    }
    
    eventHandler(event) {
        if (event.target !== this.element)
            return
    
        const code = this.getInputCode(event.code)
        const input = this.getInput(code)
        
        if (input === undefined)
            return
        
        event.preventDefault()
        event.stopPropagation()
    
        if (window.dev?.isVerbose("keyboard"))
            dev.report("keyboard", `${event.type}: ${code}`, "keyboard.before")

        if (event.type === "keydown")
            input.press()
    
        if (event.type === "keyup")
            input.release()
        
    }
    
}
