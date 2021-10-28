const floatArray = new Float64Array(1)
const charFloatArray = new Uint8Array(floatArray.buffer)

export default class Serializer {
    static HEADER = "SQSD"
    static VERSION = 1
    static DATA_TYPES = {
        NULL: 0x00,
        EMPTY: 0x0F,

        ARRAY: 0x10,
        ARRAY_EMPTY: 0x1F,

        OBJECT: 0x20,
        OBJECT_EMPTY: 0x2F,

        NUMBER: 0x30,
        NUMBER_INTEGER: 0x38,
        NUMBER_ZERO: 0x3F,

        STRING: 0x40,
        STRING_EMPTY: 0x4F,

        BOOLEAN_FALSE: 0x50,
        BOOLEAN_TRUE: 0x51,

        OBJECT_REFERENCE: 0x60,
        ARRAY_HOLE: 0x70,
    }

    static #writeFloat(state, data) {
        floatArray.set([data])
        for (let char of charFloatArray)
            state.stream += String.fromCharCode(char)
    }

    static #writeInteger(state, data) {
        do {
            let char = data & 127
            data = data >> 7
            if (data > 0)
                char += 128
            state.stream += String.fromCharCode(char)
        } while (data > 0)
    }

    static #writeType(state, type) {
        state.stream += String.fromCharCode(type)
    }

    static #storeReference(state, data) {
        const reference = state.objectIds.get(data)
        if (reference !== undefined) {
            this.#writeType(state, this.DATA_TYPES.OBJECT_REFERENCE)
            this.#writeInteger(state, reference)
            return true
        }

        state.objects.push(data)
        state.objectIds.set(data, state.objects.length - 1)
        return false
    }

    static #storeName(state, name) {
        const id = state.nameIds[name]
        if (id !== undefined) {
            this.#writeInteger(state, id)
            return
        }
        state.names.push(name)
        state.nameIds[name] = state.names.length - 1
        this.#writeInteger(state, state.names.length - 1)
    }

    static #serializeElement(state, data) {
        if (data === null) {
            this.#serializeNull(state, data)

        } else if (data === undefined) {
            this.#serializeEmpty(state, data)

        } else if (typeof data === "string") {
            this.#serializeString(state, data)

        } else if (typeof data === "number") {
            this.#serializeNumber(state, data)

        } else if (typeof data === "boolean") {
            this.#serializeBoolean(state, data)

        } else if (typeof data === "object" && data instanceof Array) {
            this.#serializeArray(state, data)

        } else if (typeof data === "object") {
            this.#serializeObject(state, data)

        }
    }

    static #serializeNull(state, data) {
        this.#writeType(state, this.DATA_TYPES.NULL)
    }

    static #serializeEmpty(state, data) {
        this.#writeType(state, this.DATA_TYPES.EMPTY)
    }

    static #serializeString(state, data) {
        if (data.length === 0) {
            this.#writeType(state, this.DATA_TYPES.STRING_EMPTY)
            return
        }

        this.#writeType(state, this.DATA_TYPES.STRING)
        this.#writeInteger(state, data.length)

        state.stream += data
    }

    static #serializeNumber(state, data) {
        if (data === 0) {
            this.#writeType(state, this.DATA_TYPES.NUMBER_ZERO)
        } else if (data === ~~(data)) {
            this.#writeType(state, this.DATA_TYPES.NUMBER_INTEGER)
            this.#writeInteger(state, data)
        } else {
            this.#writeType(state, this.DATA_TYPES.NUMBER)
            this.#writeFloat(state, data)
        }
    }

    static #serializeBoolean(state, data) {
        if (data)
            this.#writeType(state, this.DATA_TYPES.BOOLEAN_TRUE)
        else
            this.#writeType(state, this.DATA_TYPES.BOOLEAN_FALSE)
    }

    static #serializeArray(state, data) {
        if (this.#storeReference(state, data))
            return

        if (data.length === 0) {
            this.#writeType(state, this.DATA_TYPES.ARRAY_EMPTY)
            return
        }

        this.#writeType(state, this.DATA_TYPES.ARRAY)
        this.#writeInteger(state, data.length)

        let hole = 0
        for (let i = 0; i < data.length; i++) {
            const element = data[i]
            if (element === undefined) {
                hole++
                continue
            }
            if (hole > 0) {
                this.#serializeArrayHole(state, hole)
                hole = 0
            }
            this.#serializeElement(state, data[i])
        }
        if (hole > 0)
            this.#serializeArrayHole(state, hole)
    }

    static #serializeArrayHole(state, data) {
        if (data === 1) {
            this.#serializeEmpty(0, state)
            return
        }
        this.#writeType(state, this.DATA_TYPES.ARRAY_HOLE)
        this.#writeInteger(state, data)
    }

    static #serializeObject(state, data) {
        if (this.#storeReference(state, data))
            return

        const entries = Object.entries(data)
        if (entries.length === 0) {
            this.#writeType(state, this.DATA_TYPES.OBJECT_EMPTY)
            return
        }

        this.#writeType(state, this.DATA_TYPES.OBJECT)
        this.#writeInteger(state, entries.length)

        for (let [name, entry] of entries) {
            this.#storeName(state, name)
            this.#serializeElement(state, entry)
        }
    }

    static #readString(state, length) {
        const result = state.stream.slice(state.pointer, state.pointer + length)
        state.pointer += length
        return result
    }

    static #readByte(state) {
        const char = state.stream.charCodeAt(state.pointer)
        state.pointer++
        return char
    }

    static #checkByte(state) {
        return state.stream.charCodeAt(state.pointer)
    }

    static #readInteger(state) {
        let value = 0, char = 255, shift = 0
        while (char > 127) {
            char = this.#readByte(state)

            value |= (char & 127) << shift
            shift += 7
        }
        return value
    }

    static #readFloat(state) {
        for (let i = 0; i < charFloatArray.length; i++) {
            charFloatArray[i] = this.#readByte(state)
        }
        return floatArray[0]
    }

    static #checkVersion(state) {
        const header = this.#readString(state, 4)
        if (header !== this.HEADER)
            return false
        return this.#readInteger(state)
    }

    static #storeObject(state, object) {
        state.objects.push(object)
        return object
    }

    static #deserializeArray(state) {
        const length = this.#readInteger(state)
        const array = new Array(length)
        this.#storeObject(state, array)
        for (let i = 0; i < array.length; i++) {
            const type = this.#checkByte(state)
            if (type === this.DATA_TYPES.ARRAY_HOLE) {
                this.#readByte(state)
                const step = this.#readInteger(state)
                i += step - 1
                continue
            }
            const element = this.#deserializeElement(state)
            if (element !== undefined)
                array[i] = element
        }
        return array
    }

    static #deserializeObject(state) {
        const length = this.#readInteger(state)
        const object = {}
        this.#storeObject(state, object)
        for (let i = 0; i < length; i++) {
            const nameIndex = this.#readInteger(state)
            const name = state.names[nameIndex]
            object[name] = this.#deserializeElement(state)
        }
        return object
    }

    static #deserializeString(state) {
        const length = this.#readInteger(state)
        return this.#readString(state, length)
    }

    static #deserializeObjectReference(state) {
        const id = this.#readInteger(state)
        return state.objects[id]
    }

    static #deserializeElement(state) {
        const type = this.#readByte(state)

        switch (type) {
            case this.DATA_TYPES.NULL:
                return null
            case this.DATA_TYPES.EMPTY:
                return undefined
            case this.DATA_TYPES.ARRAY_EMPTY:
                return this.#storeObject(state, [])
            case this.DATA_TYPES.ARRAY:
                return this.#deserializeArray(state)
            case this.DATA_TYPES.OBJECT_EMPTY:
                return this.#storeObject(state, {})
            case this.DATA_TYPES.OBJECT:
                return this.#deserializeObject(state)
            case this.DATA_TYPES.NUMBER_ZERO:
                return 0
            case this.DATA_TYPES.NUMBER:
                return this.#readFloat(state)
            case this.DATA_TYPES.NUMBER_INTEGER:
                return this.#readInteger(state)
            case this.DATA_TYPES.STRING:
                return this.#deserializeString(state)
            case this.DATA_TYPES.STRING_EMPTY:
                return ""
            case this.DATA_TYPES.BOOLEAN_TRUE:
                return true
            case this.DATA_TYPES.BOOLEAN_FALSE:
                return false
            case this.DATA_TYPES.OBJECT_REFERENCE:
                return this.#deserializeObjectReference(state)
        }
    }

    static serialize(data) {
        const state = {
            nameIds: {},
            names: [],
            objectIds: new Map(),
            objects: [],
            stream: "",
        }

        this.#serializeElement(state, data)
        state.data = state.stream
        state.stream = ""

        this.#serializeArray(state, state.names)
        state.init = state.stream
        state.stream = ""

        this.#writeInteger(state, this.VERSION)

        return `${this.HEADER}${state.stream}${state.init}${state.data}`
    }

    static deserialize(data) {
        const state = {
            stream : data,
            pointer : 0,
            names : [],
            objects : [],
        }

        const version = this.#checkVersion(state)
        if (version !== this.VERSION) {
            if (version === false) {
                throw new Error ("Invalid Serializer data")
            }
            console.warn("Serialized data from different version of Serializer detected")
        }

        state.names = this.#deserializeElement(state)
        state.objects = []

        return this.#deserializeElement(state)
    }
}