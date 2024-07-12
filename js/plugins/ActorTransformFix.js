/*:
 * @plugindesc Corrige o retorno do gráfico do ator ao remover status, mesmo quando derrotado. 
 * @help Este plugin restaura o gráfico original do ator ao remover um status de transformação e aplica a transformação ao ganhar o status.
 */

(function() {
  // Armazena a função original para processar a aplicação do status
  var _Game_Battler_addNewState = Game_Battler.prototype.addNewState;
  
  Game_Battler.prototype.addNewState = function(stateId) {
    // Chama a função original
    _Game_Battler_addNewState.call(this, stateId);
    
    // Verifica se o ator ganhou o status de transformação
    if (this.isActor() && this.states().some(state => state.id === stateId)) {
      var state = this.states().find(state => state.id === stateId);
      if (state && state.meta.customTransform) {
        // Arquiva as configurações anteriores
        this._prevBattlerName = this._prevBattlerName || this._battlerName;
        
        // Define o novo gráfico do ator
        var battlerName = state.meta.customTransform;
        this.setBattlerImage(battlerName);
        
        // Atualiza a aparência do ator
        this.refresh();
      }
    }
  };
  
  // Armazena a função original para processar a remoção do status
  var _Game_Battler_removeState = Game_Battler.prototype.removeState;
  
  Game_Battler.prototype.removeState = function(stateId) {
    // Chama a função original
    _Game_Battler_removeState.call(this, stateId);
    
    // Verifica se o ator perdeu o status de transformação
    if (this.isActor() && this._prevBattlerName) {
      var battlerName = this._prevBattlerName;
      
      // Restaura o gráfico do ator
      this.setBattlerImage(battlerName);
      
      // Limpa os dados arquivados
      this._prevBattlerName = undefined;
      
      // Atualiza a aparência do ator
      this.refresh();
    }
  };
  
  // Armazena a função original para processar a derrota
  var _Game_Actor_performCollapse = Game_Actor.prototype.performCollapse;
  
  Game_Actor.prototype.performCollapse = function() {
    // Chama a função original
    _Game_Actor_performCollapse.call(this);
    
    // Verifica se o ator está derrotado e se possui um gráfico anterior armazenado
    if (this.isDead() && this._prevBattlerName) {
      var battlerName = this._prevBattlerName;
      
      // Restaura o gráfico do ator
      this.setBattlerImage(battlerName);
      
      // Limpa os dados arquivados
      this._prevBattlerName = undefined;
      
      // Atualiza a aparência do ator
      this.refresh();
    }
  };
})();
