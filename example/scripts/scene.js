import GLSceneElement from "../../src/gl-renderer/gl-scene-element.js"
import GLScene from "../../src/gl-renderer/gl-scene.js"

const MAX_NODES = 1024
const AVERAGE_REGION_EDGES = 8

class BGNodesElement extends GLSceneElement {
	build() {
		this.setAlpha(true)
		this.setMaxLength(MAX_NODES, 0)
		this.useProgram("bg_nodes")
		this.setViewUniforms("u_center", "u_size")
//        this.setTimeUniform("u_now")
		this.setPositionAttribute("a_position")
		this.setAttributeBuffer("a_node_data", "nodeData")
		this.setTargetTexture("bg_nodes", [0.5,0.5,0.5,1.0])
	}
}

class BGElement extends GLSceneElement {
	build() {
		this.setAlpha(true)
		this.setMaxLength(1)
		this.useProgram("bg")
		this.setViewUniforms("u_center", "u_size", "u_pixel")
		this.setTimeUniform("u_now")
		this.setPositionAttribute("a_position")
		this.setTexture("u_bg_nodes", "bg_nodes")
	}
}

class RegionsElement extends GLSceneElement {
	build() {
		this.setAlpha(true)
		this.setMaxLength(MAX_NODES * AVERAGE_REGION_EDGES, 0)
		this.useProgram("regions")
		this.setViewUniforms("u_center", "u_size")
		this.setCursorUniform("u_mouse")
        this.setTimeUniform("u_now")
		this.setPositionAttribute("a_position")
		this.setAttributeBuffer("a_region_node", "regionNode")
		this.setAttributeBuffer("a_region_edge", "regionEdge")
		this.setNormalizedAttributeBuffer("a_region_color", "regionColor")
//        this.setTargetTexture("bg_nodes", true)
	}
}

class NodesElement extends GLSceneElement {
	build() {
		this.setAlpha(true)
		this.setMaxLength(MAX_NODES, 0)
		this.useProgram("nodes")
		this.setViewUniforms("u_center", "u_size")
//        this.setTimeUniform("u_now")
		this.setPositionAttribute("a_position")
		this.setAttributeBuffer("a_node_data", "nodeData")
		this.setNormalizedAttributeBuffer("a_node_color", "nodeColor")
//        this.setTargetTexture("bg_nodes", true)
	}
}

export default class TestGLScene extends GLScene {
	build() {
		this.createViewportTexture("bg_nodes")
		
		this.addElement(new BGNodesElement(this), "bg_nodes")
		this.addElement(new BGElement(this), "bg").setUniform("u_front", 0)
		this.addElement(new RegionsElement(this), "regions")
		this.addElement(new NodesElement(this), "nodes")
		this.addElement(new BGElement(this), "fg").setUniform("u_front", 1)
	}
}
