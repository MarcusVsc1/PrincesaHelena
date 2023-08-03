// ==============================================
// Cae_BattleStepY.js
// ==============================================

/*:
 * @plugindesc v1.0 - Makes sideview battle actors step up/down rather than left/right in battle. Compatible with Yanfly's Battle Engine Core.
 * @author Caethyril
 *
 * @help Plugin Commands:
 *   None.
 *
 * Suggested use: "back" view battle system with custom SV sprites.
 *
 * Note: if using Yanfly's Battle Engine Core, this plugin's parameters will be
 *   ignored. In that case, set the values using Yanfly's plugin instead.
 *
 * Compatibility:
 *   Yanfly's Battle Engine Core: load this plugin after Yanfly's.
 *   Overrides stepForward and retreat methods of Sprite_Actor.
 *   Conditionally aliases moveToStartPosition of Sprite_Actor.
 *   Also overrides Yanfly's stepFlinch method on Sprite_Actor.
 *
 * Terms of use:
 *   Free to use and modify.
 *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * Update log:
 *   1.0: Initial release.
 *
 * @param Home Position X
 * @text Home Position X
 * @type text
 * @desc Formula for party X positions.
 * @default Graphics.boxWidth / 2 + 96 * ($gameParty.battleMembers().length / 2 - index - 0.5)
 *
 * @param Home Position Y
 * @text Home Position Y
 * @type text
 * @desc Formula for party Y positions.
 * @default 440
 *
 * @param Step Distance
 * @text Step Distance
 * @type number
 * @desc How far characters step forward when it's their turn.
 * Default: 48 px
 * @default 48
 */

var Imported = Imported || {};			// Import namespace
Imported.Cae_BattleStepY = 1.0;			// Version declaration

var CAE = CAE || {};				// Author namespace
CAE.BattleStepY = CAE.BattleStepY || {};	// Plugin namespace

(function (_) {

'use strict';

// ============================ Initialisation ============================ //

	// Process user parameters...
	_.params = PluginManager.parameters('Cae_BattleStepY');
	_.pos = { x: _.params['Home Position X'] || '', y: _.params['Home Position Y'] || '' };
	_.step = Number(_.params['Step Distance'] || 48);

	// New function: returns distance from entry point (off-screen) to home.
	_.dEntry = function(sprite) { return Graphics.boxHeight - sprite._homeY; };

	// New function: returns step distance, includes check for Yanfly BEC.
	_.stepDist = function() { return Imported.YEP_BattleEngineCore ? Yanfly.Param.BECStepDist : _.step; };

// ========== Overrides! Change move directions from x to y axis ========== //

	Sprite_Actor.prototype.stepForward = function() {
		this.startMove(0, -_.stepDist(), 12);
	};

	Sprite_Actor.prototype.retreat = function() { this.startMove(0, _.dEntry(this), 30); };

	Sprite_Actor.prototype.moveToStartPosition = function() { this.startMove(0, _.dEntry(this), 0); };

	Sprite_Battler.prototype.stepForward = function() {
		this.startMove(0, _.stepDist(), 12);
	};

	// ~v~v~v~v~v~ Yanfly Battle Engine Core compatibility ~v~v~v~v~v~ //

	Sprite_Actor.prototype.stepFlinch = function() {
		let flinchX = this.x - this._homeX;
		let flinchY = this.y - this._homeY + Yanfly.Param.BECFlinchDist;
		this.startMove(flinchX, flinchY, 6);
	};

	Sprite_Battler.prototype.stepFlinch = function() {
		var flinchX = this.x - this._homeX;
		var flinchY = this.y - this._homeY - Yanfly.Param.BECFlinchDist;
		this.startMove(flinchX, flinchY, 6);
	};

	Sprite_Battler.prototype.moveForward = function(distance, frames) {
		distance = parseInt(distance);
		frames = parseInt(frames);
		if (this._battler.isActor()) distance *= -1;
		var moveX = this.x - this._homeX;
		var moveY = this.y - this._homeY + distance;
		this.startMove(moveX, moveY, frames);
	};

	Sprite_Battler.prototype.stepSubBack = function() {
		var backX = -1 * this.width / 2;
		this.startMove(0, backX, 6);
	};

	Sprite_Actor.prototype.stepSubBack = function() {
		var backX = this._mainSprite.width / 2;
		this.startMove(0, backX, 6);
	};

// ================ Override home positions if appropriate ================ //

	_.Sprite_Actor_setActorHome = Sprite_Actor.prototype.setActorHome;			// Alias
	Sprite_Actor.prototype.setActorHome = function(index) {
		if (Imported.Yanfly_BattleEngineCore || _.pos.x === '' || _.pos.y === '') {	// If positions not set or using BEC
			_.Sprite_Actor_setActorHome.call(this, index);				// Callback
		} else {
			try {
				let homeX = Number(eval(_.pos.x));
				let homeY = Number(eval(_.pos.y));
				console.log(this._actor.name() + ':', homeX, homeY);
				this.setHome(homeX, homeY);
			} catch(e) {
				console.log('Cae_BattleStepY.js error!\nFailed to eval home position formula!', String(e));
				_.Sprite_Actor_setActorHome.call(this, index);			// Fallback
			}
		}
	};

	
})(CAE.BattleStepY);