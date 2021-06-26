
class HMEActor {
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
							// fetch root skill to splash
							const superName = item.data.name.split("[")[0];
							const generalSkill = actor.items.get(superName);
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

	static async skillSplash(actor, item) {
		const testPrefix = item.data.name + "[";
		actor.items.forEach(it => {
			if (it.data.type === 'skill') {
				if (it.data.name.startsWith(testPrefix)) {
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