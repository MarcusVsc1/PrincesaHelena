//=============================================================================
// Dualtech system
// Jay_Dualtechs.js
// Version 1.1
//=============================================================================

var Imported = Imported || {};
Imported.Jay_Dualtechs = true;

var Jay = Jay || {};
Jay.Dualtechs = Jay.Dualtechs || {};

//=============================================================================
 /*:
 * @plugindesc Adds functionality for multitech skills.
 *
 * @author Jason R. Godding
 *
 * @param Cycle Actors
 * @desc Set to "true" to have skill costs cycle between actors. 
 * Set to "false" to display costs for all actors at once.
 * @default false
 *
 * @param Cycle Length
 * @desc How long it takes to switch actors with "Cycle Actors". 
 * 60 = 1 second.
 * @default 60
 *
 * @help Allows certain skills to be dualtechs, combining two characters' skills
 * into one. For dualtechs that do not have special unlock conditions, just
 * have the characters learn them at level 1; they won't show up unless
 * both characters are present and have the necessary skills.
 *
 * A dualtech skill should have the following tag in its note box:
 * <Dual:ID1,Skill1,ID2,Skill2,ID3,...,HitRate>
 *
 * ID1 is the character ID of one of the characters involved.
 * Skill1 is the skill required for that character, either as an ID or skill name.
 * ID2 and Skill2 likewise refer to the second character. You can include up
 * to 10 characters with skills.
 *
 * Hit Rate is optional and only useful for dualtechs that are not Certain Hit. 
 * Without it, it will use the Hit Rate of the user, which I plan to configure
 * differently in the future.) HitRate is always defined last. You may define
 * the following values for Hit Rate:
 *
 * user - Uses the user's hit rate.
 * first - Uses the first actor's (ID1's) hit rate.
 * second - Uses the second actor's (ID2's) hit rate.
 * highest - Uses the hit rate of the actor whose hit rate is highest.
 * lowest - Uses the hit rate of the actor whose hit rate is lowest.
 *
 * For battle algorithms, "a" still refers to the user of the skill (defined as the
 * one who actually used the skill from the menu), and "b" to the target. But now,
 * there is "c", the character defined by ID1, and "d", the character defined by ID2,
 * which do not change based on which character selected the skill. These continue on
 * to "e" for ID3, "f" for ID4, all the way up to "l".
 *
 * If Game_Actor.icon() is defined, it will show an icon of each user of the skill.
 * Otherwise, it will show the characters' names, which can get kind of unweildy.
 * Game_Actor.icon() is not defined in here.
 *
 * The component skills of the actors can use any sort of cost you can dream of, even
 * those defined with other plugins. However, and this is important, certain "universal"
 * costs must ONLY be defined for at most one character in the tech! Universal costs
 * are those not tied to a specific actor, like items, gold, Yanfly's Party Limit gauge,
 * and so on. You can use multiple universal costs, but each cost can only be used by
 * one character. Non-universal costs (such as HP, MP, or TP) are perfectly valid
 * for multiple characters to use.
 *
 * Teaching a multitech skill to someone other than those defined in the Dual tag will
 * cause the user to be treated as a member of the multitech, but without having to
 * define a component (the user will spend the costs associated with the multitech).
 * However, it will only work with the user. (Example: If the Dual tag lists Joe and Bob,
 * but Alice learns the tech, then Alice can use it as a triple tech. However, Joe
 * and Bob would not be able to use it while keeping Alice as a part of it.)
 *
 * If you define the dualtech as a component for itself for any actor, then you drop
 * the dependency on another skill and instead use the costs and restrictions defined
 * to the dualtech. One or both characters may be set this way. It is not recommended to
 * set a skill as a component to itself for any actor if the user of the skill is not,
 * itself, defined in the dual tag.
 *
 * If a different skill is listed as the component, the MP and other associated costs
 * of the dualtech skill will be ignored (but not its restrictions).
 *
 * It is not required that all members of the tech learn the tech itself - if Joe and Bob
 * have a dualtech, you can teach it only to Joe and it will still work. However, Bob will
 * not be able to initiate the dualtech. Bob must still learn his component skill either way,
 * though.
 *
 * This does not define animations for the characters; only the user will animate. If you
 * are using side-view battles, it is recommended you use a plugin that allows for such
 * animations, such as Yanfly's Action Sequence plugins.
 *
 * At present, choosing to use a dualtech will only actually use up the turn of the
 * character who uses the skill. Also, dualtechs are not compatible with enemy battlers.
 *
 * This is compatible with Yanfly's Skill Core plugin v. 1.01, as well as any other
 * plugins that affect the skill cost that follow the recommendation below. Please
 * place this plugin after all such plugins in your plugin list.
 * 
 * === NOTE TO OTHER PLUGIN WRITERS ===
 *
 * If you are writing a plugin that adds other sorts of skill costs or modifies the
 * display of the skill cost in any way, please have Window_SkillList.drawSkillCost
 * return the width of the remaining text area after drawing the cost of your skill
 * to maintain compatibility with this plugin.
 *
 * ====================================
 *
 * Version 1.1 - You can now define up to 10 characters for a tech.
 *
 * Version 1.0.5d - Fixed an incompatibility issue with Bobstah's Battle Commands.
 *
 * Version 1.0.5c - Fixed a couple of minor issues for triple techs.
 *
 * Version 1.0.5b - Last version contained a clumsy bug that let actors use non-
 *  dualtech skills even when they have insufficient MP! Oops. Fixed that.
 *
 * Version 1.0.5 - Fixed another minor bug and added commands for determining which
 *  actor's Hit Rate to use for a skill.
 *
 * Version 1.0.4 - Fixed a minor bug and added a segment to the help file.
 *
 * Version 1.0.3 - Added the option to cycle between actors instead of displaying all
 *  of them at once.
 *
 * Version 1.0.2 - Fixed compatibility with Yanfly's Skill Core (and other similar
 *  plugins.)
 *
 * Version 1.0.1 - Fixed an issue where skills temporarily granted to an actor through
 *  Traits would not activate dualtechs.
 *
 * Version 1.0 - First version.
 * 
 * This plugin is free for non-commercial and commercial use, but please credit 
 * Jason R. Godding if you use it. Thank you.
 * 
 */

Jay.Parameters = Jay.Parameters || {};
Jay.Parameters.Dualtechs = PluginManager.parameters('Jay_Dualtechs');

Jay.Param = Jay.Param || {};
Jay.Param.CycleActors = String(Jay.Parameters.Dualtechs['Cycle Actors']) === 'true';
Jay.Param.CycleLength = Number(Jay.Parameters.Dualtechs['Cycle Length']);

Jay.Dualtechs.dualSkillData = function(dualData) {
	var dualParams = dualData.split(',');
	var returnParams = {};
	var len = dualParams.length;

	if(len%2 === 0) { // Or, in other words, if the number of parameters is even
		returnParams.accType = 'user';
	}
	else {
		returnParams.accType = dualParams[len-1];
		len--;
	}

	returnParams.actors = [];
	returnParams.skills = [];

	for(var i=0; i < len; i += 2) {
		returnParams.actors.push(Number(dualParams[i]));
		if(isNaN(dualParams[i+1])) {
			returnParams.skills.push($dataSkills.filter(function(skill) { 
				return skill !== null && skill.name === dualParams[i+1]; 
				})[0].id);
		}
		else {
			returnParams.skills.push(Number(dualParams[i+1]));
		}
	}

	return returnParams;
}

Window_SkillList.prototype.includes = function(item) {
    	if (!item || item.stypeId !== this._stypeId) {
		return false;
	}

	if(!item.meta.Dual) {
		return true;
	}
	
	var dualParams = Jay.Dualtechs.dualSkillData(item.meta.Dual);

	for(var i=0; i<dualParams.actors.length; i++) {
		var actorId = dualParams.actors[i];
		var skillId = dualParams.skills[i];
		if ($gameParty.members().indexOf($gameActors.actor(actorId)) === -1) {
			return false;
		}
		if(!$gameActors.actor(actorId).skills().contains($dataSkills[skillId])) {
			return false;
		}
	}

	return true;
};

Jay.Dualtechs.updateWindow = Window_SkillList.prototype.update;
Window_SkillList.prototype.update = function() {
	if (Jay.Param.CycleActors && !this._cycleTimer) {
		this._cycleTimer = 0;
		this._cyclePhase = 0;
	}
	this._cycleTimer += 1;
	if(this._cycleTimer >= Jay.Param.CycleLength + 1) {
		this._cycleTimer = 1;
		this._cyclePhase += 1;
		if(this._cyclePhase >= 2520) {
			this._cyclePhase = 0;
		}
		this.refresh();
	}
	Jay.Dualtechs.updateWindow.call(this);
}

Jay.Dualtechs.drawSkillCost = Window_SkillList.prototype.drawSkillCost;
Window_SkillList.prototype.drawSkillCost = function(skill, x, y, width) {
	if(!skill.meta.Dual) {
		return this.drawNonDualSkillCost(skill, x, y, width);
	}

	var dualParams = Jay.Dualtechs.dualSkillData(skill.meta.Dual);
	var actorCount = dualParams.actors.length;
	var endWidth = width;

	var userIsInTech = dualParams.actors.contains(this._actor.actorId());

	if(Jay.Param.CycleActors) {
		if(!userIsInTech) {
			actorCount++;
		}
		var actorToShow = this._cyclePhase%actorCount;
		if(!userIsInTech) {
			actorToShow--;
		}
		if(actorToShow === -1) {
			endWidth = this.drawComponentSkillCost(this._actor, skill, x, y, endWidth);
		}
		else {
			endWidth = this.drawComponentSkillCost($gameActors.actor(dualParams.actors[actorToShow]),
				$dataSkills[dualParams.skills[actorToShow]], x, y, endWidth);
		}
	}
	else {
		for(var i=actorCount-1; i>=0; i--) {
			endWidth = this.drawComponentSkillCost($gameActors.actor(dualParams.actors[i]),
				$dataSkills[dualParams.skills[i]], x, y, endWidth);
		}
		if(!userIsInTech) {
			endWidth = this.drawComponentSkillCost(this._actor, skill, x, y, endWidth);
		}
	}

	return endWidth;
}

Window_SkillList.prototype.drawNonDualSkillCost = function(skill, x, y, width) {
	var returnWidth = Jay.Dualtechs.drawSkillCost.call(this, skill, x, y, width);
		
	if (returnWidth === undefined) {
		if (this._actor.skillTpCost(skill) > 0) {
        		returnWidth = width - this.textWidth(skill.tpCost);
    		} else if (this._actor.skillMpCost(skill) > 0) {
        		returnWidth = width - this.textWidth(skill.mpCost);
    		} else {
			returnWidth = width;
		}
	}
		
	return returnWidth;
}

Window_SkillList.prototype.drawComponentSkillCost = function(actor, skill, x, y, width) {
	var endWidth = this.drawNonDualSkillCost(skill, x, y, width);

	this.resetTextColor();

	if(actor.icon) {
		this.drawIcon(actor.icon(), x + endWidth - Window_Base._iconWidth - 2, y + 2);
		endWidth -= Window_Base._iconWidth + 10;
	}
	else {
		if(endWidth === width) {
			this.drawText(actor.name(), x, y, endWidth, 'right');
			endWidth -= this.textWidth(" " + actor.name());
		}
		else {
			this.drawText(actor.name() + ":", x, y, endWidth, 'right');
			endWidth -= this.textWidth(" " + actor.name() + ":");
		}
	}

	return endWidth;
}

Jay.Dualtechs.meetsSkillConditions = Game_BattlerBase.prototype.meetsSkillConditions;
Game_BattlerBase.prototype.meetsSkillConditions = function(skill) {
	if(skill.meta.Dual) {	
		if (this.isEnemy()) {
			return false;
		}

		var dualParams = Jay.Dualtechs.dualSkillData(skill.meta.Dual);

		var actorList = $gameParty.members();
		var testedUser = false;

		for(var i=0; i<dualParams.actors.length; i++) {
			var actor = $gameActors.actor(dualParams.actors[i]);
			if(actorList.indexOf(actor) === -1) {
				return false;
			}
			if(!Jay.Dualtechs.meetsSkillConditions.call(actor, $dataSkills[dualParams.skills[i]])) {
				return false;
			}
			if(this === actor) {
				testedUser = true;
				if(!(this.meetsUsableItemConditions(skill) && this.isSkillWtypeOk(skill) &&
					!this.isSkillSealed(skill.id) && 
					!this.isSkillTypeSealed(skill.stypeId))) {
					return false;
				}
			}
		}
		
		if(testedUser) {
			return true;
		}
	}

	return Jay.Dualtechs.meetsSkillConditions.call(this, skill);
}

Jay.Dualtechs.paySkillCost = Game_BattlerBase.prototype.paySkillCost;
Game_BattlerBase.prototype.paySkillCost = function(skill) {
	if(skill.meta.Dual) {	
		var dualParams = Jay.Dualtechs.dualSkillData(skill.meta.Dual);
		var userPaid = false;
		
		for(var i=0; i<dualParams.actors.length; i++) {
			Jay.Dualtechs.paySkillCost.call($gameActors.actor(dualParams.actors[i]),
				$dataSkills[dualParams.skills[i]]);
			if(this === $gameActors.actor(dualParams.actors[i])) {
				userPaid = true;
			}
		}
		
		if(userPaid) {
			return;
		}
	}
	
	Jay.Dualtechs.paySkillCost.call(this, skill);
}

Jay.Dualtechs.evalDamageFormula = Game_Action.prototype.evalDamageFormula;
Game_Action.prototype.evalDamageFormula = function(target) {
	if(!this.item().meta.Dual) {
		return Jay.Dualtechs.evalDamageFormula.call(this, target);
	}
	try {
		var item = this.item();
		var dualParams = Jay.Dualtechs.dualSkillData(item.meta.Dual);
		var c = $gameActors.actor(dualParams.actors[0]);
		var d = $gameActors.actor(dualParams.actors[1]);
		var e = $gameActors.actor(dualParams.actors[2]);
		var f = $gameActors.actor(dualParams.actors[3]);
		var g = $gameActors.actor(dualParams.actors[4]);
		var h = $gameActors.actor(dualParams.actors[5]);
		var i = $gameActors.actor(dualParams.actors[6]);
		var j = $gameActors.actor(dualParams.actors[7]);
		var k = $gameActors.actor(dualParams.actors[8]);
		var l = $gameActors.actor(dualParams.actors[9]);
		var a = this.subject();
		var b = target;
		var v = $gameVariables._data;
		var sign = ([3, 4].contains(item.damage.type) ? -1 : 1);
		return Math.max(eval(item.damage.formula), 0) * sign;
	} 
	catch (e) {
		return 0;
	}
}

Game_Action.prototype.itemHit = function(target) {
    if (this.isPhysical()) {
        var hitRate = this.subject().hit;
        if (this.item().meta.Dual) {
            var dualParams = Jay.Dualtechs.dualSkillData(this.item().meta.Dual);
            switch (dualParams.accType) {
            	case "user":
			hitRate = this.subject().hit;
			break;
		case "first":
           	case "actor1":
                    	hitRate = $gameActors.actor(dualParams.actors[0]).hit;
                    	break;
           	case "second":
           	case "actor2":
                    	hitRate = $gameActors.actor(dualParams.actors[1]).hit;
                    	break;
           	case "actor3":
                    	hitRate = $gameActors.actor(dualParams.actors[2]).hit;
                    	break;
           	case "actor4":
                    	hitRate = $gameActors.actor(dualParams.actors[3]).hit;
                    	break;
           	case "actor5":
                    	hitRate = $gameActors.actor(dualParams.actors[4]).hit;
                    	break;
           	case "actor6":
                    	hitRate = $gameActors.actor(dualParams.actors[5]).hit;
                    	break;
           	case "actor7":
                    	hitRate = $gameActors.actor(dualParams.actors[6]).hit;
                    	break;
           	case "actor8":
                   	hitRate = $gameActors.actor(dualParams.actors[7]).hit;
                    	break;
           	case "actor9":
                    	hitRate = $gameActors.actor(dualParams.actors[8]).hit;
                    	break;
           	case "actor10":
                    	hitRate = $gameActors.actor(dualParams.actors[9]).hit;
                    	break;
           	case "higher":
           	case "highest":
		case "max":
			for(var i=0; i<dualParams.actors.length; i++) {
				var newHitRate = $gameActors.actor(dualParams.actors[i]).hit;
				if (newHitRate > hitRate) {
					hitRate = newHitRate;
				}
			}
                    	break;
           	case "lower":
           	case "lowest":
		case "min":
			for(var i=0; i<dualParams.actors.length; i++) {
				var newHitRate = $gameActors.actor(dualParams.actors[i]).hit;
				if (newHitRate < hitRate) {
					hitRate = newHitRate;
				}
			}
                    	break;
            }
        }
        return this.item().successRate * 0.01 * hitRate;
    } else {
        return this.item().successRate * 0.01;
    }
};