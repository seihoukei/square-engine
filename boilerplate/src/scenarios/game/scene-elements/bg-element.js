import GLSceneElement from "../../../square-engine/gl-renderer/gl-scene-element.js"

export default class BGElement extends GLSceneElement{
	build() {
		this.setAlpha(true)
		this.setMaxLength(1)
		this.useProgram("bg")
		this.setViewUniforms("u_center", "u_size")
		this.setTimeUniform("u_now")
		this.setPositionAttribute("a_position")
	}
}
