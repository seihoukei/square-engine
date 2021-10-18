import PointerActivity from "../../src/pointer/pointer-activity.js"

export default class MapActivity extends PointerActivity {
	name = "Map"
	defaultState = "Empty"
	
	build() {
		this.addAction("target", function(input, cellNext, emptyNext) {
			if (input?.positionable) {
				this.data.lastWorld = input.getWorldPosition(this.data.lastWorld)
				this.data.lastReal = input.getWorldPosition(this.data.lastReal)
			}
			
			if (this.data.lastWorld === undefined) {
				dev.report("action", "target => fail", "action.old", true)
				return emptyNext
			}
			
			const cursor = this.data.lastWorld
			
			dev.report("cursor", JSON.stringify(cursor))
			
			for (let node of nodes) {
				if (Math.hypot(node.x - cursor.x, node.y - cursor.y) < node.size){
					this.data.node = node
					dev.report("node", JSON.stringify(node, null, 1))
					dev.report("action", "target => node", "action.old", true)
					return cellNext
				}
			}
			
			delete this.data.node
			dev.forget("node")
			
			dev.report("action", "target => empty", "action.old", true)
//            console.log("target", input, cellNext, emptyNext)
			return emptyNext
		})
		
		this.addActions({
			cell_action(input) {
				this.data.node.color = [
					Math.random() * 255 | 0,
					Math.random() * 255 | 0,
					Math.random() * 255 | 0,
					255,
				]
				surface.renderer.scene.getBuffer("nodeColor").setInstanceData(this.data.node.index, this.data.node.color)
				
				dev.report("action", "cell", "action.old", true)
			},
			
			cell_start_drag(input) {
				if (!this.data.node)
					return

				this.data.lastWorld = input.getWorldPosition(this.data.lastWorld)
				this.data.dragOffset ??= {}
				this.data.dragOffset.x = this.data.lastWorld.x - this.data.node.x
				this.data.dragOffset.y = this.data.lastWorld.y - this.data.node.y
				dev.report("action", "cell_drag_start", "action.old", true)
			},
			
			cell_drag(input) {
				if (!this.data.node)
					return
				
				this.data.lastWorld = input.getWorldPosition(this.data.lastWorld)
				this.data.node.x = this.data.lastWorld.x - this.data.dragOffset.x
				this.data.node.y = this.data.lastWorld.y - this.data.dragOffset.y
				surface.renderer.scene.getBuffer("nodeData").setInstanceData(this.data.node.index, this.data.node.x, this.data.node.y)
			
				dev.report("action", "cell_drag", "action.old", true)
			},
			
			cell_scale(input) {
				if (!this.data.node)
					return
				
				if (input.direction === "up" && this.data.node.size < 500)
					this.data.node.size *= 1.05
				
				if (input.direction === "down" && this.data.node.size > 15)
					this.data.node.size /= 1.05
				
				surface.renderer.scene.getBuffer("nodeData").setInstanceData(this.data.node.index, this.data.node.x, this.data.node.y, this.data.node.size)
				
			},
			
			cell_special_action(input) {
				dev.report("action", "cell_special", "action.old", true)
			},
			
			empty_action(input) {
				dev.report("action", "empty", "action.old", true)
			},
			
			empty_space_special_action(input) {
				dev.report("action", "empty_special", "action.old", true)
			},
			
		})
		
		this.addActions({
			
			start_drag_view(input, anchorInput) {
				if (anchorInput !== undefined)
					input = this.getInput(anchorInput[0])
				
				this.data.anchorA = input.getWorldPosition(this.data.anchorA)
			},
			
			drag_view(input) {
				this.data.positionA = input.getRealPosition(this.data.positionA)
				
				this.view.moveWorldPoint(
					this.data.anchorA.x, this.data.anchorA.y,
					this.data.positionA.x, this.data.positionA.y
				)
			},
			
			zoom_view(input) {
//                const mouse = this.getInput("mouse")
				this.data.lastWorld = input.getWorldPosition(this.data.lastWorld)
				
				this.view.zoomAt(this.data.lastWorld.x, this.data.lastWorld.y, - input.change / 10 * this.view.current.zoom)
			},
			
			start_pinch_view(input, anchorInput) {
				if (anchorInput !== undefined)
					input = this.getInput(anchorInput[0])
				
				this.data.anchorB = input.getWorldPosition(this.data.anchorA)
			},
			
			pinch_view(input) {
				const first = this.getInput("first")
				const second = this.getInput("second")
				
				this.data.positionA = first.getRealPosition(this.data.positionA)
				this.data.positionB = second.getRealPosition(this.data.positionB)
				
				this.view.moveWorldPoints(
					this.data.anchorA.x, this.data.anchorA.y,
					this.data.anchorB.x, this.data.anchorB.y,
					this.data.positionA.x, this.data.positionA.y,
					this.data.positionB.x, this.data.positionB.y
				)
			},
		})
		
		this.addStateTemplate("Browsable", `
            mouse first.move = $1
            
            wheel.scroll = zoom_view

            lmb.down = {
                lmb.up = $2 $1
                
                idle.200 = cell_start_drag {
                    mouse.move = cell_drag
                    wheel.scroll = cell_scale
                    lmb.up = $1
                }
                
                mouse.move = start_drag_view >DragView
            }
            
            first.down = {
                first.up = $2 $1
                
                idle.200 = cell_start_drag {
                    first.move = cell_drag
                    first.up = $1
                    
                    idle.300 = $3 $1
                }
                
                first.move = start_drag_view >DragView
            }
            
            rmb.down = {
                rmb.up = $3 $1
            }
            
            #DragView {
                mouse first second.move_real = drag_view
                first.down = start_pinch_view(first) >PinchView
                second.down = start_pinch_view(second) >PinchView
                lmb first second.up = $1
            
                #PinchView {
                    first second.move_real = pinch_view
                    
                    first.up = start_drag_view(second) >DragView
                    second.up = start_drag_view(first) >DragView
                }
            }
            
        `)
		
		this.addState("Empty", `
            %Browsable(
                target(>Node, >Empty),
                empty_action,
                empty_space_special_action
            )
        `)
		
		this.addState("Node", `
            %Browsable(
                target(>Node, >Empty),
                cell_action,
                cell_special_action
            )
        `)
	}
}
