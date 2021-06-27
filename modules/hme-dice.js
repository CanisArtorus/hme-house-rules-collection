export class DiceHME {
	static _calcSubLocation(list) {
		let result = null;
		let rollWeight = Math.floor(MersenneTwister.random() * list.total) + 1;
		let done = false;
		list.weights.forEach((sl, weight) => {
			if (!done) {
				rollWeight -= weight;
				if (rollWeight <= 0) {
					result = sl;
					done = true;
					break;
				}
			}
		});
		return result;
	}

	
}