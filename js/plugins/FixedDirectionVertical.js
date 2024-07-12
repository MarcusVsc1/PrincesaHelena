//-----------------------------------------------------------------------------
// 2D Fixed Direction (Vertical)
/*:
 * @plugindesc Only allows player to face up or down (even when moving left or right). Example uses Infinite Runner or Top-down racers.
 * @author Quasi      Site: http://quasixi.com
 * @help This plugin does not provide plugin commands.
 */
(function() {
  var Alias_Game_CharacterBase_setDirection = Game_CharacterBase.prototype.setDirection;
  Game_CharacterBase.prototype.setDirection = function(d) {
    if (d === 2 || d === 8) {
      Alias_Game_CharacterBase_setDirection.call(this, d);
    }
  };
}());