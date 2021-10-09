export default class GLTypes {
    static GL_TYPES = {
        [WebGL2RenderingContext.FLOAT]: {
            attributePointerSetter: "vertexAttribPointer",
            arrayType: Float32Array,
            arraySetter: "uniform1fv",
            setter: "uniform1f",
            size: 1,
            type: WebGL2RenderingContext.FLOAT,
        },
        [WebGL2RenderingContext.FLOAT_VEC2]: {
            attributePointerSetter: "vertexAttribPointer",
            arrayType: Float32Array,
            arraySetter: "uniform2fv",
            setter: "uniform2f",
            size: 2,
            type: WebGL2RenderingContext.FLOAT,
        },
        [WebGL2RenderingContext.FLOAT_VEC3]: {
            attributePointerSetter: "vertexAttribPointer",
            arrayType: Float32Array,
            arraySetter: "uniform3fv",
            setter: "uniform3f",
            size: 3,
            type: WebGL2RenderingContext.FLOAT,
        },
        [WebGL2RenderingContext.FLOAT_VEC4]: {
            attributePointerSetter: "vertexAttribPointer",
            arrayType: Float32Array,
            arraySetter: "uniform4fv",
            setter: "uniform4f",
            size: 4,
            type: WebGL2RenderingContext.FLOAT,
        },
        [WebGL2RenderingContext.INT]: {
            attributePointerSetter: "vertexAttribIPointer",
            arrayType: Int32Array,
            arraySetter: "uniform1iv",
            setter: "uniform1i",
            size: 1,
            type: WebGL2RenderingContext.INT,
        },
        [WebGL2RenderingContext.UNSIGNED_INT]: {
            attributePointerSetter: "vertexAttribIPointer",
            arrayType: Uint32Array,
            arraySetter: "uniform1uiv",
            setter: "uniform1ui",
            size: 1,
            type: WebGL2RenderingContext.UNSIGNED_INT,
        },
        [WebGL2RenderingContext.UNSIGNED_SHORT]: {
            attributePointerSetter: "vertexAttribIPointer",
            arrayType: Uint16Array,
            arraySetter: "uniform1uiv",
            setter: "uniform1ui",
            size: 1,
            type: WebGL2RenderingContext.UNSIGNED_SHORT,
        },
        [WebGL2RenderingContext.INT_VEC2]: {
            attributePointerSetter: "vertexAttribIPointer",
            arrayType: Int32Array,
            arraySetter: "uniform2iv",
            setter: "uniform2i",
            size: 2,
            type: WebGL2RenderingContext.INT,
        },
        [WebGL2RenderingContext.INT_VEC3]: {
            attributePointerSetter: "vertexAttribIPointer",
            arrayType: Int32Array,
            arraySetter: "uniform3iv",
            setter: "uniform3i",
            size: 3,
            type: WebGL2RenderingContext.INT,
        },
        [WebGL2RenderingContext.INT_VEC4]: {
            attributePointerSetter: "vertexAttribIPointer",
            arrayType: Int32Array,
            arraySetter: "uniform4iv",
            setter: "uniform4i",
            size: 4,
            type: WebGL2RenderingContext.INT,
        },
        [WebGL2RenderingContext.BOOL]: {
            attributePointerSetter: "vertexAttribIPointer",
            arrayType: Int32Array,
            arraySetter: "uniform1fv",
            setter: "uniform1f",
            size: 1,
            type: WebGL2RenderingContext.BOOL,
        },
        [WebGL2RenderingContext.BOOL_VEC2]: {
            attributePointerSetter: "vertexAttribIPointer",
            arrayType: Int32Array,
            arraySetter: "uniform2fv",
            setter: "uniform2f",
            size: 2,
            type: WebGL2RenderingContext.BOOL,
        },
        [WebGL2RenderingContext.BOOL_VEC3]: {
            attributePointerSetter: "vertexAttribIPointer",
            arrayType: Int32Array,
            arraySetter: "uniform3fv",
            setter: "uniform3f",
            size: 3,
            type: WebGL2RenderingContext.BOOL,
        },
        [WebGL2RenderingContext.BOOL_VEC4]: {
            attributePointerSetter: "vertexAttribIPointer",
            arrayType: Int32Array,
            arraySetter: "uniform4fv",
            setter: "uniform4f",
            size: 4,
            type: WebGL2RenderingContext.BOOL,
        },
        [WebGL2RenderingContext.SAMPLER_1D]: {
            attributePointerSetter: "vertexAttribIPointer",
            arrayType: Uint16Array,
            arraySetter: "uniform1uiv",
            setter: "uniform1ui",
            size: 1,
            type: WebGL2RenderingContext.UNSIGNED_INT,
        },
        [WebGL2RenderingContext.SAMPLER_2D]: {
            attributePointerSetter: "vertexAttribIPointer",
            arrayType: Uint16Array,
            arraySetter: "uniform1uiv",
            setter: "uniform1ui",
            size: 1,
            type: WebGL2RenderingContext.UNSIGNED_INT,
        },
        [WebGL2RenderingContext.SAMPLER_2D_ARRAY]: {
            attributePointerSetter: "vertexAttribIPointer",
            arrayType: Uint16Array,
            arraySetter: "uniform1uiv",
            setter: "uniform1ui",
            size: 1,
            type: WebGL2RenderingContext.UNSIGNED_INT,
        },
        [WebGL2RenderingContext.SAMPLER_CUBE]: {
            attributePointerSetter: "vertexAttribIPointer",
            arrayType: Uint16Array,
            arraySetter: "uniform1uiv",
            setter: "uniform1ui",
            size: 1,
            type: WebGL2RenderingContext.UNSIGNED_INT,
        },
        [WebGL2RenderingContext.FLOAT_MAT2]: {
            attributePointerSetter: "vertexAttribPointer",
            arrayType: Float32Array,
            arraySetter: "uniformMatrixfv",
            setter: false,
            size: 4,
            type: WebGL2RenderingContext.FLOAT,
        },
        [WebGL2RenderingContext.FLOAT_MAT2x3]: {
            attributePointerSetter: "vertexAttribPointer",
            arrayType: Float32Array,
            arraySetter: "uniformMatrixfv",
            setter: false,
            size: 6,
            type: WebGL2RenderingContext.FLOAT,
        },
        [WebGL2RenderingContext.FLOAT_MAT2x4]: {
            attributePointerSetter: "vertexAttribPointer",
            arrayType: Float32Array,
            arraySetter: "uniformMatrixfv",
            setter: false,
            size: 8,
            type: WebGL2RenderingContext.FLOAT,
        },
        [WebGL2RenderingContext.FLOAT_MAT3x2]: {
            attributePointerSetter: "vertexAttribPointer",
            arrayType: Float32Array,
            arraySetter: "uniformMatrixfv",
            setter: false,
            size: 6,
            type: WebGL2RenderingContext.FLOAT,
        },
        [WebGL2RenderingContext.FLOAT_MAT3]: {
            attributePointerSetter: "vertexAttribPointer",
            arrayType: Float32Array,
            arraySetter: "uniformMatrixfv",
            setter: false,
            size: 9,
            type: WebGL2RenderingContext.FLOAT,
        },
        [WebGL2RenderingContext.FLOAT_MAT3x4]: {
            attributePointerSetter: "vertexAttribPointer",
            arrayType: Float32Array,
            arraySetter: "uniformMatrixfv",
            setter: false,
            size: 12,
            type: WebGL2RenderingContext.FLOAT,
        },
        [WebGL2RenderingContext.FLOAT_MAT4x2]: {
            attributePointerSetter: "vertexAttribPointer",
            arrayType: Float32Array,
            arraySetter: "uniformMatrixfv",
            setter: false,
            size: 8,
            type: WebGL2RenderingContext.FLOAT,
        },
        [WebGL2RenderingContext.FLOAT_MAT4x3]: {
            attributePointerSetter: "vertexAttribPointer",
            arrayType: Float32Array,
            arraySetter: "uniformMatrixfv",
            setter: false,
            size: 12,
            type: WebGL2RenderingContext.FLOAT,
        },
        [WebGL2RenderingContext.FLOAT_MAT4]: {
            attributePointerSetter: "vertexAttribPointer",
            arrayType: Float32Array,
            arraySetter: "uniformMatrixfv",
            setter: false,
            size: 16,
            type: WebGL2RenderingContext.FLOAT,
        },
    }
    
    static get(type) {
        return this.GL_TYPES[type]
    }
}