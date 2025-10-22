import React from 'react';
import { MainMenu } from './components/MainMenu';
import { GameView } from './components/GameView';
import { useGame } from './hooks/useGame';

export const App = () => {
  const { gameState, isLoading, error, userInfo, userHistory, startGame, playSpecificStory, endGame, clearHistory } = useGame();

  if (error) {
    return (
      <div className="error-screen">
        <div className="error-content">
          <h2>Something Went Wrong</h2>
          <p>{error}</p>
          <button className="primary-button" onClick={endGame}>
            Return to Menu
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <img src="/assets/loading.gif" alt="Loading..." className="loading-gif" />
          <h2>Summoning Your Nightmare...</h2>
          <p>The darkness is preparing your tale...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {gameState.gameStarted && gameState.currentStory ? (
        <GameView 
          story={gameState.currentStory} 
          onGameEnd={endGame}
          onRestartWithSettings={startGame}
          currentTone={gameState.selectedTone}
          currentDuration={gameState.selectedDuration}
        />
      ) : (
        <MainMenu 
          onStartGame={startGame}
          onPlayStory={playSpecificStory}
          userInfo={userInfo}
          userHistory={userHistory}
          onClearHistory={clearHistory}
        />
      )}
    </div>
  );
};
