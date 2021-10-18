export default class Utility {
	static getConstantName(storage, value) {
		const index = Object.values(storage).indexOf(value)
		if (index === -1)
			return "unidentified"
		return Object.keys(storage)[value]
	}
	
	static shuffle(array) {
		let m = array.length, t, i;
		
		// While there remain elements to shuffle…
		while (m) {
			
			// Pick a remaining element…
			i = Math.floor(Math.random() * m--);
			
			// And swap it with the current element.
			t = array[m];
			array[m] = array[i];
			array[i] = t;
		}
		
		return array;
	}
}
