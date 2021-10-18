function weightById(id) {
    return function(a, b) {
        const value1 = a[id]
        const value2 = b[id]
        
        if (value1 > value2) return 1
        if (value1 < value2) return -1
        
        return 0
    }
}

export default class SortedArray {
    constructor(weightFunction, elements = []) {
        if (typeof weightFunction === 'string')
            weightFunction = weightById(weightFunction)
    
        if (typeof weightFunction !== 'function')
            throw Error("SortedArray : Weight has to be a field identifier or a function")

        this.weightFunction = weightFunction
        this.elements = elements
    
        if (this.elements.length > 1)
            this.resort()
    }
    
    *[Symbol.iterator] () {
        for (let element of this.elements)
            yield element
    }
    
    getInsertPosition(element, start = 0, end = this.elements.length - 1) {
        if (this.elements.length <= start)
            return start
        
        if (end <= start) {
            if (this.weightFunction(this.elements[start], element) > 0)
                return start
            return start + 1
        }
        
        const middle = (start + end) / 2 | 0
        
        const weight = this.weightFunction(this.elements[middle], element)
        
        if (weight > 0)
            return this.getInsertPosition(element, start, middle - 1)
        
        if (weight === 0)
            return middle + 1
        
        return this.getInsertPosition(element, middle + 1, end)
    }
    
    add(element) {
        if (this.elements.length === 0) {
            this.elements.push(element)
            return
        }
        const index = this.getInsertPosition(element)
        this.elements.splice(index, 0, element)
    }
    
    remove(element) {
        const index = this.indexOf(element)
        if (index === -1)
            return false
        this.elements.splice(index, 1)
        return true
    }
    
    clear() {
        this.elements.length = 0
    }
    
    get length() {
        return this.elements?.length
    }
    
    set length(x) {
        this.elements.length = x
    }
    
    indexOf(element, fromIndex) {
        return this.elements.indexOf(element, fromIndex)
    }
    
    first(remove) {
        if (remove)
            return this.elements.shift()
        return this.elements[0]
    }
    
    last(remove) {
        if (remove)
            return this.elements.pop()
        return this.elements[this.elements.length - 1]
    }
    
    resort() {
        // TODO: quicksort?
        const elements = [...this.elements]
        this.elements.length = 0
        for (let element of elements) {
            this.add(element)
        }
    }
}
