//=============================================================================
// AutoLife.js
//=============================================================================

/*:
 * @plugindesc Allows one or more states to automatically revive a dead player.
 * @author whitesphere
 *
 * @param Default Revive Formula
 * @desc If set, determines how much HP is granted upon the character's revival.
 * Otherwise, defaults to 20% of the character's MHP.
 * @default a.mhp / 4
 *
 * @param Revive Animation ID
 * @desc The animation which is used when a character is auto-revived.
 * @default 49
 *
 * @help The formula is evaluated the same way the Damage formula is. The parameter "a"
 * represents the Actor.  When the character dies, if s/he has an Auto-Life 
 * state active.  The formula's result becomes the character's HP.
 * All states and buffs are lost, since the character technically did die.
 *
 * ============================================================================
 * Notetags
 * ============================================================================
 *
 *
 * State specific Notetag:
 *  <autolife>
 *	Defines this State as an auto-life state
 *
 * <autolife_formula: (formula)>
 *	Defines this State as an auto-life state, using the specified formula to calculate
 *  the amount of HP granted on character death.
 * 
 * <autolife_animation: (id)>
 * Defines this state as an auto-life state and uses the specified animation ID  
 * if this auto-life state is used.
 * 
 * <autolife_add_states: (id 1, id 2, ... id n)>
 * If the auto-life state is used, all of the states in the comma-separated list are
 * added.  Allows a character to get stronger after death, or be weaker when revived.
 */
(function() {
 
WS_AutoLife = {};

WS_AutoLife.Parameters = PluginManager.parameters('AutoLife');
WS_AutoLife.Param = {};

//=============================================================================
// The plug-in parameters 
//=============================================================================
WS_AutoLife.Param.formula = WS_AutoLife.Parameters['Default Revive Formula'];
WS_AutoLife.Param.animationID = parseInt(WS_AutoLife.Parameters['Revive Animation ID']);

//=============================================================================
// Handle the auto-life states
//=============================================================================
Auto_Life = function() {
}

//=============================================================================
// Returns a state ID for the first auto-life found in the battler
// or null if none is found.
//=============================================================================
Auto_Life.prototype.getAutoLifeState = function(battler) {
		state_list=battler.states();
		for (lifeIndex=0; lifeIndex<state_list.length; lifeIndex++) {
			current_state=state_list[lifeIndex];
			meta=current_state.meta;
			if (!meta)
			{
				continue;
			}
			if (meta.autolife || meta.autolife_formula || meta.autolife_animation) {
				return current_state;
			}
		}
		return null;
}


//=============================================================================
// Applies the given auto-life state to a battler.  This:
// 1. Removes all buffs and states
// 2. Removes all auto-life states
// 3. Sets the HP to the result of the auto-life formula
// This call assumes the battler's HP is set to 0.
//=============================================================================
Auto_Life.prototype.applyAutoLife = function(battler, state_obj) {
	meta=state_obj.meta;
	if (!meta || (!meta.autolife 
		&& !meta.autolife_formula && !meta.autolife_animation)) {
		return;
	}
    battler.clearStates();
    battler.clearBuffs();
	hp_to_add=1;
	autolife_function=WS_AutoLife.Param.formula;
	if (meta.autolife_formula && meta.autolife_formula != "")
		autolife_function=meta.autolife_formula;
	try 
	{
		var a=battler;
		hp_to_add=Math.round(eval(autolife_function));
	}
	catch (e) {
	}
	if (hp_to_add < 1)
		hp_to_add=1;
	if (!state_obj.meta.autolife_animation)
		animation_id=WS_AutoLife.Param.animationID;
	else
		animation_id=parseInt(state_obj.meta.autolife_animation);
	if (animation_id)
		battler.startAnimation(animation_id, false, 120);
	battler.eraseState(battler.deathStateId());
	battler._hp=hp_to_add;
	if (state_obj.meta.autolife_add_states) {
		state_list=state_obj.meta.autolife_add_states.split(",");
		for (state_index=0; state_index<state_list.length; state_index++) {
			battler.addState(parseInt(state_list[state_index]));
		}
	}
}

//=============================================================================
// Game_Battler
//=============================================================================


var WS_AL_GB_die=Game_BattlerBase.prototype.die;
//=============================================================================
// See if the damage would make the battler Dead.  If so,
// see if we have any Auto Life states.
//=============================================================================
 Game_BattlerBase.prototype.die = function() {
	
	if (!this._autoLife) {
		this._autoLife=new Auto_Life();
	}
	/* Auto life state will trigger here if there is one */
	state_id=this._autoLife.getAutoLifeState(this);
	if (state_id !== null) {
		this._autoLife.applyAutoLife(this, state_id);
		return;
	}
	WS_AL_GB_die.call(this, arguments);
}


})();
//=============================================================================
// End of File
//=============================================================================
