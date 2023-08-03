//==============================================================================
// State Add/Remove commands
// by Shaz
// Last Updated: 2015.11.24
//==============================================================================

/*:
 * @plugindesc Execute commands when states are added or removed
 * @author Shaz
 *
 * @help This plugin does not provide plugin commands.
 *
 * State Notes:
 *  onadd: command      - runs command when state is added
 *  onremove: command   - runs command when state is removed
 *
 *  command is a Javascript command that will be evaluated.  The context is
 *  Game_Battler, so any properties and functions available to Game_Battler
 *  and Game_BattlerBase can be used.  Use 'this' to refer to the battler
 *
 * Examples:
 *  onadd: this.gainHp(-50)
 *         to lower the battler's HP by 50 when the state is added
 *  onremove: this.addState(5)
 *         to add state 5 to the battler when the current state is removed
 */

(function() {
  var _Game_BattlerBase_clearStates = Game_BattlerBase.prototype.clearStates;
  Game_BattlerBase.prototype.clearStates = function() {
    if (this._states) {
      this._states.forEach(function(stateId) {
        this.stateRemoveCommand(stateId);
      }.bind(this));
    }
    _Game_BattlerBase_clearStates.call(this);
  };

  var _Game_BattlerBase_eraseState = Game_BattlerBase.prototype.eraseState;
  Game_BattlerBase.prototype.eraseState = function(stateId) {
    var index = this._states.indexOf(stateId);
    if (index >= 0) {
      this.stateRemoveCommand(stateId);
    }
    _Game_BattlerBase_eraseState.call(this, stateId);
  };

  var _Game_BattlerBase_addNewState = Game_BattlerBase.prototype.addNewState;
  Game_BattlerBase.prototype.addNewState = function(stateId) {
    var hadStateBefore = this._states.indexOf(stateId) >= 0;
    _Game_BattlerBase_addNewState.call(this, stateId);
    var hasStateNow = this._states.indexOf(stateId) >= 0;
    if (hasStateNow && !hadStateBefore) {
      this.stateAddCommand(stateId);
    }
  };

  Game_BattlerBase.prototype.stateAddCommand = function(stateId) {
    var st = $dataStates[stateId];
    var note = st.note;
    var lines = note.split(/[\r\n]+/);
    lines.forEach(function(line) {
      cmd = /onadd:\s*(.*)/i.exec(line);
      if (cmd) {
        eval(cmd[1]);
      }
    }.bind(this));
  };

  Game_BattlerBase.prototype.stateRemoveCommand = function(stateId) {
    var st = $dataStates[stateId];
    var note = st.note;
    var lines = note.split(/[\r\n]+/);
    lines.forEach(function(line) {
      cmd = /onremove:\s*(.*)/i.exec(line);
      if (cmd) {
        eval(cmd[1]);
      }
    }.bind(this));
  };
})();