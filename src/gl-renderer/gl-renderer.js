export default class GLRenderer {
    constructor(canvas) {
        this.canvas = canvas
        this.init()
    }
    
    init() {
        this.gl = this.canvas.getContext("webgl2")
    }
    
    setScene(scene) {
        this.scene = scene
    }
    
    render() {
        if (this.scene)
            this.scene.render()
    }
    
    setView(view) {
    
    }
}