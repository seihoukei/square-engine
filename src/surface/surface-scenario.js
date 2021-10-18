export default class SurfaceScenario {
	static sceneClass
	static viewSettings
	static activityClass
	static sceneSettings
	
	constructor(renderer, pointer, data = {}) {
		this.scene = new this.constructor.sceneClass(renderer, Object.assign({}, this.constructor.sceneSettings, {
			viewSettings: this.constructor.viewSettings,
			pointer,
		}))
		
		this.activity = new this.constructor.activityClass()
		pointer.addActivity(this.activity)
		
		this.view = this.scene.view
	}
}
