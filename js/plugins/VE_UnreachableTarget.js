/*
 * ==============================================================================
 * ** Victor Engine MV - Unreachable Targets
 * ------------------------------------------------------------------------------
 *  VE_UnreachableTargets.js
 * ==============================================================================
 */

var Imported = Imported || {};
Imported['VE - Unreachable Targets'] = '1.04';

var VictorEngine = VictorEngine || {};
VictorEngine.UnreachableTargets = VictorEngine.UnreachableTargets || {};

(function() {

    VictorEngine.UnreachableTargets.loadDatabase = DataManager.loadDatabase;
    DataManager.loadDatabase = function() {
        VictorEngine.UnreachableTargets.loadDatabase.call(this);
        PluginManager.requiredPlugin.call(PluginManager, 'VE - Unreachable Targets', 'VE - Basic Module', '1.22');
        PluginManager.requiredPlugin.call(PluginManager, 'VE - Unreachable Targets', 'VE - Toggle Targets');
    };

    VictorEngine.UnreachableTargets.requiredPlugin = PluginManager.requiredPlugin;
    PluginManager.requiredPlugin = function(name, required, version) {
        if (!VictorEngine.BasicModule) {
            var msg = 'The plugin ' + name + ' requires the plugin ' + required;
            msg += ' v' + version + ' or higher installed to work properly.';
            msg += ' Go to http://victorenginescripts.wordpress.com/ to download the plugin.';
            throw new Error(msg);
        } else {
            VictorEngine.UnreachableTargets.requiredPlugin.call(this, name, required, version)
        };
    };

})();

/*:
 * ==============================================================================
 * @plugindesc v1.04 - Makes battlers unable to be targeted. 
 * @author Victor Sant
 *
 * @param No Target Message
 * @desc Message shown when a battler tries to act, but have no
 * valid target. Leave blank for no message.
 * @default No target in range!
 *
 * @param No Target Step
 * @desc Step forward during action even when have no valid target.
 * true - ON	false - OFF
 * @default true
 *
 * ==============================================================================
 * @help 
 * ==============================================================================
 *
 * ==============================================================================
 *  Reachable (notetag for Actors, Classes, Enemies, Weapons, Armors and States)
 * ------------------------------------------------------------------------------
 *  <reachable: type>
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 *  A battler with this tag can be targeted only by battlers with the a matching
 *  <reach target> tag.
 *    type : reach type (see bellow for detais)
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 *  Ex.: <reachable: flying>
 *       <reachable: ranged>
 * ==============================================================================
 *
 * ==============================================================================
 *  Uneachable (notetag for Actors, Classes, Enemies, Weapons, Armors and States)
 * ------------------------------------------------------------------------------
 *  <unreachable: type>
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 *  A battler with this tag can't be targeted by battlers with the a matching
 *  <reach target> tag.
 *    type : reach type (see bellow for detais)
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 *  Ex.: <unreachable: flying>
 *       <unreachable: ranged>
 * ==============================================================================
 *
 * ==============================================================================
 *  Custom Reachable (for Actors, Classes, Enemies, Weapons, Armors and States)
 * ------------------------------------------------------------------------------
 * <custom reachable>
 *   result = code
 * </custom reachable>
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 *  A battler with this tag can be targeted only by battlers with the a
 *  matching <reach target> tag decided with a script code.
 *    code : code that will return the reach type (see bellow for detais)
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 *  Ex.: <custom reachable>
 *        if ($gameTroop.aliveMembers().length > 1) {
 *            result = 'not alone'
 *        } else {
 *            result = ''
 *        }
 *       </custom reachable>
 * ==============================================================================
 *
 * ==============================================================================
 *  Custom Uneachable (for Actors, Classes, Enemies, Weapons, Armors and States)
 * ------------------------------------------------------------------------------
 * <custom unreachable>
 *   result = code
 * </custom unreachable>
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 *  A battler with this tag can't be targeted by battlers with the a matching
 * <reach target> tag decided with a script code.
 *    type : reach type (see bellow for detais)
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 *  Ex.: <custom unreachable>
 *        if ($gameTroop.aliveMembers().length === 1) {
 *            result = 'is alone'
 *        } else {
 *            result = ''
 *        }
 *       </custom unreachable>
 * ==============================================================================
 *
 * ==============================================================================
 *  Reach Target (notetag for Actors, Classes, Enemies, Weapons, Armors, States, 
 *                Skills, Items)
 * ------------------------------------------------------------------------------
 *  <reach target: type>
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 *  A battler with this tag will be able to reach a battler with reachable
 *  tag of the same type.
 *    type : reach type (see bellow for detais)
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 *  Ex.: <reach target: flying>
 *       <reach target: ranged>
 * ==============================================================================
 *
 * ==============================================================================
 *  Custom Reach Target (notetag for Actors, Classes, Enemies, Weapons, Armors,
 *                       States, Skills, Items)
 * ------------------------------------------------------------------------------
 * <custom reach target>
 *   result = code
 * </custom reach target>
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 *  A battler with this tag will be able to reach a battler with reachable
 *  tag of the same type decided with a script code.
 *    type : reach type (see bellow for detais)
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 *  Ex.: <custom reach target>
 *        if ($gameTroop.aliveMembers().length === 1) {
 *            result = 'is alone'
 *        } else {
 *            result = ''
 *        }
 *       </custom reach target>
 * ==============================================================================
 *
 * ==============================================================================
 * Additional Information:
 * ------------------------------------------------------------------------------
 * 
 *  The code uses the same values as the damage formula, so you can use "a" for
 *  the user, "b" for the target, "v[x]" for variable and "item" for the item
 *  object. The 'result' must return a string (text in quotations).
 * 
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 *
 *  - Reach Types
 *  The type is a arbitrary word used to indentify the reach type of the action.
 *  You can use any word to identify a notetag, just remember that the 
 *  <reach target> type should match with the <reachable> and <unreachable> types
 *  for the action to have any interaction. This setting is case sensitive.
 * 
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 *
 *  - Reachable
 *  The <reachable> notetag makes the target to be reachable only by actions that
 *  have a <reach target> notetag with a matching type.
 * 
 *  For example, a battler with the notetag '<reachable: flying>' can be targeted
 *  only by battlers or actions with the notetag '<reach target: flying>'.
 *  
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 *
 *  - Uneachable
 *  The <unreachable> notetag makes the target to be reachable only by actions
 *  that DON'T have a <reach target> notetag with a matching type. So any action
 *  without a mathcing type will be able to target the battler.
 * 
 *  For example, a battler with the notetag '<unreachable: flying>' can't be 
 *  targeted by battlers or actions with the notetag '<reach target: flying>'.
 *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 *
 *  You can add more than one <reachable>, <ureachable> or <reach target> notetag
 *  to the same object.
 *
 *  A battler is always able to target iself, no matter the type of the notetag.
 *
 * ==============================================================================
 * 
 * ==============================================================================
 *  Compatibility:
 * ------------------------------------------------------------------------------
 *  To be used together with this plugin, the following plugin must be placed
 *  bellow this plugin:
 *     VE - Toggle Targets
 * ==============================================================================
 * 
 * ==============================================================================
 *  Version History:
 * ------------------------------------------------------------------------------
 *  v 1.00 - 2016.01.15 > First release.
 *  v 1.01 - 2016.01.18 > Fixed issue with force action.
 *  v 1.02 - 2016.02.21 > Compatibility with Toggle Targets.
 *  v 1.03 - 2016.03.12 > Added reachable notetag.
 *                      > Changed behavior of unreachable notetag.
 *                      > Added custom script code notetags.
 *  v 1.04 - 2016.07.03 > Compatibility with Battle Motions.
 * ==============================================================================
 */

(function() {

    //=============================================================================
    // Parameters
    //=============================================================================

    if (Imported['VE - Basic Module']) {
        var parameters = VictorEngine.getPluginParameters();
        VictorEngine.Parameters = VictorEngine.Parameters || {};
        VictorEngine.Parameters.UnreachableTargets = {};
        VictorEngine.Parameters.UnreachableTargets.NoTargetMessage = String(parameters["No Target Message"]).trim();
        VictorEngine.Parameters.UnreachableTargets.NoTargetStep = eval(parameters["No Target Step"]);
    };

    //=============================================================================
    // VictorEngine
    //=============================================================================

    VictorEngine.UnreachableTargets.loadNotetagsValues = VictorEngine.loadNotetagsValues;
    VictorEngine.loadNotetagsValues = function(data, index) {
        VictorEngine.UnreachableTargets.loadNotetagsValues.call(this, data, index);
        VictorEngine.UnreachableTargets.loadNotes(data);
    };

    VictorEngine.UnreachableTargets.loadNotes = function(data) {
        data.reachable = data.unreachable || {};
        data.unreachable = data.unreachable || {};
        data.reachTarget = data.reachTarget || {};
        data.reachable.type = data.reachable.type || [];
        data.reachable.code = data.reachable.code || [];
        data.unreachable.type = data.unreachable.type || [];
        data.unreachable.code = data.unreachable.code || [];
        data.reachTarget.type = data.reachTarget.type || [];
        data.reachTarget.code = data.reachTarget.code || []
        this.processNotes(data);
    };

    VictorEngine.UnreachableTargets.processNotes = function(data) {
        var match;
        var regex1 = new RegExp('<(reachable|unreachable|reach target):[ ]*([\\w ]+)[ ]*>', 'gi');
        var regex2 = VictorEngine.getNotesValues('custom (reachable|unreachable|reach target)');
        while (match = regex1.exec(data.note)) {
            this.processValues(match, data, false);
        };
        while (match = regex2.exec(data.note)) {
            this.processValues(match, data, true);
        };
    };

    VictorEngine.UnreachableTargets.processValues = function(match, data, code) {
        var type = match[1].toLowerCase() === 'reach target' ? 'reachTarget' : match[1].toLowerCase();
        if (code) {
            data[type].code.push(match[2].trim());
        } else {
            data[type].type.push(match[2].trim());
        }
    };

    //=============================================================================
    // Game_Action
    //=============================================================================

    VictorEngine.UnreachableTargets.confusionTarget = Game_Action.prototype.confusionTarget;
    Game_Action.prototype.confusionTarget = function() {
        this.setReachableData();
        var result = VictorEngine.UnreachableTargets.confusionTarget.call(this)
        this.clearReachableData();
        return result;
    };

    VictorEngine.UnreachableTargets.targetsForOpponents = Game_Action.prototype.targetsForOpponents;
    Game_Action.prototype.targetsForOpponents = function() {
        this.setReachableData();
        var result = VictorEngine.UnreachableTargets.targetsForOpponents.call(this)
        this.clearReachableData();
        return result;
    };

    VictorEngine.UnreachableTargets.targetsForFriends = Game_Action.prototype.targetsForFriends;
    Game_Action.prototype.targetsForFriends = function() {
        this.setReachableData();
        var result = VictorEngine.UnreachableTargets.targetsForFriends.call(this)
        this.clearReachableData();
        return result;
    };

    Game_Action.prototype.setReachableData = function() {
        this.opponentsUnit().setReachableData(this.subject(), this.item());
        this.friendsUnit().setReachableData(this.subject(), this.item());
    };

    Game_Action.prototype.clearReachableData = function() {
        this.opponentsUnit().clearReachableData();
        this.friendsUnit().clearReachableData();
    };

    //=============================================================================
    // Game_BattlerBase
    //=============================================================================

    Game_BattlerBase.prototype.isReachable = function(data) {
        var subject = data.subject;
        if (subject && subject !== this) {
            var reachable = this.reachableValues(subject);
            var unreachable = this.unreachableValues(subject);
            var reachTarget = subject.reachTargetValues(data.action, this);
            for (var i = 0; i < reachTarget.length; i++) {
                if (unreachable.contains(reachTarget[i])) {
                    return false;
                }
            }
            for (var i = 0; i < reachTarget.length; i++) {
                if (reachable.contains(reachTarget[i])) {
                    return true;
                }
            }
            return reachable.length === 0;
        } else {
            return true;
        }
    };

    Game_BattlerBase.prototype.reachableValues = function(subject) {
        var object = this;
        return object.traitObjects().reduce(function(r, data) {
            var result = subject.getUnreachableValues(data.reachable, object);
            return r.concat(result);
        }, []);
    };

    Game_BattlerBase.prototype.unreachableValues = function(subject) {
        var object = this;
        return object.traitObjects().reduce(function(r, data) {
            var result = object.getUnreachableValues(data.unreachable, subject);
            return r.concat(result);
        }, []);
    };

    Game_BattlerBase.prototype.reachTargetValues = function(action, target) {
        var object = this;
        var objects = [].concat(this.traitObjects(), action || []);
        return objects.reduce(function(r, data) {
            var result = object.getUnreachableValues(data.reachTarget, target);
            return r.concat(result);
        }, []);
    };

    Game_BattlerBase.prototype.getUnreachableValues = function(values, target) {
        var a = this;
        var b = target;
        var v = $gameVariables._data;
        return values.code.reduce(function(r, code) {
            try {
                var result = '';
                eval(code);
                return r.concat(result || []);
            } catch (e) {
                return r;
            }
        }, []).concat(values.type);
    };

    //=============================================================================
    // Game_Unit
    //=============================================================================

    VictorEngine.UnreachableTargets.initialize = Game_Unit.prototype.initialize;
    Game_Unit.prototype.initialize = function() {
        VictorEngine.UnreachableTargets.initialize.call(this);
        this._subjectReachData = {};
    };

    VictorEngine.UnreachableTargets.smoothTarget = Game_Unit.prototype.smoothTarget;
    Game_Unit.prototype.smoothTarget = function(index) {
        result = VictorEngine.UnreachableTargets.smoothTarget.call(this, index)
        return this.smoothReachableTarget(index, result) ? this.aliveMembers()[0] : result;
    };

    Game_Unit.prototype.smoothReachableTarget = function(index, result) {
        if (index < 0) index = 0;
        var member = this.members()[index];
        var reachable = member && member.isReachable(this._subjectReachData);
        return member === result && !reachable;
    };

    VictorEngine.UnreachableTargets.aliveMembers = Game_Unit.prototype.aliveMembers;
    Game_Unit.prototype.aliveMembers = function() {
        var members = VictorEngine.UnreachableTargets.aliveMembers.call(this);
        if (this._subjectReachData) {
            return members.filter(function(member) {
                return member.isReachable(this._subjectReachData);
            }, this);
        } else {
            return members;
        }
    };

    Game_Unit.prototype.setReachableData = function(subject, item) {
        this._subjectReachData = {};
        this._subjectReachData.subject = subject;
        this._subjectReachData.action = item;
    };

    Game_Unit.prototype.clearReachableData = function() {
        this._subjectReachData = {};
    };

    Game_Unit.prototype.reachableEnemies = function() {
        var data = {};
        var action = BattleManager.inputtingAction();
        data.subject = BattleManager.actor();
        data.action = action ? action.item() : null;
        return this.aliveMembers().filter(function(member) {
            return member.isReachable(data);
        });
    };

    Game_Unit.prototype.reachableFriends = function() {
        var data = {};
        var action = BattleManager.inputtingAction();
        data.subject = BattleManager.actor();
        data.action = action ? action.item() : null;
        return this.members().filter(function(member) {
            return member.isReachable(data);
        });
    };

    //=============================================================================
    // BattleManager
    //=============================================================================

    VictorEngine.UnreachableTargets.useItem = Game_Battler.prototype.useItem;
    Game_Battler.prototype.useItem = function(item) {
        if (!$gameParty.inBattle() || BattleManager._targets.length > 0) {
            VictorEngine.UnreachableTargets.useItem.call(this, item);
        }
    };

    //=============================================================================
    // Window_BattleLog
    //=============================================================================

    VictorEngine.UnreachableTargets.startAction = Window_BattleLog.prototype.startAction;
    Window_BattleLog.prototype.startAction = function(subject, action, targets) {
        if (targets.length === 0) {
            this.push('performNoTargetAction', subject, action);
        } else {
            VictorEngine.UnreachableTargets.startAction.call(this, subject, action, targets)
        }
    };

    Window_BattleLog.prototype.performNoTargetAction = function(subject, action) {
        this.setupCurrentAction(subject, action, []);
        var text = VictorEngine.Parameters.UnreachableTargets.NoTargetMessage;
        var step = VictorEngine.Parameters.UnreachableTargets.NoTargetStep;
        if (step) {
            this.push('performActionStart', subject, action);
            this.push('waitForMovement');
        }
        if (text) {
            this.push('addText', text);
        }
    };

    //=============================================================================
    // Window_BattleEnemy
    //=============================================================================

    /* Overwritten function */
    Window_BattleEnemy.prototype.refresh = function() {
        this._enemies = $gameTroop.reachableEnemies();
        Window_Selectable.prototype.refresh.call(this);
    };

    /* Overwritten function */
    Window_BattleEnemy.prototype.isCurrentItemEnabled = function() {
        return this.enemy();
    };

    //=============================================================================
    // Window_BattleActor
    //=============================================================================

    /* Overwritten function */
    Window_BattleActor.prototype.maxItems = function() {
        return $gameParty.reachableFriends().length;
    };

    /* Overwritten function */
    Window_BattleActor.prototype.drawItem = function(index) {
        var actor = $gameParty.reachableFriends()[index];
        this.drawBasicArea(this.basicAreaRect(index), actor);
        this.drawGaugeArea(this.gaugeAreaRect(index), actor);
    };

    /* Overwritten function */
    Window_BattleActor.prototype.actor = function() {
        return $gameParty.reachableFriends()[this.index()];
    };

    /* Compatibility with YEP_BattleStatusWindow */
    Window_BattleActor.prototype.windowActor = function(index) {
        return $gameParty.reachableFriends()[index];
    };

    /* Compatibility with YEP_BattleStatusWindow */
    Window_BattleActor.prototype.drawStatusFace = function(index) {
        var actor = this.windowActor(index);
        var rect = this.itemRect(index);
        var ww = Math.min(rect.width - 8, Window_Base._faceWidth);
        var wh = Math.min(rect.height - 8, Window_Base._faceHeight);
        var wx = rect.x + rect.width - ww - 6;
        var wy = rect.y + 4;
        this.drawActorFace(actor, wx, wy, ww, wh);
    };

})();