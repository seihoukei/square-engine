import DOM from "../square-engine/utility/dom.js"
import GLRenderer from "../square-engine/gl-renderer/gl-renderer.js"
import Pointer from "../square-engine/pointer/pointer.js"

export default class UI {
	constructor(data = {}) {
		this.canvas = DOM.createElement("canvas", "main", document.body)
		
		this.renderer = new GLRenderer(this.canvas, {
			sources: data.shaders,
		})

		this.pointer = new Pointer(this.renderer.viewport)
		
		this.scenarios = this.prepareScenarios(data.scenarios)
		
		this.setScenario(data.defaultScenario ?? "default")
		
		this.renderer.activate()
	}
	
	prepareScenarios(data = {}) {
		const scenarios = {}
		for (let [name, scenarioData] of Object.entries(data)) {
			const scenario = {}
			
			scenario.scene = new scenarioData.scene(this.renderer, scenarioData.sceneSettings)
			scenario.activity = new scenarioData.activity()
			this.pointer.addActivity(scenario.activity)
			
			scenarios[name] = scenario
		}
		return scenarios
	}
	
	setScenario(name) {
		const scenario = this.scenarios[name]
		if (!scenario)
			throw new Error (`Unknown scenario ${name}`)
		
		this.renderer.setScene(scenario.scene)
		
		this.pointer.setView(scenario.view)
		this.pointer.setActivity(scenario.activity)
		
	}
}
