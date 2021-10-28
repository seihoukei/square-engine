import Square2D from "../../../square-engine/2d/square-2d.js"

const MAX_NODES = 1024
const AVERAGE_REGION_EDGES = 8

class RegionsElement extends Square2D.SceneElement {
	render() {
		if (!this.data.regions)
			return
		const c = this.renderer.context
		c.save()
		c.globalAlpha = 0.5
		for (let [node, region] of this.data.regions) {
			c.beginPath()
/*			c.save()
			c.translate(node.x, node.y)
//			c.scale(node.size, node.size)
			c.moveTo(node.size, 0)
			c.arc(0, 0, node.size, 0, 6.29)
			c.restore()*/
			for (let vertex of region.renderCoordinates()) {
				if (vertex.first)
					c.moveTo(vertex.x, vertex.y)
				else
					c.lineTo(vertex.x, vertex.y)
			}
			c.fillStyle = node.color
			c.fill()

		}
		c.restore()
	}
}

class NodesElement extends Square2D.SceneElement {
	render() {
		if (!this.data.nodes)
			return
		const c = this.renderer.context
		for (let node of this.data.nodes) {
			c.save()
			c.translate(node.x, node.y)
//			c.scale(node.size, node.size)
			c.beginPath()
			c.moveTo(node.size, 0)
			c.arc(0, 0, node.size, 0, 6.29)
			c.fillStyle = node.color
			c.fill()
			c.restore()
		}
	}
}

export default class Test2DScene extends Square2D.Scene {
	build() {
		this.addElement(new RegionsElement(this), "regions")
		this.addElement(new NodesElement(this), "nodes")
	}
}
