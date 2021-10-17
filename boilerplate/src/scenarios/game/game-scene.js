import GLScene from "../../square-engine/gl-renderer/gl-scene.js"
import BGElement from "./scene-elements/bg-element.js"

export default class GameScene extends GLScene{
	build() {
		this.addElement(new BGElement(this), "bg")
	}
}
