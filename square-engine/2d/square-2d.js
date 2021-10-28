import Square2DScene from "./2d-scene.js"
import Square2DSceneElement from "./2d-scene-element.js"
import Viewport from "../viewport/viewport.js"

export default class Square2D {
    static Scene = Square2DScene
    static SceneElement = Square2DSceneElement

    active = false
    boundFrame = this.frame.bind(this)
    nextFrame = -1

    constructor(canvas, settings = {}) {
        this.canvas = canvas

        this.viewport = new Viewport(this.canvas, settings.viewportSettings)

        this.init()
    }

    init() {
        this.context = this.canvas.getContext("2d")

        if (this.scene)
            this.scene.init()
    }

    getViewport() {
        return this.viewport
    }

    setScene(scene) {
        this.scene?.deactivate()
        this.scene = scene
        this.scene?.activate()
    }

    activate() {
        if (this.active || !this.scene)
            return

        this.active = true

        this.scene.activate()
        this.nextFrame = requestAnimationFrame(this.boundFrame)
    }

    deactivate() {
        if (!this.active)
            return

        this.active = false

        this.scene?.deactivate()

        cancelAnimationFrame(this.nextFrame)
        this.nextFrame = -1

        delete this.then
    }

    frame(now) {
        if (this.scene === undefined || !this.active) {
            return this.deactivate()
        }

        if (this.countStart === undefined) {
            this.countFrames = 0
            this.countStart = now
        }

        if (now - this.countStart > 200) {
            if (window.dev?.isVerbose("fps"))
                dev.report("fps",(1000 * this.countFrames / (now - this.countStart)).toFixed(2))
            this.countStart = now
            this.countFrames = 0
        }

        this.countFrames++

        this.viewport.updateSize()

        const deltaTime = now - (this.then ?? now)
        this.then = now

        this.context.resetTransform()
        this.context.clearRect(0, 0, this.viewport.width, this.viewport.height)

        this.scene.advanceView(deltaTime)
        this.scene.render(now)

        this.nextFrame = requestAnimationFrame(this.boundFrame)
    }
}