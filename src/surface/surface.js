import GLRenderer from "../gl-renderer/gl-renderer.js"
import Pointer from "../pointer/pointer.js"

export default class Surface {
	scenarios = {}
	
	constructor(canvas, data) {
		this.renderer = new GLRenderer(canvas, data)
		this.pointer = new Pointer(this.renderer.viewport, data.interactions)
		
		for (let [name, ScenarioClass] of Object.entries(data.scenarios)) {
			this.scenarios[name] = new ScenarioClass(this.renderer, this.pointer)
		}
	}
	
	setScenario(scenario) {
		if (typeof scenario === "string")
			scenario = this.scenarios[scenario]
		if (!scenario)
			throw new Error("Unknown scenario")
		
		this.pointer.setActivity(scenario.activity)
		this.pointer.setView(scenario.view)
		this.renderer.setScene(scenario.scene)
	}
	
	activate() {
		this.renderer.activate()
	}
}
