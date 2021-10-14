export default function pressableInput(baseClass) {
	return class extends baseClass {
		down = false
		
		press() {
			if (this.down)
				return
			
			this.down = true
			this.pointer.trigger(this, `${this.name}.down`)
		}
		
		release() {
			if (!this.down)
				return
			
			this.down = false
			this.pointer.trigger(this, `${this.name}.up`)
		}
	}
}
