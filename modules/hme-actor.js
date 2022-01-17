/**
 * Mechanisms to override parts of the HarnMasterActor class,
 * and HTML fixups to the actor sheets
 *
 * This invovles adding the following flags to each actor (scope = 'hm-enhanced'):
 *
 */
export class HMEActor {

	/**
	 * Just after the base system did it
	 */
	static prepareDerivedData(actor) {
		const actorData = actor.data;
		const data = actorData.data;
		const eph = data.eph;

		if (game.settings.get('hm3', 'unencSenses') && data.abilities.smell.effective != eph.smell) {
			data.abilities.eyesight.effective = Math.max(Math.round(eph.eyesight + Number.EPSILON - data.universalPenalty), 0);
			data.abilities.hearing.effective = Math.max(Math.round(eph.hearing + Number.EPSILON - data.universalPenalty), 0);
			data.abilities.smell.effective = Math.max(Math.round(eph.smell + Number.EPSILON - data.universalPenalty), 0);
		}

		if (game.settings.get('hm3', 'dodgeStumble')) {
			eph.stumbleTarget = Math.max(data.abilities.agility.effective, Math.round((data.dodge / 5) + Math.EPSILON));
		}
	}

	static async skillDevRoll(item, actor = this) {
        const result = await game.hm3.DiceHM3.sdrRoll(item.data);

        if (result?.sdrIncr) {
					const spType =  game.settings.get("hm3", 'specialtyType');
					if(spType == "double") {
            await item.update({
            	"data.improveFlag": false,
              "data.masteryLevel": +(item.data.data.masteryLevel) + (result.sdrIncr === 2 ? 2 : 1)
          	});
					} else if (result.sdrIncr === 1) {
						// is a base skill, so inherit it
						await skillSplash(actor, item);
						result.notes += "\nAll specialties of this skill also gain 1 ML.";
					} else {
						// is specialty
						await item.update({
							"data.improveFlag": false,
							"data.masteryLevel": +(item.data.data.masteryLevel) + 1
						});
						if (spType === "splash") {
							// fetch root skill to splash - without assuming format
							const mixedName = item.data.name.match(/\(([^\)]+)\)/);
							const generalSkill = null;
							actor.items.forEach(it => {
								if (['skill', 'spell', 'invocation', 'psionic'].includes(it.data.type)) {
									if (mixedName.includes(it.data.name)) {
										generalSkill = it;
										break;
									}
								}
							});
							// provide bonus roll
							const subsequent = await game.hm3.DiceHM3.sdrRoll(generalSkill.data);
							if (subsequent?.sdrIncr) {
								await skillSplash(actor, generalSkill);
								subsequent.notes += "\nAll specialties of this skill also gain 1 ML.";
							}
						} else {
							result.notes += "\nHouse rule says specialties only gain 1 ML.";
						}
					}
        } else {
						// failed to improve, move on
            await item.update({ "data.improveFlag": false });
        }
        return result;
    }

		/**
		 *	Improve the skill `item`, and all Specializations of it in `actor` also
		 */
	static async skillSplash(actor, item) {
		const testName = item.data.name;
		actor.items.forEach(it => {
			if (['skill', 'spell', 'invocation', 'psionic'].includes((it.data.type)) {
				let testSpec = it.data.name.match(/\(([^\)]+)\)/);
				if (testSpec?.includes(testName)) {
					await it.update({"data.masteryLevel": +(it.data.data.masteryLevel) + 1});
				}
			}
		});
		await item.update({
			"data.improveFlag": false,
			"data.masteryLevel": +(item.data.data.masteryLevel) + 1
		});
	}

	static calcShockIndex(actor) {
		const data = actor.data.data;
		if (game.settings.get('hm3', 'combiShockIndex')) {
			data.shockindex.value = HMEActor.combiProb(data.endurance, data.universalPenalty);
		} else {
			let uniPen = data.universalPenalty;
			if (data.endurance <= (6* uniPen)) {
				data.shockindex.value = HarnMasterActor.normProb(data.endurance, uniPen * 3.5, uniPen);
			} else {
				data.shockindex.value = 100;
			}
		}
	}

	/**
	 * @param {Number} y Target number
	 * @param {number} N Number of d6 rolled
	 */
	static combiProb(y, N) {
		if (y > 6 * N) {return 0;}
		let i = 0;
		let sum = 0;
		let sign = -1;
		while((y - N) > 6*i) {
			sign = -sign;
			sum += sign * HMEActor.combinatoric(N, i) * HMEActor.combinatoric(y - 6 * i, N);
			i++;
		}
		let prob = sum / Math.pow(6, N);
		return Math.round(prob * 100)
	}

	static combinatoric(a, b) {
		if (b > a) {return 0;}
		let denom = Math.max(b, a - b);
		return _factorial(x, denom) / _factorial(x - denom, 0);
	}

	static _factorial(x, q) {
		let result = 1;
		let y = x;
		while (y > q){
			result *= y;
			y--;
		}
		return result;
	}

	static actorRenderFix(actorSheet, html, data) {
		const actor = actorSheet.actor;
		const origData = data;
		data = origData.data;

		// over-arching things
		// and changed columns
	}

}