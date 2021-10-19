import PointerState from "./pointer-state.js"

export default class PointerStateCompiler {
    static compile(source, templates) {
        this.templates = templates
        return this.state(this.tokenize(source))
    }
    
    static compileActions(source) {
        this.templates = {}
        return this.actions(this.tokenize(source))
    }
    
    static tokenize(source) {
        return source
            .replace(/([=#>%{}\[\](),."^\n])/gm, " $1 ")
            .replace(/\\[ \t]*\n/gm, " ")
            .replace(/[ \t]+/g, " ")
            .trim()
            .split(" ")
            .reverse()
    }
    
    static state(tokens) {
        const state = new PointerState()
        state.setParent(this.currentState)
        
        const lastState = this.currentState
        this.currentState = state
        
        while (tokens.length) {
            const token = tokens.pop()
            if (token === "%") {
                this.template(tokens)
                continue
            }
            if (token === "}") {
                break
            }
            if (token === "/*") {
                this.comment(tokens, "*/")
                continue
            }
            if (token === "//") {
                this.comment(tokens, "\n")
                continue
            }
            if (token === "#") {
                const substate = this.namedState(tokens)
                state.addSubstate(substate)
                continue
            }
            if (token === "\n") {
                continue
            }
            tokens.push(token)
            const entry = this.entry(tokens)
            state.addEntry(entry)
        }
        this.currentState = lastState
        return state
    }
    
    static namedState(tokens) {
        const name = tokens.pop()
        if (tokens.pop() !== "{")
            throw new Error ("{ expected")
        const state = this.state(tokens)
        state.name = name
        return state
    }
    
    static template(tokens) {
        const name = tokens.pop()
        const template = this.templates[name]
        if (!template)
            throw new Error (`Unknown template ${name}`)
        const insert = [...template]
        if (tokens[tokens.length - 1] === "(") {
            tokens.pop()
            const data = this.brackets(tokens)
            let i = insert.length
            while (i--) {
                if (insert[i][0] !== "$")
                    continue
                const position = +template[i].slice(1)
                insert.splice(i, 1, ...data[position - 1])
            }
        }
        tokens.push(...insert)
    }
    
    static brackets(tokens) {
        const elements = []
        let element = []
        while (tokens.length) {
            const token = tokens.pop()
            if (token === ")") {
                elements.push(element.reverse())
                return elements
            }
            if (token === "{") {
                element.push(this.state(tokens))
                continue
            }
            if (token === "(") {
                element.push(this.brackets(tokens))
                continue
            }
            if (token === ",") {
                elements.push(element.reverse())
                element = []
                continue
            }
            if (token === "\n")
                continue
            if (token === "/*") {
                this.comment(tokens, "*/")
                continue
            }
            if (token === "//") {
                this.comment(tokens, "\n")
                continue
            }
            
            element.push(token)
        }
    }
    
    static comment(tokens, end) {
        let i = tokens.length
        while (i--) {
            if (tokens[i] === end) {
                tokens.length = i
                return
            }
        }
        tokens.length = 0
    }
    
    static entry (tokens) {
        const events = this.events(tokens)
        const actions = this.actions(tokens)
        return {events, actions}
    }
    
    static interactions (tokens) {
        const interactions = []
        while (tokens.length) {
            const token = tokens.pop()
            if (token === "/*") {
                this.comment(tokens, "*/")
                continue
            }
            if (token === "//") {
                this.comment(tokens, "\n")
                continue
            }
            if (token === ".")
                return interactions
            interactions.push(token)
        }
        return interactions
    }
    
    static events (tokens) {
        const events = []
        while (tokens.length && tokens[tokens.length - 1] !== "=") {
            const interactions = this.interactions(tokens)
            const event = tokens.pop()
            events.push( {
                interactions, event
            })
        }
        tokens.pop()
        return events
    }
    
    static actions (tokens) {
        const actions = []
        while (tokens.length) {
            const token = tokens.pop()
            if (token === "/*") {
                this.comment(tokens, "*/")
                continue
            }
            if (token === "//") {
                this.comment(tokens, "\n")
                continue
            }
            if (token === "{") {
                actions.push(this.state(tokens))
                continue
            }
            if (token === "(") {
                actions.push(this.brackets(tokens))
                continue
            }
            if (token === "\n")
                return actions.reverse()
            actions.push(token)
        }
        return actions.reverse()
    }
}
