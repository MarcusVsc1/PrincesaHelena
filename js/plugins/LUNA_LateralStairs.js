//-----------------------------------------------------------------------------
//  Luna's Lateral Stairs
//-----------------------------------------------------------------------------
//  For: RPGMAKER MV
//  LUNA_LateralStairs.js
//-----------------------------------------------------------------------------
//  2016-06-20 - Version 1.0 - release
//-----------------------------------------------------------------------------
//  Terms can be found at:
//  galvs-scripts.com
//-----------------------------------------------------------------------------


//-----------------------------------------------------------------------------
/*:
 * @plugindesc Basic movement to go up and down lateral stairs
 * 
 * @author Luna
 *
 * @param UPLR_TerrainTag
 * @desc Terrain tag for up to the right stairs
 * @default 1
 *
 * @param DOWNLR_TerrainTag
 * @desc Terrain tag for down to the right stairs
 * @default 2
 *
 * @help
 *   Galv's Diagonal Movement
 * ----------------------------------------------------------------------------
 * Plug and play. If this doesn't play nice with other plugins, try putting it
 * at the top of the plugin list. It overwrites the default diagonal function.
 *
 */


//-----------------------------------------------------------------------------
//  CODE STUFFS
//-----------------------------------------------------------------------------



(function() {

	var UPLR  = Number(PluginManager.parameters('Luna_LateralStairs')["UPLR_TerrainTag"]);
	var DOWNLR  = Number(PluginManager.parameters('Luna_LateralStairs')["DOWNLR_TerrainTag"]);

	Game_CharacterBase.prototype.isFreeTile = function(x, y) {
	    if (!$gameMap.isValid(x, y)) {
	        return false;
	    }
	    if (this.isThrough() || this.isDebugThrough()) {
	        return true;
	    }
	    if (this.isCollidedWithCharacters(x, y)) {
	        return false;
	    }
	    return true;
	};

	// OVERWRITE
	Game_CharacterBase.prototype.canPassDiagonally = function(x, y, horz, vert) {
	    var x2 = $gameMap.roundXWithDirection(x, horz);
	    var y2 = $gameMap.roundYWithDirection(y, vert);
	    
	    if (this.canPass(x, y, vert) && this.canPass(x, y2, horz)) { // move vertically and from there horizontally
	        return true;
	    }
	    if (this.canPass(x, y, horz) && this.canPass(x2, y, vert)) { // move horizontally and from there vertically
	        return true;
	    }
	    var terrainTags = [UPLR,DOWNLR];
	    var targetTT = $gameMap.terrainTag(x2,y2);
	    if (terrainTags.contains(targetTT) && this.isFreeTile(x2,y2)) {
	        return true;
	    }
	    

	    return false;
	};
	
	// OVERWRITE
	Game_CharacterBase.prototype.moveStraight = function(d) {
	    var newX = $gameMap.roundXWithDirection(this._x, d);
	    var newY = $gameMap.roundYWithDirection(this._y, d);
	    var terrainTag = $gameMap.terrainTag(newX,newY);
	    var currentTerrainTag = $gameMap.terrainTag(this._x,this._y);

	    if (terrainTag == UPLR && d == 6 && currentTerrainTag != DOWNLR) { //going up  to the right
	        this.lockToTheSide = true;
	        this.moveDiagonally(6,8);
	        return;
	    } else if (currentTerrainTag == UPLR && d == 4 && terrainTag != DOWNLR) { //going down to the left
	        this.lockToTheSide = true;
	        this.moveDiagonally(4,2);
	        return;
	    } else if (terrainTag == DOWNLR && d == 4 && currentTerrainTag != UPLR) { //going up to the left
	        this.lockToTheSide = true;
	        this.moveDiagonally(4,8);
	        return;
	    } else if (currentTerrainTag == DOWNLR && d == 6 && terrainTag != UPLR) { //going down to the right
	        this.lockToTheSide = true;
	        this.moveDiagonally(6,2);
	        return;
	    } else {
	        this.setMovementSuccess(this.canPass(this._x, this._y, d));
	        if (this.isMovementSucceeded()) {
	            this.setDirection(d);
	            this._x = $gameMap.roundXWithDirection(this._x, d);
	            this._y = $gameMap.roundYWithDirection(this._y, d);
	            this._realX = $gameMap.xWithDirection(this._x, this.reverseDir(d));
	            this._realY = $gameMap.yWithDirection(this._y, this.reverseDir(d));
	            this.increaseSteps();
	        } else {
	            this.setDirection(d);
	            this.checkEventTriggerTouchFront(d);
	        }
	    }    
	};

	// OVERWRITE
	Game_CharacterBase.prototype.moveDiagonally = function(horz, vert) {
	    this.setMovementSuccess(this.canPassDiagonally(this._x, this._y, horz, vert));
	    if (this.isMovementSucceeded()) {
	        this._x = $gameMap.roundXWithDirection(this._x, horz);
	        this._y = $gameMap.roundYWithDirection(this._y, vert);
	        this._realX = $gameMap.xWithDirection(this._x, this.reverseDir(horz));
	        this._realY = $gameMap.yWithDirection(this._y, this.reverseDir(vert));
	        this.increaseSteps();
	    }
	    if (this.lockToTheSide){
	        this.lockToTheSide = false;
	        this.setDirection(horz);
	    } else {
	        if (this._direction === this.reverseDir(horz)) {
	            this.setDirection(horz);
	        }
	        if (this._direction === this.reverseDir(vert)) {
	            this.setDirection(vert);
	        }
	    }
	};



})();