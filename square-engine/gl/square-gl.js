import GLProgram from "./gl-program.js"
import GLPositionBuffers from "./gl-position-buffers.js"
import GLScene from "./gl-scene.js"
import GLAttribute from "./gl-attribute.js"
import GLBuffer from "./gl-buffer.js"
import GLSceneElement from "./gl-scene-element.js"
import GLTexture from "./gl-texture.js"
import GLTypes from "./gl-types.js"
import GLUniform from "./gl-uniform.js"
import GlRenderer from "./gl-renderer.js"

export default class SquareGL {
    static Scene = GLScene
    static Attribute = GLAttribute
    static Buffer = GLBuffer
    static PositionBuffers = GLPositionBuffers
    static Program = GLProgram
    static Renderer = GlRenderer
    static SceneElement = GLSceneElement
    static Texture = GLTexture
    static Types = GLTypes
    static Uniform = GLUniform
}