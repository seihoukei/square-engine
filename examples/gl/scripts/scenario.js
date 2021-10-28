import TestGLScene from "./scene.js"
import MapActivity from "./activity.js"
import Geometry from "../../../square-engine/geometry/geometry.js"
import SquareSurface from "../../../square-engine/surface/square-surface.js"

export default class MapScenario extends SquareSurface.Scenario {
	static sceneClass = TestGLScene
	static activityClass = MapActivity
	static viewSettings = {
		expandView: 200,
		minView: 500,
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
		this.updateRegions()
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
	
	updateRegions() {
		this.maxCircle = Geometry.Circle.enclosing(this.nodes, "size")
		this.maxCircle.radius += 300
		
		this.searchRegions = new Geometry.PowerDiagram(this.nodes, "size")
		this.searchRegions.limitRegionsByCircle(this.maxCircle)
		
		this.regions = new Geometry.PowerDiagram(this.nodes, "size")
		this.regions.limitRegionsByCircle(this.maxCircle)
		this.regions.normalize()
		this.regions.shrinkRegionsBy(2)
		for (let [site, region] of this.regions) {
			region.shrinkTo(site.size * 10)
		}
		
		const index = this.updateRegionBuffers()
		
		this.scene.setLength("regions", index)
	}

	updateRegionBuffers() {
		const nodeBuffer = this.scene.getBuffer("regionNode")
		const edgeBuffer = this.scene.getBuffer("regionEdge")
		const colorBuffer = this.scene.getBuffer("regionColor")
		
		let index = 0
		for (let [site, region] of this.regions) {
			for (let edge of region) {
				nodeBuffer.setInstanceData(index, site.x, site.y, site === this.activeNode ? 1 : 0, 0)
				edgeBuffer.setInstanceData(index, edge.startX, edge.startY, edge.endX, edge.endY)
				colorBuffer.setInstanceData(index, site.color)
				
				index++
			}
		}
		
		return index
	}
	
	setActiveNode(node) {
		if (this.activeNode === node)
			return
		
		this.activeNode = node
		
		this.updateRegionBuffers()
	}
}
