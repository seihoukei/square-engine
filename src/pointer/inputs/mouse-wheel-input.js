import PointerInput from "../pointer-input.js"

export default class MouseWheelInput extends PointerInput {
	scroll(deltaY) {
		this.change = deltaY
		this.direction = deltaY < 0 ? "up" : "down"
		
		this.pointer.trigger(this, `${this.name}.${this.direction}`, `${this.name}.scroll`)
	}
}
