import { HMEActor } from './modules/hme.actor.js';
import { HMEItem } from './modules/hme-item.js';
import { DiceHME } from './modules/hme-dice.js';
import { FurnacePatching } from './modules/Patches.js';

class HMEnhanced {
		constructor() {
			Hooks.on('init', this.init.bind(this));
			Hooks.on('ready', this.ready.bind(this));
		}

		init() {
			// add some default data

			// Replace overridden methods

		}

		ready() {}
}

new HMEnhanced();

Hooks.on('renderHarnMasterCharacterSheet', (actorSheet, html, data) => {
		HMEActor.actorRenderFix(actorSheet, html, data);
		return true;
});

Hooks.on('renderHarnMasterCreatureSheet', (actorSheet, html, data) => {
		HMEActor.actorRenderFix(actorSheet, html, data);
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
		game.hm3.DiceHM3.d6StdRoll(stdRollData).then(resut => {
			// always run custom display macros
			actor.runCustomMacro(result);
			// often continue with post-roll hooks
			game.hm3.macros.callOnHooks("hm3.onShockRoll", actor, result, stdRollData);
		});
		return false; // abandon further process, is done.
});

Hooks.on('hm3.preStumbleRoll', (stdRollData, actor) => {
		game.hm3.DiceHM3.d6StdRoll(stdRollData).then(resut => {
			// always run custom display macros
			actor.runCustomMacro(result);
			// often continue with post-roll hooks
			game.hm3.macros.callOnHooks("hm3.onStumbleRoll", actor, result, stdRollData);
		});
		return false; // abandon further process, is done.
});

Hooks.on('hm3.preFumbleRoll', (stdRollData, actor) => {
		game.hm3.DiceHM3.d6StdRoll(stdRollData).then(resut => {
			// always run custom display macros
			actor.runCustomMacro(result);
			// often continue with post-roll hooks
			game.hm3.macros.callOnHooks("hm3.onFumbleRoll", actor, result, stdRollData);
		});
		return false; // abandon further process, is done.
});

Hooks.on('preCreateActor', (actor, createData, options, userId) => {
    // only add 'Condition' skill to characters and creatures
    if (['character', 'creature'].includes(createData.type)) {
        game.packs
            .get('hm3.std-skills-physical')
            .getDocuments()
            .then((result) => {
                let chain = Promise.resolve()
                result.forEach(async (ability, index) => {
                    chain = await chain.then(async () => {
                        if (['Condition'].includes(ability.name)) {
                            const updateData = { items: [ ability.data ] };
                            await actor.data.update(updateData);
                        }
                    });
                });
            });
    }
});

Hooks.on('hm3.onActorPrepareBaseData', (actor) => HMEActor.prepareBaseData(actor) );
Hooks.on('hm3.onActorPrepareDerivedData', (actor) => HMEActor.prepareDerivedData(actor) );