import KeyboardInput from "./inputs/keyboard-input.js"
import MouseCursorInput from "./inputs/mouse-cursor-input.js"
import MouseWheelInput from "./inputs/mouse-wheel-input.js"
import MouseButtonInput from "./inputs/mouse-button-input.js"
import TouchInput from "./inputs/touch-input.js"

export default class PointerInputs {
    static Keyboard = KeyboardInput
    static MouseCursor = MouseCursorInput
    static MouseWheel = MouseWheelInput
    static MouseButton = MouseButtonInput
    static Touch = TouchInput
}