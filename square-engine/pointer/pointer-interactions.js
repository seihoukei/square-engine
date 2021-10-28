import MouseInteraction from "./interactions/mouse-interaction.js"
import TouchInteraction from "./interactions/touch-interaction.js"
import KeyboardInteraction from "./interactions/keyboard-interaction.js"

export default class PointerInteractions {
    static Mouse = MouseInteraction
    static Touch = TouchInteraction
    static Keyboard = KeyboardInteraction
}