import Serializer from "../square-engine/utility/serializer.js"

/*
const data = {
    x : 100,
    y : 200,
    radius : 300,
    array : [0,,,,10,12,,20, false, true],
    object : {
        x : 30,
        y : 50,
        radius : 300,
        name : "Object",
    },
    null : null,
}

data.otherObject = {
    parent : data.object,
    x : 1,
    y : 2,
    radius : 4,
    name : "Other object",
}

//data.object.parent = data.otherObject
data.object.data = data.array
data.otherObject.data = data.array
*/

const data = []
data[4] = null
data[123] = data
data[300] = 45
data[500] = 45.1

const serialized = Serializer.serialize(data)
const deserialized = Serializer.deserialize(serialized)
console.log(serialized, serialized.split``.map(x => x.charCodeAt(0)))
console.log(data, deserialized)
//console.log(data)
//console.log(serialized)
