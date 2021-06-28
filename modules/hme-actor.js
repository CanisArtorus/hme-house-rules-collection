
export class HMEActor {
	static async skillDevRoll(item, actor = this) {
        const result = await game.hm3.DiceHM3.sdrRoll(item.data);

        if (result?.sdrIncr) {
					const spType =  game.settings.get("hm3", 'specialtyType');
					if(spType == "double") {
            await item.update({
            	"data.improveFlag": false,
              "data.masteryLevel": item.data.data.masteryLevel + (result.sdrIncr === 2 ? 2 : 1)
          	});
					} else if (result.sdrIncr === 1) {
						// is a base skill, so inherit it
						await skillSplash(actor, item);
						result.notes += "\nAll specialties of this skill also gain 1 ML.";
					} else {
						// is specialty
						await item.update({
							"data.improveFlag": false,
							"data.masteryLevel": item.data.data.masteryLevel + 1
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
					await it.update({"data.masteryLevel": it.data.data.masteryLevel + 1});
				}
			}
		});
		await item.update({
			"data.improveFlag": false,
			"data.masteryLevel": item.data.data.masteryLevel + 1
		});
	}

}