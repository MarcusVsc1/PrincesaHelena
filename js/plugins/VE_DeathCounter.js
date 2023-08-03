/*
 * ==============================================================================
 * ** Victor Engine MV - Death Counter
 * ------------------------------------------------------------------------------
 *  VE_DeathCounter.js
 * ==============================================================================
 */

var Imported = Imported || {};
Imported['VE - Death Counter'] = '1.02';

var VictorEngine = VictorEngine || {};
VictorEngine.DeathCounter = VictorEngine.DeathCounter || {};

(function() {

    VictorEngine.DeathCounter.loadDatabase = DataManager.loadDatabase;
    DataManager.loadDatabase = function() {
        VictorEngine.DeathCounter.loadDatabase.call(this);
        PluginManager.requiredPlugin.call(PluginManager, 'VE - Death Counter', 'VE - Basic Module', '1.21');
    };

    VictorEngine.DeathCounter.requiredPlugin = PluginManager.requiredPlugin;
    PluginManager.requiredPlugin = function(name, required, version) {
        if (!VictorEngine.BasicModule) {
            var msg = 'The plugin ' + name + ' requires the plugin ' + required;
            msg += ' v' + version + ' or higher installed to work properly.';
            msg += ' Go to http://victorenginescripts.wordpress.com/ to download the plugin.';
            throw new Error(msg);
        } else {
            VictorEngine.DeathCounter.requiredPlugin.call(this, name, required, version)
        };
    };

})();

/*:
 * ==============================================================================
 * @plugindesc v1.02 - Execute a last final action before dying.
 * @author Victor Sant
 *
 * @param Counter Animation
 * @desc ID of the animation displayed when using a death counter.
 * Default: 0. (No animation)
 * @default 0
 *
 * @param Counter Message
 * @desc Message displayed when using a death counter.
 * %1 = battler name     Leave blank for no message.
 * @default %1 uses a final attack.
 *
 * ==============================================================================
 * @help 
 * ==============================================================================
 *  Notetags:
 * ==============================================================================
 *
 * ==============================================================================
 *  Death Counter (for Actors, Classes, Enemies, Weapons, Armors and States) 
 * ------------------------------------------------------------------------------
 *  <death counter: action, rate[, priority]>
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
 *  Setup a custom counter effect. 
 *    action   : the action that will be used as counter. (see below)
 *    rate     : chance of triggering.
 *    priority : counter action priority. (see below)
 * ==============================================================================
 *
 * ==============================================================================
 *  Custom Death Counter (for Actors, Classes, Enemies, Weapons, Armors, States) 
 * ------------------------------------------------------------------------------
 *  <custom death counter: action[, priority]>
 *   result = code
 *  </custom death counter>
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
 *  Process a script code to setup a custom counter effect. 
 *    action   : the action that will be used as counter. (see below)
 *    priority : counter action priority. (see below)
 *    code     : code that will return the rate value.
 * ==============================================================================
 *
 * ==============================================================================
 *  Additional Information:
 * ------------------------------------------------------------------------------
 *
 *  The code uses the same values as the damage formula, so you can use "a" for
 *  the user, "b" for the target, "v[x]" for variable and "item" for the item
 *  object. The 'result' must return a numeric value between 0 and 100. (values
 *  outside of this range are redundant)
 *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
 * 
 *  - Counter Actions
 *   The action must be one of the following values can be used as actions.
 *      attack  : Counter with the basic attack.
 *      guard   : Counter with the guard action.
 *      skill X : Counter with the skill Id X.
 *      item X  : Counter with the item Id X.
 *      event X : Counter calling the common event Id X (no action is used).
 *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
 *
 *  - Counter Priority 
 *  The priority is a opitional arbitrary value, this defines wich skill will 
 *  have priority when multiple different actions are usable as a counter.
 *  The ones with higher priority will go first. If several actions have the
 *  same priority, the one with highest ID will be used.
 *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
 *
 *  Each counter source is calculated separatedely. So if you have two effects
 *  that gives 50% counter, you will not have 100% counter, even if those sources
 *  have exactly the same setup.
 *
 *  The counter action must be still usable and the costs are still consumed.
 *  Enemies can't use items.
 *
 * ==============================================================================
 *  Example Notetags:
 * ------------------------------------------------------------------------------
 *
 *   <death counter: attack, 100%>
 *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
 *
 *   <death counter: item 15, 50%, 10>
 *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
 *
 *   <custom death counter: skill 3>
 *    result = a.level;
 *
 * ==============================================================================
 * 
 * ==============================================================================
 *  Version History:
 * ------------------------------------------------------------------------------
 *  v 1.00 - 2016.03.15 > First release.
 *  v 1.01 - 2016.03.18 > Compatibility with Dual Wield.
 *  v 1.02 - 2016.05.31 > Compatibility with Battle Motions.
 * ==============================================================================
 */

(function() {

    //=============================================================================
    // Parameters
    //=============================================================================

    if (Imported['VE - Basic Module']) {
        var parameters = VictorEngine.getPluginParameters();
        VictorEngine.Parameters = VictorEngine.Parameters || {};
        VictorEngine.Parameters.DeathCounter = {};
        VictorEngine.Parameters.DeathCounter.CounterAnimation = Number(parameters["Counter Animation"]) || 0;
        VictorEngine.Parameters.DeathCounter.CounterMessage = String(parameters["Counter Message"] || '');
    }

    //=============================================================================
    // VictorEngine
    //=============================================================================

    VictorEngine.DeathCounter.loadNotetagsValues = VictorEngine.loadNotetagsValues;
    VictorEngine.loadNotetagsValues = function(data, index) {
        VictorEngine.DeathCounter.loadNotetagsValues.call(this, data, index);
        if (this.objectSelection(index, ['actor', 'class', 'weapon', 'armor', 'enemy', 'state'])) {
            VictorEngine.DeathCounter.loadNotes(data);
        }
    };

    VictorEngine.DeathCounter.loadNotes = function(data) {
        data.deathCounter = data.deathCounter || [];
        this.processNotes(data);
    };

    VictorEngine.DeathCounter.processNotes = function(data, type) {
        var match;
        var code = 'death counter';
        var part1 = ':[ ]*(\\w+)[ ]*(\\d+)?';
        var part2 = '[ ]*,[ ]*(\\d+)[%]?(?:,[ ]*(\\d+))?';
		var part3 = 'custom ' + code;
        var regex1 = new RegExp('<' + code + part1 + part2 + '[ ]*>', 'gi');
        var regex2 = VictorEngine.getNotesValues(part3 + '[ ]*' + part1, part3);
        while (match = regex1.exec(data.note)) {
            this.processValues(data, match, false);
        };
        while (match = regex2.exec(data.note)) {
            this.processValues(data, match, true);
        };
    };

    VictorEngine.DeathCounter.processValues = function(data, match, code) {
        var result = {};
        result.action = match[1].toLowerCase();
        result.actionId = Number(match[2]) || 0;
        result.rate = code ? 0 : Number(match[3]) || 0;
        result.code = code ? String(match[4]).trim() : '';
        result.priority = Number(match[code ? 3 : 4]) || 0;
        data.deathCounter.push(result);
    };

    //=============================================================================
    // BattleManager
    //=============================================================================

    VictorEngine.DeathCounter.initMembers = BattleManager.initMembers;
    BattleManager.initMembers = function() {
        VictorEngine.DeathCounter.initMembers.call(this);
        this._deathCounters = [];
    };

    VictorEngine.DeathCounter.invokeAction = BattleManager.invokeAction;
    BattleManager.invokeAction = function(subject, target) {
        VictorEngine.DeathCounter.invokeAction.call(this, subject, target);
        var counter = target.deathCounter()
        if (counter) {
            var action = {
                subject: target,
                target: subject,
                action: counter
            };
            this._deathCounters.push(action)
            target.clearDeathCounter();
        }
    };

    VictorEngine.DeathCounter.endTurn = BattleManager.endTurn;
    BattleManager.endTurn = function() {
        VictorEngine.DeathCounter.endTurn.call(this);
        this.allBattleMembers().forEach(function(battler) {
            var counter = battler.deathCounter();
            if (counter) {
                var action = {
                    subject: battler,
                    target: battler,
                    action: counter
                };
                this._deathCounters.push(action);
                this._phase = 'action';
                battler.clearDeathCounter();
            }
        }, this);
    };

    VictorEngine.DeathCounter.endAction = BattleManager.endAction;
    BattleManager.endAction = function() {
        if (this._deathCounters.length > 0 && !this._deathSubject) {
            var counter = this._deathCounters.shift();
            this.prepareDeathCounter(counter.subject, counter.target, counter.action);
        } else if (this._deathSubject) {
            this.endDeathCounterSubject();
        } else {
            VictorEngine.DeathCounter.endAction.call(this);
        }
    };

    VictorEngine.DeathCounter.checkBattleEnd = BattleManager.checkBattleEnd;
    BattleManager.checkBattleEnd = function() {
        if (this._deathSubject) {
            return false;
        } else {
            return VictorEngine.DeathCounter.checkBattleEnd.call(this);
        }
    };

    VictorEngine.DeathCounter.updateEvent = BattleManager.updateEvent;
    BattleManager.updateEvent = function() {
        if (this._deathSubject && this.updateEventMain()) {
            return true;
        } else {
            return VictorEngine.DeathCounter.updateEvent.call(this);
        }
    };

    BattleManager.prepareDeathCounter = function(subject, target, counter) {
        if (counter.action === 'event') {
            this.startEventDeathCounter(subject, target, counter.actionId)
        } else {
            var action = this.setupDeathCounter(subject, counter);
            this.startDeathAction(subject, target, action);
        }
    };

    BattleManager.startDeathAction = function(subject, target, action) {
        var targets = action.deathCounterTargets(target);
        if (targets.length > 0) {
            this._isDeathCounter = true;
            this._deathSubject = subject;
            this._deathTarget = target;
            this._subject = subject;
            action.setDeathCounterActionTargets(targets);
            action.setDeathCounterAction();
            subject.addNewAction(action);
            this._phase = 'turn';
        }
    };

    BattleManager.startEventDeathCounter = function(subject, target, eventId) {
        this._isDeathCounter = true;
        this._deathSubject = subject;
        this._deathTarget = target;
        this._subject = subject;
        $gameTemp.reserveCommonEvent(eventId);
        this._logWindow.push('clear');
        this.updateEventMain();
    };

    BattleManager.endDeathCounterSubject = function() {
        this._isDeathCounter = false;
        this._logWindow.endDeathCounter(this._deathSubject);
        this._subject = this._deathTarget;
        this._deathSubject = null;
        this._deathTarget = null;
    };

    BattleManager.setupDeathCounter = function(target, counter) {
        action = new Game_Action(target);
        if (counter.action === 'item') {
            action.setItem(counter.actionId);
        } else if (counter.action === 'attack') {
            action.setAttack();
        } else if (counter.action === 'guard') {
            action.setGuard();
        } else {
            action.setSkill(counter.actionId);
        };
        return action
    };

    BattleManager.isDeathCounter = function() {
        return this._isDeathCounter;
    };

    //=============================================================================
    // Game_Action
    //=============================================================================

    VictorEngine.DeathCounter.makeTargets = Game_Action.prototype.makeTargets;
    Game_Action.prototype.makeTargets = function() {
        if (this._deathCounterActionTargets) {
            return this._deathCounterActionTargets;
        } else {
            return VictorEngine.DeathCounter.makeTargets.call(this);
        }
    };

    VictorEngine.DeathCounter.apply = Game_Action.prototype.apply;
    Game_Action.prototype.apply = function(target) {
        this.checkDeathCounter(target);
        VictorEngine.DeathCounter.apply.call(this, target);
        if (!target.isStateAffected(target.deathStateId()) && target.hp > 0) {
            target.deathCounterOff();
        }
    };

    Game_Action.prototype.deathCounterTargets = function(target) {
        var result = [];
        if (this.isForUser() || (this.isForFriend() && this.isForOne())) {
            result = [this.subject()];
        } else if (this.isForFriend() && this.isForAll() && !this.isForDeadFriend()) {
            result = this.subject().friendsUnit().aliveMembers();
        } else if (this.isForFriend() && this.isForAll() && this.isForDeadFriend()) {
            result = this.subject().friendsUnit().deadCounterMembers();
        } else if (this.isForOpponent() && this.isForAll()) {
            result = this.subject().opponentsUnit().aliveMembers();
        } else if (this.isForOpponent() && target.isAlive()) {
            result = [target];
        };
        return this.repeatTargets(result);
    };

    Game_Action.prototype.setDeathCounterActionTargets = function(targets) {
        this._deathCounterActionTargets = targets.clone();
    };

    Game_Action.prototype.checkDeathCounter = function(target) {
        if ($gameParty.inBattle()) {
            target._deathCounter = this.deathCounter(target);
            target._isDeathCounter = !!target._deathCounter;
        }
    };

    Game_Action.prototype.deathCounter = function(target) {
        var list = this.deathCounterData(target);
        return list.filter(function(data) {
            return this.processDeathCounter(data, target);
        }, this).sort(this.deathCounterSort.bind(this))[0];
    };

    Game_Action.prototype.deathCounterSort = function(a, b) {
        if (a.priority === b.priority) {
            return b.id - a.id;
        } else {
            return b.priority - a.priority;
        }
    };

    Game_Action.prototype.processDeathCounter = function(data, target) {
        if (!data) {
            return false;
        }
        if ((data.action === 'item' && !target.canUse($dataItems[data.actionId])) ||
            (data.action === 'skill' && !target.canUse($dataSkills[data.actionId]))) {
            return false;
        }
        if (data.rate) {
            return Math.random() < data.rate / 100;
        }
        if (data.code) {
            return Math.random() < this.deathCountersCode(data, target);
        }
        return false;
    };

    Game_Action.prototype.deathCountersCode = function(data, target) {
        try {
            var result = 0;
            var item = this.item();
            var b = this.subject();
            var a = target;
            var v = $gameVariables._data;
            eval(data.code)
            return (Number(result / 100)) || 0;
        } catch (e) {
            return 0;
        }
    };

    Game_Action.prototype.deathCounterData = function(target) {
        return target.traitObjects().reduce(function(r, data) {
            return r.concat(data.deathCounter);
        }, []);
    };

    Game_Action.prototype.setDeathCounterAction = function() {
        return this._isDeathCounterAction = true;
    };

    Game_Action.prototype.isDeathCounterAction = function() {
        return this._isDeathCounterAction;
    };

    //=============================================================================
    // Game_Battler
    //=============================================================================

    VictorEngine.DeathCounter.stateIcons = Game_Battler.prototype.stateIcons;
    Game_BattlerBase.prototype.stateIcons = function() {
        var deathIcon = $dataStates[this.deathStateId()].iconIndex
        return VictorEngine.DeathCounter.stateIcons.call(this).filter(function(icon) {
            return icon !== deathIcon || !this._isDeathCounter;
        }, this)
    };

    VictorEngine.DeathCounter.regenerateAll = Game_Battler.prototype.regenerateAll;
    Game_Battler.prototype.regenerateAll = function() {
        var action = new Game_Action(this);
        action.checkDeathCounter(this);
        VictorEngine.DeathCounter.regenerateAll.call(this);
        if (!this.isStateAffected(this.deathStateId())) {
            this.deathCounterOff();
        }
    };

    VictorEngine.DeathCounter.isDeathStateAffected = Game_Battler.prototype.isDeathStateAffected;
    Game_Battler.prototype.isDeathStateAffected = function() {
        return VictorEngine.DeathCounter.isDeathStateAffected.call(this) && !this._isDeathCounter;
    };

    VictorEngine.DeathCounter.stateMotionIndex = Game_Battler.prototype.stateMotionIndex;
    Game_Battler.prototype.stateMotionIndex = function() {
        var states = this.states()
        if (states[0] && states[0].id === this.deathStateId() && this._isDeathCounter) {
            return states.length > 1 ? states[1].motion : 0;
        } else {
            return VictorEngine.DeathCounter.stateMotionIndex.call(this);
        }
    };

    VictorEngine.DeathCounter.stateOverlayIndex = Game_Battler.prototype.stateOverlayIndex;
    Game_Battler.prototype.stateOverlayIndex = function() {
        var states = this.states()
        if (states[0] && states[0].id === this.deathStateId() && this._isDeathCounter) {
            return states.length > 1 ? states[1].overlay : 0;
        } else {
            return VictorEngine.DeathCounter.stateOverlayIndex.call(this);
        }
    };

    Game_Battler.prototype.deathCounterOff = function() {
        this._deathCounter = null;
        this._isDeathCounter = false;
        this.refresh();
    };

    Game_Battler.prototype.deathCounter = function() {
        return this._deathCounter;
    };

    Game_Battler.prototype.clearDeathCounter = function() {
        this._deathCounter = null;
    };

    //=============================================================================
    // Game_Unit
    //=============================================================================

    Game_Unit.prototype.deadCounterMembers = function() {
        return this.members().filter(function(member) {
            return member.deathStateId();
        });
    };

    //=============================================================================
    // Window_BattleLog
    //=============================================================================

    VictorEngine.DeathCounter.startAction = Window_BattleLog.prototype.startAction;
    Window_BattleLog.prototype.startAction = function(subject, action, targets) {
        if (action.isDeathCounterAction()) {
            this.startDeathCounter(subject, action, targets);
        }
        VictorEngine.DeathCounter.startAction.call(this, subject, action, targets);
    };

    VictorEngine.DeathCounter.performCollapse = Window_BattleLog.prototype.performCollapse;
    Window_BattleLog.prototype.performCollapse = function(target) {
        if (!target.isDeathCounter()) {
            VictorEngine.DeathCounter.performCollapse.call(this, target);
        }
    };

    Window_BattleLog.prototype.startDeathCounter = function(subject, action, targets) {
        this.push('wait');
        var text = VictorEngine.Parameters.DeathCounter.CounterMessage;
        if (text) {
            this.push('addText', text.format(subject.name()));
        }
        var animation = VictorEngine.Parameters.DeathCounter.CounterAnimation;
        if (animation > 0) {
            this.push('showAnimation', subject, [subject], animation);
            this.push('waitForBattleAnimation', animation);
        }
    };

    Window_BattleLog.prototype.endDeathCounter = function(target) {
        this.endAction(target);
        this.push('deathCounterOff', target);
    };

    Window_BattleLog.prototype.deathCounterOff = function(target) {
        target.deathCounterOff();
        if (target.isDeathStateAffected()) {
            this.push('waitForMovement');
            this.push('performCollapse', target);
            this.push('waitForEffect');
        }
    };

})();