export default class Web {
	
	static httpStatus(response) {
		if (response.status >= 200 && response.status < 300) {
			return Promise.resolve(response)
		} else {
			return Promise.reject(new Error(response.statusText))
		}
	}
	
	static getTextData(url) {
		return fetch(url)
			.then(this.httpStatus)
			.then((response) => response.text())
			.catch((message) => {
				console.log("Failed to fetch " + url + " - " + message)
			})
	}
	
	static VERTEX_SHADER_EXTENSION = '.vert'
	static FRAGMENT_SHADER_EXTENSION = '.frag'
	
	static loadShaders(list) {
		const loaders = []
		const shaders = {}
		
		const loadShader = (name, type, path) => {
			return this.getTextData(path)
				.then(data => shaders[name][type] = data)
				.catch(error => console.log("Failed to load " + type + " shader for " + name + ": " + error))
		}
		
		for (let [name, address] of Object.entries(list)) {
			shaders[name] = {}
			loaders.push(loadShader(name, "vertex", address + this.VERTEX_SHADER_EXTENSION))
			loaders.push(loadShader(name, "fragment", address + this.FRAGMENT_SHADER_EXTENSION))
		}
		
		return Promise.all(loaders)
			.then(() => Promise.resolve(shaders))
	}
}