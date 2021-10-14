export default class PointerInput {
	index
	
	constructor(interaction, name) {
		this.interaction = interaction
		this.pointer = this.interaction.pointer
		this.name = name
	}
	
	setIndex(index) {
		this.index = index
	}
}
