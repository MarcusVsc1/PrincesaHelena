//=========================================================
// Cae_MultiPartEnemyFX.js
//=========================================================

/*:
 * @plugindesc v1.0 - Allows linking enemies together so various effects show on all of them simultaneously. This is purely visual.
 * @author Caethyril
 *
 * @help Enemy notetag: <Sprite Group: name>
 *    - Replace 'name' with a name for the group.
 *    - Example: <Sprite Group: bossKraken>
 *    - When an enemy displays an applicable effect, any enemies with the same
 *        Sprite Group tag will also show that effect.
 *    - Set applicable effects via the plugin parameters.
 *
 * Compatibility:
 *   Yanfly's Battle Engine Core: load this plugin after Yanfly's.
 *    - Grouped enemies will not move as a group via action sequences!
 *   Aliases the select method of Game_Troop,
 *       and the performActionStart & performDamage methods of Game_Enemy.
 *
 * Terms of use:
 *   Free to use and modify.
 *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * Update log:
 *   1.0: Initial release.
 *
 * @param Select
 * @text Select
 * @type boolean
 * @desc True = entire group will highlight when one is selected.
 * Default: true
 * @default true
 *
 * @param Action
 * @text Action
 * @type boolean
 * @desc True = entire group will "act" when one takes an action.
 * Default: false
 * @default false
 *
 * @param Damage
 * @text Damage
 * @type boolean
 * @desc True = entire group will "ouch" when one takes damage.
 * Default: false
 * @default false
 */

var Imported = Imported || {};				// Import namespace, var can redefine
Imported.Cae_MultiPartEnemyFX = 1.0;			// Import declaration

var CAE = CAE || {};					// Author namespace, var can redefine
CAE.MultiPartEnemyFX = CAE.MultiPartEnemyFX || {};	// Plugin namespace

(function(_) {

'use strict';

	_.params = PluginManager.parameters('Cae_MultiPartEnemyFX');

	// Type conversion
	_.sync = [_.params['Select'], _.params['Action'], _.params['Damage']].map(function(p) { return p === 'true'; });

	// Returns selection name from notetag, defaults to empty string.
	_.getGrpName = function(nme) {
		return (nme ? nme.enemy().meta['Sprite Group'] : '') || '';
	};

	// Selection effect~
	_.Game_Troop_select = Game_Troop.prototype.select;			// Alias
	Game_Troop.prototype.select = function(activeMember) {
		_.Game_Troop_select.call(this, activeMember);			// Callback
		if (_.sync[0]) {
			let grpName = _.getGrpName(activeMember);
			if (grpName) {
				this.members().forEach(function(e) {
					if (_.getGrpName(e) === grpName) e.select();	
				});
			}
		}
	};

	// Action effect (default = whiten, YEP = step forward)~
	_.Game_Enemy_performActionStart = Game_Enemy.prototype.performActionStart;
	Game_Enemy.prototype.performActionStart = function(action) {
		_.Game_Enemy_performActionStart.call(this, action);
		if (_.sync[1]) {
			let grpName = _.getGrpName(this);
			if (grpName) {
				$gameTroop.members().forEach(function(e) {
					if (e !== this && _.getGrpName(e) === grpName) {
						_.Game_Enemy_performActionStart.call(e, action);
					}
				}, this);
			}
		}
	};

	// Damage effect (default = blink, YEP = flinch)~
	_.Game_Enemy_performDamage = Game_Enemy.prototype.performDamage;
	Game_Enemy.prototype.performDamage = function() {
		_.Game_Enemy_performDamage.call(this);
		if (_.sync[2]) {
			let grpName = _.getGrpName(this);
			if (grpName) {
				$gameTroop.members().forEach(function(e) {
					if (e !== this && _.getGrpName(e) === grpName) {
						_.Game_Enemy_performDamage.call(e);
					}
				}, this);
			}
		}
	};

})(CAE.MultiPartEnemyFX);