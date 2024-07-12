Game_BattlerBase.prototype.clearStates = function()
{
  if (this._states)
  {
    for (let i=0; i<this._states.length; i++)
    {
        if (Imported.YEP_X_StateCategories && this.isCustomClearStates() && (($gameTemp._deathStateClear && $dataStates[this._states[i]].category.contains('BYPASS DEATH REMOVAL')) || ($gameTemp._recoverAllClear && $dataStates[this._states[i]].category.contains('BYPASS RECOVER ALL REMOVAL'))))
            continue;
 
        this.removeStateEffects(this._states[i]);
    }
  }
    this._states = [];
    this._stateTurns = {};
};