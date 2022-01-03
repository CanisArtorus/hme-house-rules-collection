/**
 * HME item class
 * Implementing the overriden mechanisms from HarnMasterItem
 * and the HTML fixups to each Item sheet, with their pile of templates
 *
 * This involves defining the following flags (in the scope "hm-enhanced"):
 * (item type)	(Flag)
 * armorlocation	aim-high-missile
 * armorlocation	aim-mid-missile
 * armorlocation	aim-low-missile
 * armorlocation	aim-arms
 * armorlocation	damagetype
 *
 */
export class HMEItem {
	static prepareData(item) {
		const itemData= item.data;
		const data = itemData.data;

		if(itemData.type === 'armorlocation') {
			const validTypes = ["skull", "face", "neck", "shoulder", "upperarm", "elbow", "forearm", "hand", "thorax", "abdomen", "groin", "hip", "thigh", "knee", "calf", "foot", "wing", "tentacle", "tail"];

			if (data.impactType === 'total') {
				data.probWeight.high = 0;
				data.probWeight.mid = 0;
				data.probWeight.low = 0;
				data.probWeight.arms = 0;
				data.probWeight["high-missile"] = 0;
				data.probWeight["mid-missile"] = 0;
				data.probWeight["low-missile"] = 0;
				data.damagetype = 'total';
			} else if (validTypes.includes(data.impactType)) {
				data.probWeight.arms = Tables.arms_zone[data.impactType];
				foundry.utils.mergeObject(data.probWeight, Tables.aimz_missile[data.impactType]);
				data.damagetype = data.impactType;
			} else if (data.impactType === 'thorax-gap') {
				data.probWeight.arms = item.getFlag('hm-enhanced', 'aim-arms') || 0;
				data.probWeight["high-missile"] = item.getFlag('hm-enhanced', 'aim-high-missile') || 0;
				data.probWeight["mid-missile"] = item.getFlag('hm-enhanced', 'aim-mid-missile') || 0;
				data.probWeight["low-missile"] = item.getFlag('hm-enhanced', 'aim-low-missile') || 0;
				data.damagetype = item.getFlag('hm-enhanced', 'damagetype') || 'thorax-gap';
			} else if (data.impactType === 'thorax-back') {
				data.probWeight.arms = item.getFlag('hm-enhanced', 'aim-arms') || 0;
				data.probWeight["high-missile"] = item.getFlag('hm-enhanced', 'aim-high-missile') || 0;
				data.probWeight["mid-missile"] = item.getFlag('hm-enhanced', 'aim-mid-missile') || 0;
				data.probWeight["low-missile"] = item.getFlag('hm-enhanced', 'aim-low-missile') || 0;
				data.damagetype = item.getFlag('hm-enhanced', 'damagetype') || 'thorax-back';
			} else if (data.impactType === 'abdomen-back') {
				data.probWeight.arms = item.getFlag('hm-enhanced', 'aim-arms') || 0;
				data.probWeight["high-missile"] = item.getFlag('hm-enhanced', 'aim-high-missile') || 0;
				data.probWeight["mid-missile"] = item.getFlag('hm-enhanced', 'aim-mid-missile') || 0;
				data.probWeight["low-missile"] = item.getFlag('hm-enhanced', 'aim-low-missile') || 0;
				data.damagetype = item.getFlag('hm-enhanced', 'damagetype') || 'abdomen-back';
			} else {
				data.probWeight.arms = item.getFlag('hm-enhanced', 'aim-arms') || 0;
				data.probWeight["high-missile"] = item.getFlag('hm-enhanced', 'aim-high-missile') || 0;
				data.probWeight["mid-missile"] = item.getFlag('hm-enhanced', 'aim-mid-missile') || 0;
				data.probWeight["low-missile"] = item.getFlag('hm-enhanced', 'aim-low-missile') || 0;
				data.damagetype = item.getFlag('hm-enhanced', 'damagetype') || 'total';
			}
		}
	}

	// static calcInjurySeverity() {
	// 	//// TODO:
	// }

	static async checkWeaponBreak(atkWeapon, defWeapon) {
		if(!game.settings.get('hm3', 'weaponDamage')){
			return FurnacePatching.callOriginalFunction(CONFIG.Combat.documentClass, 'checkWeaponBreak', atkWeapon, defWeapon);
		}

    const atkToken = atkWeapon?.parent?.token;
    const defToken = defWeapon?.parent?.token;

    if (!atkWeapon || !atkToken) {
        console.error(`Attack weapon was not specified`);
        return {attackWeaponBroke: false, defendWeaponBroke: false};
    }

    if (!defWeapon || !defToken) {
        console.error(`Defend weapon was not specified`);
        return {attackWeaponBroke: false, defendWeaponBroke: false};
    }

    // Weapon Break Check
    let atkWeaponBroke = false;
    let defWeaponBroke = false;
		let atkWeaponFlaw = false;
		let defWeaponFlaw = false;

    const atkWeaponQuality = atkWeapon.data.data.weaponQuality;
    const defWeaponQuality = defWeapon.data.data.weaponQuality;

    const atkBreakRoll = await new Roll('3d6').evaluate({async: true});
    const defBreakRoll = await new Roll('3d6').evaluate({async: true});

    if (atkWeaponQuality <= defWeaponQuality) {
        // Check attacker first, then defender
        atkWeaponBroke = atkBreakRoll.total > atkWeaponQuality;
				atkWeaponFlaw = !atkWeaponBroke && atkBreakRoll.total == atkWeaponQuality;
        defWeaponBroke = !atkWeaponBroke && defBreakRoll.total > defWeaponQuality;
				defWeaponFlaw = !atkWeaponBroke && !defWeaponBroke && defBreakRoll.total == defWeaponQuality;
    } else {
        // Check defender first, then attacker
        defWeaponBroke = defBreakRoll.total > defWeaponQuality;
				defWeaponFlaw = !defWeaponBroke && defBreakRoll.total == defWeaponQuality;
        atkWeaponBroke = !defWeaponBroke && atkBreakRoll.total > atkWeaponQuality;
				atkWeaponFlaw = !defWeaponBroke && !atkWeaponBroke && atkBreakRoll.total == atkWeaponQuality;
    }

    const chatData = {};

    const messageData = {
        user: game.user.id,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        sound: CONFIG.sounds.dice
    };

    const chatTemplate = "systems/hm3/templates/chat/weapon-break-card.html";	//// TODO:  update this

    // Prepare and generate Attack Weapon Break chat message

    chatData.tokenName = atkToken.name;
    chatData.weaponName = atkWeapon.data.name;
    chatData.weaponQuality = atkWeapon.data.data.weaponQuality;
    chatData.weaponBroke = atkWeaponBroke;
		chatData.weaponFlawed = atkWeaponFlaw;
    chatData.rollValue = atkBreakRoll.total;
    chatData.actorId = atkWeapon.parent;
    chatData.title = "Attack Weapon Break Check";

    let html = await renderTemplate(chatTemplate, chatData);

    messageData.content = html.trim();
    messageData.speaker = ChatMessage.getSpeaker({token: defToken});
    messageData.roll = atkBreakRoll;

    const messageOptions = {};

    await ChatMessage.create(messageData, messageOptions)

    // Prepare and generate Defend Weapon Break chat message

    chatData.tokenName = defToken.name;
    chatData.weaponName = defWeapon.data.name;
    chatData.weaponQuality = defWeapon.data.data.weaponQuality;
    chatData.weaponBroke = defWeaponBroke;
		chatData.weaponFlawed = defWeaponFlaw;
    chatData.rollValue = defBreakRoll.total;
    chatData.actorId = defWeapon.parent;
    chatData.title = "Defend Weapon Break Check";

    html = await renderTemplate(chatTemplate, chatData);

    messageData.content = html.trim();
    messageData.speaker = ChatMessage.getSpeaker({token: defToken});
    messageData.roll = defBreakRoll;

    await ChatMessage.create(messageData, messageOptions);

    return {attackWeaponBroke: atkWeaponBroke, defendWeaponBroke: defWeaponBroke, attackWeaponFlawed: atkWeaponFlaw, defendWeaponFlawed: defWeaponFlaw};
	}

	static armorlocationRenderFix(itemSheet, html, data) {
		const item = itemSheet.item;
		const origData = data;
		data = origData.data;

		const probWeightArms = item.getFlag('hm-enhanced', 'aim-arms') || 0;
		const probWeightHighMissile = item.getFlag('hm-enhanced', 'aim-high-missile') || 0;
		const probWeightMidMissile = item.getFlag('hm-enhanced', 'aim-mid-missile') || 0;
		const probWeightLowMissile = item.getFlag('hm-enhanced', 'aim-low-missile') || 0;

		html.find('#armorlocation-probweight div.weight').setAttribute('class', 'weight grid grid-fixed-row grid-7col');
		html.find('#armorlocation-probweight-low').after(`
                    <div class="prob-weight" id="armorlocation-probweight-arms">
                        <label class="label">Arms Aim</label>
                        <input class="value" type="number" name="flags.hm-gold.probweight-arms" value="${probWeightArms}"
                            data-dtype="Number" />
                    </div>
                    <div class="prob-weight" id="armorlocation-probweight-high-missile">
                        <label class="label">High Shot</label>
                        <input class="value" type="number" name="flags.hm-enhanced.probweight-high-missile" value="${probWeightHighMissile}"
                            data-dtype="Number" />
                    </div>
                    <div class="prob-weight" id="armorlocation-probweight-mid-missile">
                        <label class="label">Body Shot</label>
                        <input class="value" type="number" name="flags.hm-enhanced.probweight-mid-missile" value="${probWeightMidMissile}"
                            data-dtype="Number" />
                    </div>
                    <div class="prob-weight" id="armorlocation-probweight-low-missile">
                        <label class="label">Low Shot</label>
                        <input class="value" type="number" name="flags.hm-enhanced.probweight-low-missile" value="${probWeightLowMissile}"
                            data-dtype="Number" />
                    </div>`);
	}

}
