import Trigger from "../utility/trigger.js"

const VIEWPORT_DEFAULT_SETTINGS = {
	canvasScale : 1, // canvas grain
	devicePixelRatio : window.devicePixelRatio ?? 1,
}

// noinspection JSUnusedGlobalSymbols
export default class Viewport extends Trigger.Class(["change"]) {
	#settings = Object.assign({}, VIEWPORT_DEFAULT_SETTINGS)
	
	constructor(canvas, settings) {
		super()

		this.canvas = canvas
		
		Object.assign(this.#settings, settings)
		
		this.#updateDimensions()
	}
	
// private

	// set up viewport and canvas dimensions
	#updateDimensions() {
		//surface size
		this.realWidth  = this.canvas.clientWidth 
		this.realHeight = this.canvas.clientHeight
		
		this.scaling = this.#settings.devicePixelRatio / this.#settings.canvasScale
		
		//ui surface size
		this.width  = this.realWidth  * this.scaling
		this.height = this.realHeight * this.scaling
		
		this.canvas.width  = this.width
		this.canvas.height = this.height

		this.events.change(this.width, this.height)
	}
	
// public
	getSurfaceSize(info = {}) {
		info.width  = this.realWidth
		info.height = this.realHeight
		return info
	}
	
	getSize(info = {}) {
		info.width  = this.width
		info.height = this.height
		return info
	}
	
	// check if canvas size changed, update accordingly
	updateSize() {
		if (this.canvas.clientWidth === this.realWidth && this.canvas.clientHeight === this.realHeight)
			return

		this.#updateDimensions()
	}
	
}