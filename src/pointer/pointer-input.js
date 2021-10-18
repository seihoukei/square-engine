export default class PointerInput {
	index
	positionable = false
//	pressable = false
//	releaseable = false
	
	constructor(interaction, name) {
		this.interaction = interaction
		this.pointer = this.interaction.pointer
		this.name = name
	}
	
	setIndex(index) {
		this.index = index
	}
	
	setCursor(input) {
		if (!input.positionable)
			throw new Error ("Cursor input should be positionable")
		
		this.positionable = true
		this.cursor = input
		this.getRealPosition = this.cursor.getRealPosition.bind(this.cursor)
		this.getWorldPosition = this.cursor.getWorldPosition.bind(this.cursor)
	}
}
