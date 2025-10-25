import React, { useState, useEffect } from 'react';
import { MainMenu } from './components/MainMenu';
import { GameView } from './components/GameView';
import { useGame } from './hooks/useGame';

// Horror quotes with sources
const horrorQuotes = [
  // Movie quotes
  { quote: "We all go a little mad sometimes.", source: "Psycho (1960)" },
  { quote: "Be afraid. Be very afraid.", source: "The Fly (1986)" },
  { quote: "They're here.", source: "Poltergeist (1982)" },
  { quote: "It's alive! It's alive!", source: "Frankenstein (1931)" },
  { quote: "I see dead people.", source: "The Sixth Sense (1999)" },
  { quote: "In space, no one can hear you scream.", source: "Alien (1979)" },
  { quote: "Do you like scary movies?", source: "Scream (1996)" },
  { quote: "Heeeere's Johnny!", source: "The Shining (1980)" },
  { quote: "When there's no more room in hell, the dead will walk the earth.", source: "Dawn of the Dead (1978)" },
  { quote: "We all float down here.", source: "It (1990/2017)" },
  { quote: "Whatever you do, don't fall asleep.", source: "A Nightmare on Elm Street (1984)" },
  { quote: "Sometimes dead is better.", source: "Pet Sematary (1989)" },
  { quote: "I'm your number one fan.", source: "Misery (1990)" },
  { quote: "Redrum.", source: "The Shining (1980)" },
  { quote: "They're coming to get you, Barbara.", source: "Night of the Living Dead (1968)" },

  // Literary quotes (public domain)
  { quote: "Listen to them—the children of the night. What music they make.", source: "Dracula (1897)" },
  { quote: "The world is full of obvious things which nobody by any chance ever observes.", source: "Sherlock Holmes" },
  { quote: "Beware; for I am fearless, and therefore powerful.", source: "Frankenstein (1818)" },
  { quote: "That is not dead which can eternal lie…", source: "H.P. Lovecraft" },
  { quote: "No live organism can continue for long to exist sanely under conditions of absolute reality.", source: "The Haunting of Hill House" },
  { quote: "Where there is no imagination, there is no horror.", source: "Sir Arthur Conan Doyle" },
  { quote: "The oldest and strongest emotion of mankind is fear.", source: "H.P. Lovecraft" },
  { quote: "The boundaries between life and death are at best shadowy and vague.", source: "Edgar Allan Poe" },
  { quote: "All that we see or seem is but a dream within a dream.", source: "Edgar Allan Poe" },
  { quote: "Even the dead may dream.", source: "Folklore" },
  { quote: "There are more things in heaven and earth, Horatio, than are dreamt of in your philosophy.", source: "Hamlet - Shakespeare" },
  { quote: "I am writing this under an appreciable mental strain, since by tonight I shall be no more.", source: "H.P. Lovecraft" },
  { quote: "Even the smallest candle casts long shadows.", source: "English Proverb" },
  { quote: "Ghosts are real, that much I know.", source: "Crimson Peak (2015)" },
  { quote: "For the night is dark and full of terrors.", source: "Game of Thrones" },
  { quote: "Something wicked this way comes.", source: "Macbeth - Shakespeare" },
  { quote: "All shall fade… all shall fade into shadow.", source: "The Lord of the Rings" },
  { quote: "He who fights monsters should see to it that he himself does not become a monster.", source: "Friedrich Nietzsche" },

  // Original safe quotes (no source needed)
  { quote: "Not all doors lead home.", source: null },
  { quote: "Some paths are meant to stay forgotten.", source: null },
  { quote: "Every legend begins with a whisper.", source: null },
  { quote: "The forest remembers everything.", source: null },
  { quote: "Speak not of the name, and it cannot find you.", source: null },
  { quote: "Beware the house that breathes.", source: null },
  { quote: "There's something out there in the dark.", source: null },
  { quote: "The candle burns low for those who linger.", source: null },
  { quote: "The moon hides more than it shows.", source: null },
  { quote: "When the wind stops, something listens.", source: null },
  { quote: "Your choices decide who survives.", source: null },
  { quote: "Some stories never end… they wait.", source: null },
  { quote: "The darkness remembers your name.", source: null },
  { quote: "Every shadow tells a story.", source: null },
  { quote: "The past is patient.", source: null },
  { quote: "The light only makes the shadows deeper.", source: null },
  { quote: "Every nightmare begins with curiosity.", source: null },
  { quote: "Silence is never empty.", source: null },
  { quote: "Your reflection is watching you.", source: null },
  { quote: "Don't trust the light ahead.", source: null },

  // Additional atmospheric quotes from screenshot
  { quote: "At midnight, all cats are gray.", source: null },
  { quote: "The forest does not care who enters—it only remembers.", source: null },
  { quote: "Dreams have teeth in the Black Forest.", source: null },
  { quote: "When the lantern goes out, the face remains.", source: null },
  { quote: "The road to the temple is haunted by unfinished prayers.", source: null },
  { quote: "Every mirror hides another world.", source: null },
  { quote: "If you stare into still water, something will stare back.", source: null },
  { quote: "Even paper doors can hide dark things.", source: null },
  { quote: "The dead return not for vengeance, but for remembrance.", source: null },
  { quote: "Where incense burns, the unseen gathers.", source: null },
  { quote: "The moonlight does not judge—it only reveals.", source: null },
  { quote: "When the bell tolls twice, one ring is for the living.", source: null },
  { quote: "Whispers travel faster at night.", source: null },
  { quote: "The silence before the storm remembers every name.", source: null },
  { quote: "No shadow walks alone.", source: null },
  { quote: "Some stories are older than fire.", source: null },
  { quote: "The night wears many faces.", source: null },
  { quote: "Every culture buries something that won't stay buried.", source: null }
];

const LoadingQuote: React.FC = () => {
  const [randomQuote] = useState(() => {
    // Select one random quote when component mounts and keep it
    const randomIndex = Math.floor(Math.random() * horrorQuotes.length);
    return horrorQuotes[randomIndex];
  });

  if (!randomQuote) {
    return (
      <div className="loading-quote">
        <p className="quote-text">"Loading your next adventure..."</p>
      </div>
    );
  }

  return (
    <div className="loading-quote">
      <p className="quote-text">"{randomQuote.quote}"</p>
      {randomQuote.source && (
        <p className="quote-source">— {randomQuote.source}</p>
      )}
    </div>
  );
};

export const App = () => {
  const { gameState, isLoading, error, userInfo, userHistory, startGame, playSpecificStory, endGame, clearHistory, trackStoryCompletion, trackStoryAbandonment } = useGame();
  const [showInitialLoading, setShowInitialLoading] = useState(false);

  // Random loading title - selected once when component mounts
  const [loadingTitle] = useState(() => {
    const titles = [
      "An Adventurer Tries",
      "Story Begins Anew",
      "The Curtain Rises",
      "Someone Wanders In",
      "The Door Opens",
      "New Fate Unfolds"
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  });

  // Auto-hide loading screen after brief delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInitialLoading(false);
    }, 1500); // 1.5 second loading screen

    return () => clearTimeout(timer);
  }, []);

  if (error) {
    return (
      <div className="error-screen">
        <div className="error-content">
          <h2>No More Adventures</h2>
          <p>{error}</p>
          <button className="primary-button" onClick={endGame}>
            Return to Menu
          </button>
        </div>
      </div>
    );
  }

  // Show initial loading screen after app loads
  if (showInitialLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <img src="/assets/loading.gif" alt="Loading..." className="loading-gif" />
          <h2>{loadingTitle}</h2>
          <LoadingQuote />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <img src="/assets/loading.gif" alt="Loading..." className="loading-gif" />
          <h2>Looking for Your Next Adventure</h2>
          <LoadingQuote />
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
          trackStoryCompletion={trackStoryCompletion}
          trackStoryAbandonment={trackStoryAbandonment}
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
