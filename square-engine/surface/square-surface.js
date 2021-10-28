import SquarePointer from "../pointer/square-pointer.js"
import SquareGL from "../gl/square-gl.js"
import SurfaceScenario from "./surface-scenario.js"

export default class SquareSurface {
	static Scenario = SurfaceScenario
	scenarios = {}
	
	constructor(canvas, data) {
		this.renderer = new (data.rendererClass ?? SquareGL)(canvas, data)
		this.pointer = new SquarePointer(this.renderer.viewport, data.interactions)
		
		for (let [name, ScenarioClass] of Object.entries(data.scenarios)) {
			this.scenarios[name] = new ScenarioClass(this.renderer, this.pointer)
		}
	}
	
	setScenario(scenario) {
		if (typeof scenario === "string")
			scenario = this.scenarios[scenario]
		if (!scenario)
			throw new Error("Unknown scenario")
		
		this.scenario = scenario
		this.pointer.setActivity(scenario.activity)
		this.pointer.setView(scenario.view)
		this.renderer.setScene(scenario.scene)
		
		scenario.activity.setContext(this)
	}
	
	activate() {
		this.renderer.activate()
	}
}
