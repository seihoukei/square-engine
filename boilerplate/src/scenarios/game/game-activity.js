import PointerActivity from "../../square-engine/pointer/pointer-activity.js"

export default class GameActivity extends PointerActivity {
	name = "Game"
	defaultState = "Field"
	
	build() {
		this.addAction("target", (input, towerNext, fieldNext) => {
//            console.log("target", input, cellNext, emptyNext)
			return fieldNext
		})
		
		this.addActions({
			tower_action(input) {},
			tower_special_action(input) {},
			field_action(input) {},
			field_special_action(input) {},
		})
		
		this.addStateTemplate("Static", `
            mouse first.move = $1
            
            lmb.down = {
                lmb.up = $2 $1
            }
            
            first.down = {
                first.up = $2 $1
                idle.200 = $3 $1
            }
            
            rmb.down = {
                rmb.up = $3 $1
            }
        `)
		
		this.addState("Field", `
            %Static(
                target(>Tower, >Field),
                field_action,
                field_special_action
            )
        `)
		
		this.addState("Tower", `
            %Static(
                target(>Tower, >Field),
                tower_action,
                tower_special_action
            )
        `)
	}
}
