import pressableInput from "./pressable-input.js"
import movableInput from "./movable-input.js"
import PointerInput from "../pointer-input.js"

export default class TouchInput extends movableInput(pressableInput(PointerInput)) {
	releasable = true
}
