import WorldPoint from "../../viewport/world-point.js"
import Trigger from "../../utility/trigger.js"

export default function movableInput(baseClass) {
	return class extends baseClass {
		anchored = false
		current = new WorldPoint(0, 0, this.pointer.view)
		anchor = new WorldPoint(0, 0, this.pointer.view)
		
		constructor(...args) {
			super(...args)
			Trigger.on(this.pointer.events.changeView, (view) => {
				this.current.setView(view)
				this.anchor.setView(view, this.anchored)
			})
			
		}
		
		setAnchor() {
			this.anchored = true
			this.anchor.set(this.current)
		}
		
		unsetAnchor() {
			this.anchored = false
			this.anchor.setReal(0, 0, false)
			this.anchor.setWorld(0, 0, false)
		}
		
		move(x, y) {
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
	}
}
