const DEFAULT_COORDINATES = {
	x : 0,
	y : 0,
	changed : false,
}

export default class WorldPoint{
	real = Object.assign({}, DEFAULT_COORDINATES)
	world = Object.assign({}, DEFAULT_COORDINATES)
	
	constructor(x, y, view, world = false) {
		this.view = view
		
		if (world)
			this.setWorld(x, y)
		else
			this.setReal(x, y)
	}
	
	// stores real coordinates, and updates world coordinates if viewport is provided
	setReal(x, y, both = this.view !== undefined) {
		if (this.real.x !== x || this.real.y !== y) {
			this.real.x = x
			this.real.y = y
			this.real.changed = true
		} else
			this.real.changed = false
		
		if (both) {
			this.setWorld(
				this.view.getWorldX(x),
				this.view.getWorldY(y),
				false,
			)
		}
		return this.real.changed
	}
	
	// stores world coordinates, and updates real coordinates if viewport is provided
	setWorld(x, y, both = this.view !== undefined) {
		if (this.world.x !== x || this.world.y !== y) {
			this.world.x = x
			this.world.y = y
			this.world.changed = true
		} else
			this.world.changed = false
		
		if (both) {
			this.setReal(
				view.getRealX(x),
				view.getRealY(y),
				false,
			)
		}
		
		return this.world.changed
	}
	
	// copy data from another state
	set(point, world = false) {
		if (world) {
			return this.setWorld(point.world.x, point.world.y)
		}
		return this.setReal(point.real.x, point.real.y)
	}
}
	