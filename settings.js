export const registerExtraSystemSettings = function() {

	game.settings.register('hm3', 'generalInjury', {
		name: "Whole Body damage",
		hint: "Adds a generalized damage zone, for blast and fall damage",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});

	// Injury Table options
	game.settings.register('hm3', 'injuryTable', {
		name: "Injury Table Version",
		hint: "Choose the way injuries are generated.",
		scope: "world",
		config: true,
		default: "hm3",
		type: String,
		choices: {
			"hm3": "The simple bands of HarnMaster 3 (or Gold, if you have that installed)",
			"hmg": "Force differences per damage type, from Harnmaster Gold.",
			"hme": "The impact point-specific table in Fannon 'HarnMaster Enhanced'.",
			"artorus": "'HarnMaster Enhanced' with more vulnerable necks and groins."
		}
	});

	game.settings.register('hm3', 'massiveDamage', {
		name: "Massive Damage Injuries",
		hint: "Adds columns beyond 30 impact",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});

	game.settings.register('hm3', 'injuryLevels', {
		name: "Force Injury Levels",
		hint: "Converts the fine-grained injury points (in HMG or HME) to simple injury levels like HM3.",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});

	game.settings.register('hm3', 'bleedingLevels', {
		name: "Heavy Bleeders",
		hint: "Makes bleeding wounds come in various sizes.",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});

	// Injury resolution options
	game.settings.register('hm3', 'variantShock', {
		name: "Shock Roll variant",
		hint: "Which type of Shock roll to use. mostly changes the chance to faint from accumulated wounds.",
		scope: "world",
		config: true,
		default: "default",
		type: String,
		choices: {
			"deadly": "Full accumulation of dice, normal for HM3.",
			"mixed": "Half accumulated dice, plus instant dice. Normal from HM 'Enhanced'",
			"easy": "Instant dice, plus points of accumulated penalty.",
			"default": "No change from installed system."
		}
	});

	game.settings.register('hm3', 'variantStumble', {
		name: "Stumble Roll variant",
		hint: "Do injuries make Stumble rolls harder?",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});

	game.settings.register('hm3', 'variantFumble', {
		name: "Fumble Roll variant",
		hint: "Do injuries make Fumble rolls harder?",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});

	game.settings.register('hm3', 'variableFumble', {
		name: "Fumble Roll Table",
		hint: "Do Fumble Rolls come in different sizes?",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});

	game.settings.register('hm3', 'variableStumble', {
		name: "Stumble Roll Table",
		hint: "Do Stumble Rolls come in different sizes?",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});

	game.settings.register('hm3', 'nearlyStumble', {
		name: "Nearly Stumbled",
		hint: "Adds a near-succeed effect to stumbles",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});

	game.settings.register('hm3', 'nearlyFumble', {
		name: "Nearly Fumbled",
		hint: "Adds a near-succeed effect to fumbles",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});

	game.settings.register('hm3', 'nearlyShock', {
		name: "Nearly Shocked",
		hint: "Adds Stun on near-succeed shock roll",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});

	game.settings.register('hm3', 'nearlyKill', {
		name: "Nearly Killed",
		hint: "Adds Comas for barely-failed Kill rolls.",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});

	game.settings.register('hm3', 'nearlyAmputate', {
		name: "Nearly Amputated",
		hint: "Applies Cripple on only-just-amputated results.",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});

	game.settings.register('hm3', 'stunThreshold', {
		name: "Auto-stun Threshold",
		hint: "Makes all high impact strikes Stun.",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});

	game.settings.register('hm3', 'bleedingVersion', {
		name: "Bloodloss version (Requires Bleeding to be turned on)",
		hint: "How fast does Bloodloss progress?",
		scope: "world",
		config: true,
		default: "minutes",
		type: String,
		choices: {
			"minutes": "Takes minutes, drop dead.",
			"stages": "Takes minutes, partial effects.",
			"rounds": "Every combat round, partial effects (triple limit). Somewhat faster death on the field."
		}
	});

	// Aim zone options
	game.settings.register('hm3', 'meleeStrikeZones', {
		name: "Melee Strike Aim Zones",
		hint: "Which set of options are available.",
		scope: "world",
		config: true,
		default: "simple",
		type: String,
		choices: {
			"simple": "Whichever are installed",
			"arms": "Force add the 'Arms' aim from HMGold",
			"hm3": "Force the three HM3 tables",
			"hmg": "Force the four HMG tables"
		}
	});

	game.settings.register('hm3', 'missileStrikeZones', {
		name: "Missile Strike Aim Zone Tables",
		hint: "How to select a random impact location for a rnaged attack",
		scope: "world",
		config: true,
		default: "melee",
		type: String,
		choices: {
			"melee": "Use the Melee Strike Zone Table, as choosen above",
			"missile": "Use the Missile Zone tables in 'HarnMaster Enhanced'"
		}
	});

	game.settings.register('hm3', 'faceSubZones' {
		name: "Parts of the Face",
		hint: "How independant and important are the parts of the face?",
		scope: "world",
		config: true,
		default: "ignore",
		type: String,
		choices: {
			"ignore": "Do not generate any sub-locations on the Face (note: HMG makes Eyes not part of the Face).",
			"descriptive": "Generate specific injuries on the face, but only as a desrciption.",
			"eyes": "Also force Eyes to be weak to Piercing attacks (HME's suggestion). Other face parts are descriptive.",
			"coverage": "They are separate locations, with different armour coverage, and special damage effect (Intensive)"
		}
	});

	game.settings.register('hm3', 'handFingers', {
		name: "Parts of the Hand",
		hint: "How important are the parts of a hand?",
		scope: "world",
		config: true,
		default: "ignore",
		type: String,
		choices: {
			"ignore": "There aren't any",
			"descriptive": "Choose a finger, for visualisation",
			"coverage": "They are separate locations, with different armour coverage (Intensive)."
		}
	});

	// Skill variants
	game.settings.register('hm3', 'specialtyType', {
		name: "Specialty Development",
		hint: "How do Skill Development Rolls work for Specializations?",
		scope: "world",
		config: true,
		default: "double",
		type: String,
		choices: {
			"double": "Specialty gets two points from itself, none from general.",
			"inherit": "Specialty is pinned to above base skill. One point from either source.",
			"splash": "Specialty is pinned above base skill. When it gains one point, also get extra roll for general skill."
		}
	});

	game.settings.register('hm3', 'extremeEML', {
		name: "Extreme EML Bonus",
		hint: "Get extra chances at ciritcals when skill EML is truncated.",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});

	game.settings.register('hm3', 'smallStealth', {
		name: "Size modifier to Stealth",
		hint: "Do small things inherently hide easier than big ones?",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});

	// Combat options
/*	game.settings.register('hm3', '', {
		name: "",
		hint: "",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});

	game.settings.register('hm3', '', {
		name: "",
		hint: "",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});

	game.settings.register('hm3', '', {
		name: "",
		hint: "",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});

	game.settings.register('hm3', '', {
		name: "",
		hint: "",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});

*/
};