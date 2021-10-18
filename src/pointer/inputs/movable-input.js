import WorldPoint from "../../viewport/world-point.js"
import Trigger from "../../utility/trigger.js"

export default function movableInput(baseClass) {
	//noinspection JSPotentiallyInvalidUsageOfThis
	return class extends baseClass {
		current = new WorldPoint(0, 0, this.pointer.view)
		positionable = true
		thresholdValue = 0
		thresholdPosition = {
			x : 0,
			y : 0,
		}
		
		constructor(...args) {
			super(...args)
			Trigger.on(this.pointer.events.changeView, (view) => {
				this.current.setView(view)
			})
			
		}
		
		move(x, y) {
			if (this.thresholdValue > 0) {
				const shift = Math.hypot(x - this.thresholdPosition.x, y - this.thresholdPosition.y)
				if (shift < this.thresholdValue)
					return
				this.threshold(0)
			}
			
			this.current.setReal(x, y)
			const events = []
			
			if (this.current.real.changed)
				events.push([`${this.name}.move_real`])
			if (this.current.world.changed)
				events.push([`${this.name}.move_world`])
			if (this.current.world.changed || this.current.real.changed)
				events.push([`${this.name}.move`])
			
			if (events.length > 0)
				this.pointer.trigger(this, ...events)
		}
		
		getRealPosition(container = {}) {
			container.x = this.current.real.x
			container.y = this.current.real.y
			return container
		}
		
		getWorldPosition(container = {}) {
			container.x = this.current.world.x
			container.y = this.current.world.y
			return container
		}
		
		setCursor() {
			throw new Error ("Can't set cursor of movable input")
		}
		
		threshold(value = 20) {
			this.thresholdValue = value
			this.getRealPosition(this.thresholdPosition)
		}
	}
}
