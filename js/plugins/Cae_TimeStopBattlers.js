//=========================================================
// Cae_TimeStopBattlers.js
//=========================================================

/*:
 * @plugindesc v1.1 - Allows you to freeze motion updates of battlers affected by specified states.
 * @author Caethyril
 *
 * @help Plugin Commands:
 *   None.
 *
 * Notetag: <StopMotion>
 *   Put this in the notebox of any state you want to use as a "Timestop" state.
 *   Any state with this notetag will be added to the Timestop State list.
 *
 * Compatibility:
 *   YEP Animated SV Enemies: place this plugin below Yanfly's for best results.
 *   Aliases updateMotion & startMotion methods of Sprite_Actor & Sprite_Enemy,
 *       and requestMotion & clearMotion methods of Game_Battler.
 *   Defines isTimeStopped function on Game_Battler.
 *
 * Terms of use:
 *   Free to use and modify.
 *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * Update log:
 *   1.1: Fix for motion changes on taking damage/evading/etc.
 *        Added ability to specify timestop states via notetags!
 *        Also did a minor rewrite of some parts of the code.
 *   1.0: Initial release.
 * 
 * @param Timestop State(s)
 * @text Timestop State(s)
 * @type state[]
 * @desc These states will freeze battler motion updates.
 * You can also specify them using notetags if you prefer.
 * @default []
 */

var Imported = Imported || {};				// Import namespace, var can redefine
Imported.Cae_TimeStopBattlers = 1.1;			// Import declaration

var CAE = CAE || {};					// Author namespace, var can redefine
CAE.TimeStopBattlers = CAE.TimeStopBattlers || {};	// Plugin namespace

(function(_) {

'use strict';

	_.params = PluginManager.parameters('Cae_TimeStopBattlers');					// Process user parameters
  
	_.TSstates = JSON.parse(_.params['Timestop State(s)']).map(Number) || [];			// States from parameter

	// New function. Returns true if target is affected by one or more relevant states.
	Game_Battler.prototype.isTimeStopped = function() {
		return this._states.some(function(n) {
			return _.TSstates.contains(n) || $dataStates[n].meta.StopMotion;		// Check notetags, too
		});
	};

	_.Game_Battler_requestMotion = Game_Battler.prototype.requestMotion;				// Alias
	Game_Battler.prototype.requestMotion = function(motionType) {
		if (!this.isTimeStopped()) _.Game_Battler_requestMotion.call(this, motionType);		// Callback if not 'stopped
	};

	_.Game_Battler_clearMotion = Game_Battler.prototype.clearMotion;				// Alias
	Game_Battler.prototype.clearMotion = function() {
		if (!this.isTimeStopped()) _.Game_Battler_clearMotion.call(this);			// Callback if not 'stopped
	};

	_.Sprite_Actor_updateMotion = Sprite_Actor.prototype.updateMotion;				// Alias
	Sprite_Actor.prototype.updateMotion = function() {
		let batt = this._actor;
		if (batt && !batt.isTimeStopped()) _.Sprite_Actor_updateMotion.call(this);		// Callback if not 'stopped
	};

	_.Sprite_Actor_startMotion = Sprite_Actor.prototype.startMotion;				// Alias
	Sprite_Actor.prototype.startMotion = function(motionType) {
		let batt = this._actor;
		if (batt && !batt.isTimeStopped()) _.Sprite_Actor_startMotion.call(this, motionType);	// Callback if not 'stopped
	};

	// Yanfly Animated SV Enemies Compatibility
	_.Sprite_Enemy_updateMotion = Sprite_Enemy.prototype.updateMotion || {};			// Alias or null
	Sprite_Enemy.prototype.updateMotion = function() {
		let batt = this._enemy;
		if (batt && !batt.isTimeStopped()) _.Sprite_Enemy_updateMotion.call(this);		// Callback if not 'stopped
	};

	_.Sprite_Enemy_startMotion = Sprite_Enemy.prototype.startMotion || {};				// Alias or null
	Sprite_Enemy.prototype.startMotion = function(motionType) {
		let batt = this._enemy;
		if (batt && !batt.isTimeStopped()) _.Sprite_Enemy_startMotion.call(this, motionType);	// Callback if not 'stopped
	};

})(CAE.TimeStopBattlers);