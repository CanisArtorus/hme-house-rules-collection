import { Tables } from './modules/data-lut.js';

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

	/**
	 * Messy, but slight changes from Dice: 409
	 * @param {*} actor
	 * @param {*} result
	 */
	static createInjury(actor, result) {
		const BasicItem = game.hm3.HarnMasterItem;
			const injuryDesc = {
					'Blunt':    { 'M': 'Bruise', 'S': 'Fracture', 'G': 'Crush' },
					'Squeeze':  { 'M': 'Bruise', 'S': 'Fracture', 'G': 'Crush' },
					'Edged':    { 'M': 'Cut', 'S': 'Slash', 'G': 'Gash' },
					'Tear':     { 'M': 'Scrape', 'S': 'Rip', 'G': 'Gouge' },
					'Piercing': { 'M': 'Poke', 'S': 'Stab', 'G': 'Impale' },
					'Fire':     { 'M': 'Singe', 'S': 'Burn', 'G': 'Scorch' },
          'Frost':    { 'M': 'Chill', 'S': 'Frostbite', 'G': 'Frozen' },
					'Other':		{ 'M': 'Sting', 'S': 'Zap', 'G': 'Blast' }
			};

			if (result.injuryLevel === 0) return;

			let injuryData = {};
			foundry.utils.mergeObject(injuryData, game.system.model.Item.injury);

			injuryData.injuryLevel = result.injuryLevel;
			injuryData.severity = result.injuryLevelText.slice(0,1);

			injuryData.notes = `Aspect: ${result.aspect}`;

			let locationName = result.location;
			if (injuryDesc[result.aspect]) {
					locationName = `${result.location} ${injuryDesc[result.aspect][injuryData.severity]}`;
			}

			injuryData.healRate = 0;  // until it is tended, we can't determine HR
			let item = BasicItem.create({name: locationName, type: 'injury', data: injuryData}, {parent: actor});

			return item;
	}


			/**
			 * This method calculates many items related to injuries that are used to populate
			 * the chat message with the results of the injury
			 *
			 * @param {String} location
			 * @param {Number} impact
			 * @param {String} aspect
			 * @param {Boolean} addToCharSheet
			 * @param {String} aim
			 * @param {Object} dialogOptions
			 */
			static _calcInjury(location, impact, aspect, addToCharSheet, aim, dialogOptions) {
					const genFaceParts = game.settings.get('hm3', 'faceSubZones');
					const genFingers = game.settings.get('hm3', 'handFingers');
					let isEye = false;

					const result = {
							isRandom: location === 'Random',
							name: dialogOptions.name,
							aim: aim,
							aspect: aspect,
							location: location,
							impact: impact,
							armorType: 'None',
							armorValue: 0,
							effectiveImpact: impact,
							isInjured: false,
							injuryLevel: 0,
							injuryLevelText: 'NA',
							isBleeder: false,
							isFumbleRoll: false,
							isFumble: false,
							isStumbleRoll: false,
							isStumble: false,
							isAmputate: false,
							isKillShot: false,
							addToCharSheet: addToCharSheet,
							shockRoll: 0
					};

					// determine location of injury
					const armorLocationItem = game.hm3.DiceHM3._calcLocation(location, aim, dialogOptions.items);
					if (!armorLocationItem) return;  // this means we couldn't find the location, so no injury

					// Just to make life simpler, get the data element which is what we really care about.
					const armorLocationData = armorLocationItem.data;

					// Provide descriptives
					if (armorLocationData.data.impactType === 'face' && genFaceParts !== 'ignore') {
						let table = Tables.subParts.face;
						if(genFaceParts === 'eyes_gold') {
							table = Tables.subParts['face-gold'];
						} else if (aim.endsWith('-Missile')) {
							table = Tables.subParts['face-missile'];
						}
						result.location = _calcSubLocation(table);
						if (result.location.endsWith(' Eye')) {
							if (genFaceParts === 'eyes_weak') {
								isEye = aspect === 'Piercing' ? 'skull' : false;
							} else {
								isEye = 'eye';
							}
						}
					} else if (armorLocationData.data.impactType === 'hand' && genFingers !== 'ignore') {
						const part = _calcSubLocation(Tables.subParts.hand);
						result.location = armorLocationData.name.replace("Hand", part);
					} else {
						result.location = armorLocationData.name;
					}
					result.armorType = armorLocationData.data.layers === '' ? 'None' : armorLocationData.data.layers;

					// determine effective impact (impact - armor)
					if (isEye) {
							//XXX magic armour would apply
							result.armorValue = 0;
					} else if (aspect === 'Blunt') {
							result.armorValue = armorLocationData.data.blunt;
					} else if (aspect === 'Edged') {
							result.armorValue = armorLocationData.data.edged;
					} else if (aspect === 'Piercing') {
							result.armorValue = armorLocationData.data.piercing;
					} else {
							result.armorValue = armorLocationData.data.fire;
					}
					result.effectiveImpact = Math.max(impact - result.armorValue, 0);

					// Either mark as injured, or if not injured immediately return.
					if (result.effectiveImpact === 0) {
						result.injuryLevelText = 'NA';
						result.injuryLevel = 0;
						return result;
					}
					result.isInjured = true;

					// Determine Injury Level
					// and other flags
					foundry.utils.mergeObject(result, _lutWound(result.effectiveImpact, aspect, armorLocationData, isEye));

					return result;
			}

		static _lutWound(eI, aspect, armorLocationData, isEye = false) {
			const enableAmputate = game.settings.get('hm3', 'amputation');
			const enableBloodloss = game.settings.get('hm3', 'bloodloss');
			const enableLimbInjuries = game.settings.get('hm3', 'limbInjuries');

			const tableSource = game.settings.get('hm3','injuryTable');
			// const woundType = isEye ? isEye : armorLocationData.data.impactType;
			const woundType = isEye || // armorLocationData.getFlag('hm-enhanced',)
				armorLocationData.data.damagetype || armorLocationData.data.impactType;
			const result = {
					aspect: aspect,
					injuryLevel: 0,
					injuryLevelText: 'NA',
					isBleeder: false,
					isFumbleRoll: false,
					isFumble: false,
					isStumbleRoll: false,
					isStumble: false,
					isAmputate: false,
					isKillShot: false,
					shockRoll: 0
			};
			let injuryCode = {'il': 'NA', "shock": 0, 'f':0, 's':0, 'kill': 0, 'amp': 0, 'bleed': 0};
			let referenceRow = {'Other':{1: injuryCode}};
			if( tableSource === 'artorus'){
				if (Tables.injuriesArtorus[woundType] ) {
					referenceRow = Tables.injuriesArtorus[woundType];
				} else {
					referenceRow = Tables.injuriesEnhanced[woundType];
				}
			} else if( tableSource === 'enhanced') {
				referenceRow = Tables.injuriesEnhanced[woundType];
			}

			let dmgAspect = aspect;
			// TODO: massage extension damage types
			const refColumn = referenceRow[dmgAspect];
			if(!refColumn){
				// Sub-location tables do not list the aspects they don't apply to.
				// Go use the parent location injury table in that case.
				const parentLocation = woundType.split('-')[0];
				if (parentLocation != woundType){
					return _lutWound(eI, aspect, armorLocationData, parentLocation);
				}
				// // TODO: fallback table or basic injury bands
				return result;
			}
			for( let i = eI; i > 0; i--){
				if(refColumn[i]){
					injuryCode = refColumn[i];
					break;
				}
			}
			// if(injuryCode.il === 'NA'){
			// 	return result;
			// }
			// Should never be NA & should always be a valid letter+digit code
			result.injuryLevel = new Number(injuryCode.il.slice(1,2));
			result.injuryLevelText = injuryCode.il;
			//if(game.settings.get('hm3', 'bleedingLevels')){
				result.isBleeder = enableBloodloss && injuryCode.bleed;
			//} else {}
			if(enableLimbInjuries){
				if( // game.settings.get('hm3', 'variableFumble') &&
				 injuryCode.f > 0){
					result.isFumbleRoll = injuryCode.f;
				} else if (injuryCode.f == -1) {
					result.isFumble = true;
				}
				if( // game.settings.get('hm3', 'variableStumble')
					injuryCode.s > 0){
					result.isStumbleRoll = injuryCode.s;
				} else if (injuryCode.s == -1){
					result.isStumble = true;
				}
			}
			result.isAmputate = enableAmputate && injuryCode.amp;
			result.isKillShot = injuryCode.kill;
			result.shockRoll = injuryCode.shock;

			return result;
		}

}