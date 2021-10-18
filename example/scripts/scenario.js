import SurfaceScenario from "../../src/surface/surface-scenario.js"
import TestGLScene from "./scene.js"
import MapActivity from "./activity.js"

export default class MapScenario extends SurfaceScenario {
	static sceneClass = TestGLScene
	static activityClass = MapActivity
	static viewSettings = {
		expandView: 200,
	}
	
	createNodes(amount) {
		const nodes = []
		
		let distance = 0
		let angle = 0
		for (let i = 0; i < amount; i++) {
			angle += Math.PI / 4 + Math.random() * Math.PI / 2
			const size = Math.random() * 50 + 30
			
			const node = {
				index : i,
				x : distance * Math.cos(angle),
				y : distance * Math.sin(angle),
				size,
				color: [
					Math.random() * 255 | 0,
					Math.random() * 255 | 0,
					Math.random() * 255 | 0,
					255,
				]
			}
			
			nodes.push(node)
			
			if (i === 0)
				distance += 80
			
			distance += size
		}
		
		this.nodes = nodes
		
		this.updateBoundaries()
		this.updateNodes()
	}
	
	updateNodes() {
		const dataBuffer = this.scene.getBuffer("nodeData")
		const colorBuffer = this.scene.getBuffer("nodeColor")
		
		for (let node of this.nodes) {
			dataBuffer.setInstanceData(node.index, node.x, node.y, node.size, node.index)
			colorBuffer.setInstanceData(node.index, node.color)
		}

		this.scene.setLength("nodes", this.nodes.length)
		this.scene.setLength("bg_nodes", this.nodes.length)
	}
	
	updateBoundaries() {
		const bounds = {
			left : Infinity,
			right : -Infinity,
			top : -Infinity,
			bottom : Infinity,
		}
		
		for (let node of this.nodes) {
			if (node.x < bounds.left) bounds.left = node.x
			if (node.x > bounds.right) bounds.right = node.x
			if (node.y < bounds.bottom) bounds.bottom = node.y
			if (node.y > bounds.top) bounds.top = node.y
		}

		this.scene.setBoundaries(bounds)
	}
	
	updateNode(node) {
		this.scene.getBuffer("nodeData").setInstanceData(node.index, node.x, node.y, node.size, node.index)
		this.scene.getBuffer("nodeColor").setInstanceData(node.index, node.color)
	}

}
