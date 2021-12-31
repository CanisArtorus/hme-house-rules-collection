import { HMEActor } from './modules/hme.actor.js';
import { HMEItem } from './modules/hme-item.js';
import { DiceHME } from './modules/hme-dice.js';
import { FurnacePatching } from './modules/Patches.js';
import { Tables } from './modules/data-lut.js';

import { registerExtraSystemSettings } from './settings.js';

// re-enable listeners
function reEnableListeners(sheet, html) {
    html.find("*").off();
    sheet.activateListeners(html);
    // re-enable core listeners (for drag & drop)
    //sheet._activateCoreListeners(html);
}

Hooks.once('init', async () =>  {
			// get the additional settings. Many will need re-load to apply.
			registerExtraSystemSettings();

			// --- Replace overridden methods ---
			FurnacePatching.replaceFunction(game.hm3.HarnMasterActor, "skillDevRoll", HMEActor.skillDevRoll);

			FurnacePatching.replaceFunction(game.hm3.DiceHM3, '_calcInjury', DiceHME._calcInjury); // dice:518
			FurnacePatching.replaceFunction(game.hm3.DiceHM3, 'createInjury', DiceHME.createInjury); // dice:409

			FurnacePatching.replaceMethod(CONFIG.Combat.documentClass, 'checkWeaponBreak', HMEItem.checkWeaponBreak);	// combat:1080

			FurnacePatching.replaceFunction(game.hm3.HarnMasterItem, "calcInjurySeverity", HMEItem.calcInjurySeverity); // item:311

			/** -----
			 * Patch slightly modified methods
			 * N.B. line numbers may change as the function is modified (must work from end to front)!
			 * XXX line numbers change with any revision to the source code!!!
			 * ----- */

			// Need to defer ALL the widespread cases of EML trimming
			FurnacePatching.patchMethod(game.hm3.HarnMasterActor, "prepareDerivedData", 358 - 291,
				"if (['skill', 'spell', 'invocation', 'psionic'].includes(itemData.type)) {",
				"if (['skill', 'spell', 'invocation', 'psionic'].includes(itemData.type) && ! game.settings.get('hm3', 'extremeEML')) {"
			);
			FurnacePatching.patchMethod(game.hm3.HarnMasterActor, '_setupWeaponData', 619 - 569,
				"itemData.defenseMasteryLevel = Math.max(itemData.defenseMasteryLevel || 5, 5);",
				"if(! game.settings.get('hm3', 'extremeEML') { itemData.defenseMasteryLevel = Math.max(itemData.defenseMasteryLevel || 5, 5);}"
			);
			FurnacePatching.patchMethod(game.hm3.HarnMasterActor, '_setupWeaponData', 618 - 569,
				"itemData.attackMasteryLevel = Math.max(itemData.attackMasteryLevel || 5, 5);",
				"if(! game.settings.get('hm3', 'extremeEML') { itemData.attackMasteryLevel = Math.max(itemData.attackMasteryLevel || 5, 5);}"
			);
			FurnacePatching.patchMethod(game.hm3.HarnMasterActor, '_setupWeaponData', 591 - 569,
				"itemData.attackMasteryLevel = Math.max(itemData.attackMasteryLevel, 5);",
				"if(! game.settings.get('hm3', 'extremeEML') { itemData.attackMasteryLevel = Math.max(itemData.attackMasteryLevel, 5); }"
			);
			FurnacePatching.patchmethod(CONFIG.Combat.documentClass, 'blockResume', 952 - 857,
				"effDML = Math.max(Math.round(effDML/2), 5);",
				"effDML = effDML >= 0 ? Math.round(effDML/2) : effDML * 2;"
			);
			// And then do the critical determination
			FurnacePatching.patchMethod(game.hm3.DiceHM3, 'rollTest', 1195 - 1184,
				"let isCrit = (roll.total % 5) === 0;",
				"let isCrit = (roll.total % 5) === 0 || (targetNum > 100 && roll.total <= targetNum -100 ) || (targetNum < 0 && roll.total >= 100 + targetNum) ;"
			);

			// Aim zones: Make allowed choice in dialog boxes
			let source_line = "aimLocations: ['Low', 'Mid', 'High'],";
			let aim_zones = ['Low', 'Mid', 'High'];
			if  (['arms', 'hmg'].includes(game.settings.get('hm3', 'meleeStrikeZones'))) {
				aim_zones.push('Arms');
			}
			if (game.settings.get('hm3', 'missileStrikeZones') == 'missile') {
				aim_zones.push('Low-Missile');
				aim_zones.push('Mid-Missile');
				aim_zones.push('High-Missile');
			}
			FurnacePatching.patchMethod(CONFIG.Combat.documentClass, 'attackDialog', 358 - 338,
				source_line,
				`aimLocations: ${aim_zones},`
			);
			//
		});

Hooks.on('renderHarnMasterCharacterSheet', (actorSheet, html, data) => {
		HMEActor.actorRenderFix(actorSheet, html, data);
		reEnableListeners(actorSheet, html);
		return true;
});

Hooks.on('renderHarnMasterCreatureSheet', (actorSheet, html, data) => {
		HMEActor.actorRenderFix(actorSheet, html, data);
		reEnableListeners(actorSheet, html);
		return true;
});

Hooks.on('renderHarnMasterItemSheet', (itemSheet, html, data) => {
    const item = itemSheet.item;
    switch (item.data.type) {
        case 'armorgear':
            HMEItem.armorgearRenderFix(itemSheet, html, data);
            return true;;

        case 'armorlocation':
            HMEItem.armorlocationRenderFix(itemSheet, html, data);
            return true;;

        case 'injury':
            HMEItem.injuryRenderFix(itemSheet, html, data);
            return true;;

        case 'missilegear':
            HMEItem.missilegearRenderFix(itemSheet, html, data);
            return true;;

        case 'weapongear':
            HMEItem.weapongearRenderFix(itemSheet, html, data);
            return true;;
    }
});

Hooks.on('hm3.preWeaponAttackRoll', (stdRollData, actor, weapon) => {
    return true;
});

Hooks.on('hm3.preWeaponDefendRoll', (stdRollData, actor, weapon) => {
    return true;
});

Hooks.on('hm3.preMissileAttackRoll', (rollData, actor, weapon) => {
    return true;
});

Hooks.on('hm3.preInjuryRoll', (rollData, actor) => {
    return true;
});

Hooks.on('hm3.preHealingRoll', (stdRollData, actor, injury) => {
    ui.notifications.warn('Healing rolls not available in HarnMaster Gold Mode');
    return false;
});

Hooks.on('hm3.preShockRoll', (stdRollData, actor) => {
		// change number of dice

		game.hm3.DiceHM3.d6StdRoll(stdRollData).then(result => {
			// always run custom display macros
			actor.runCustomMacro(result);
			// often continue with post-roll hooks
			game.hm3.macros.callOnHooks("hm3.onShockRoll", actor, result, stdRollData);
		});
		return false; // abandon further process, is done.
});

Hooks.on('hm3.preStumbleRoll', (stdRollData, actor) => {
		game.hm3.DiceHM3.d6StdRoll(stdRollData).then(result => {
			// always run custom display macros
			actor.runCustomMacro(result);
			// often continue with post-roll hooks
			game.hm3.macros.callOnHooks("hm3.onStumbleRoll", actor, result, stdRollData);
		});
		return false; // abandon further process, is done.
});

Hooks.on('hm3.preFumbleRoll', (stdRollData, actor) => {
		game.hm3.DiceHM3.d6StdRoll(stdRollData).then(result => {
			// always run custom display macros
			actor.runCustomMacro(result);
			// often continue with post-roll hooks
			game.hm3.macros.callOnHooks("hm3.onFumbleRoll", actor, result, stdRollData);
		});
		return false; // abandon further process, is done.
});

// Hooks.on('hm3.onActorPrepareBaseData', (actor) => HMEActor.prepareBaseData(actor) );
Hooks.on('hm3.onActorPrepareDerivedData', (actor) => HMEActor.prepareDerivedData(actor) );