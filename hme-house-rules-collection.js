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
			FurnacePatching.replaceFunction(game.hm3.HarnMasterActor, "calcShockIndex", HMEActor.calcShockIndex);

			FurnacePatching.replaceFunction(game.hm3.DiceHM3, '_calcInjury', DiceHME._calcInjury); // dice:518
			FurnacePatching.replaceFunction(game.hm3.DiceHM3, 'createInjury', DiceHME.createInjury); // dice:409

			FurnacePatching.replaceMethod(CONFIG.Combat.documentClass, 'checkWeaponBreak', HMEItem.checkWeaponBreak);	// combat:1080

			// FurnacePatching.replaceFunction(game.hm3.HarnMasterItem, "calcInjurySeverity", HMEItem.calcInjurySeverity); // item:308

			/** -----
			 * Patch slightly modified methods
			 * N.B. line numbers may change as the function is modified (must work from end to front)!
			 * XXX line numbers change with any revision to the source code!!!
			 * ----- */

			// Need to defer ALL the widespread cases of EML trimming
      FurnacePatching.patchMethod(game.hm3.HarnMasterActor, 'prepareDerivedData', 405 - 307,
        "this._setMinEML_AML_DML();",
        "if(!game.settings.get('hm3', 'extremeEML')) {this._setMinEML_AML_DML();}"
      );
			FurnacePatching.patchMethod(CONFIG.Combat.documentClass, 'blockResume', 952 - 857,
				"effDML = Math.max(Math.round(effDML/2), 5);",
				"effDML = effDML >= 0 ? Math.round(effDML/2) : effDML * 2;"
			);
      // And then do the critical determination last
			FurnacePatching.patchMethod(game.hm3.DiceHM3, 'rollTest', 1198 - 1184,
				"let isCrit = (roll.total % 5) === 0;",
				"let isCrit = (roll.total % 5) === 0 || (baseTargetNum > 100 && roll.total <= baseTargetNum -100 ) || (baseTargetNum < 0 && roll.total >= 100 + baseTargetNum) ;"
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
      FurnacePatching.patchMethod(game.hm3.DiceHM3, 'missileAttackDialog', 976 - 970,
        "aimLocations: ['High', 'Mid', 'Low'],",
        "aimLocations: game.settings.get('hm3', 'missileStrikeZones') === 'missile' ? ['High-Missile', 'Mid-Missile', 'Low-Missile'] : ['High', 'Mid', 'Low'],"
      );
      FurnacePatching.patchMethod(game.hm3.DiceHM3, 'missileAttackDialog', 977 - 970,
        "defaultAim: 'Mid',",
        "defaultAim: 'game.settings.get('hm3', 'missileStrikeZones') === 'missile' ? Mid-Missile' : 'Mid',"
      );
      // Unused function, presume deprecated.
      // FurnacePatching.patchMethod(game.hm3.DiceHM3, 'hitLocation', 1244 - 1243,
      //   "const hlAim = aim === 'high' || aim === 'low' ? aim : 'mid';",
      //   "const hlAim = aim === ''"
      // );
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