import SurfaceScenario from "../../src/surface/surface-scenario.js"
import TestGLScene from "./scene.js"
import MapActivity from "./activity.js"

export default class MapScenario extends SurfaceScenario {
	static sceneClass = TestGLScene
	static activityClass = MapActivity
	static viewSettings = {
		expandView: 100,
	}
}
