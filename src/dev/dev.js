import DOM from "../utility/dom.js"

class SquareDev {
    verbose = {
        default : 1,
    }
    
    display = DOM.createDiv(document.body, "debug")
    
    data = {
        log : ``,
    }
    maxLogLength = 20
    
    isVerbose(name = "default") {
        return this.verbose[name] ?? this.verbose.default
    }
    
    setVerbose(name, value = 1) {
        this.verbose[name] = value
    }
    
    report(name, content, oldName = "") {
        if (oldName !== "" && this.data[name] !== undefined)
            this.data[oldName] = this.data[name]
        this.data[name] = content
        this.updateDisplay()
    }
    
    append(name, content) {
        if (this.data.name === undefined)
            return this.report(name, content)
        this.data[name] = `${this.data[name]}\n${content}`
        this.updateDisplay()
    }
    
    rename(oldName, newName) {
        this.data[newName] = this.data[oldName]
        delete this.data[oldName]
        this.updateDisplay()
    }
    
    forget(...names) {
        for (let name of names) {
            delete this.data[name]
        }
    }
    
    log(...data) {
        this.data.log = `${this.data.log.trim()}\n${data.join(", ").trim()}`
        this.data.log = `\n  ${this.data.log.trim().split("\n").map(x => x.trim()).slice(-this.maxLogLength).join("\n  ")}`
        this.updateDisplay()
    }
    
    clearLog() {
        this.data.log = ``
    }
    
    updateDisplay() {
        this.display.innerText = Object.entries(this.data).filter(x => x[0] !== "log" || x[1].length > 0).map(x => x.join(": ")).join("\n")
    }
}


addEventListener("load", () => {
    window.dev = new SquareDev()
})
