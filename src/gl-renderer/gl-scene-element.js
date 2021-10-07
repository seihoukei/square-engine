export default class GLSceneElement {
    length = 0
    
    constructor(scene) {
        this.scene = scene
        this.renderer = scene.renderer
        this.build()
    }
    
    useProgram(name) {
    
    }
    
    setPositionAttribute(name) {
        this.positionAttribute = name
    }
    
    setAttributeBuffer(name, bufferName, length) {
        const type = 0//get from program attribute
        const buffer = this.scene.getBuffer(bufferName, type, length)
    }
    
    setLength(length) {
        this.length = length
    }
    
    render() {
    
    }
    
    build() {}
}