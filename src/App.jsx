import './App.css'
import { useState, useEffect, useCallback } from 'react';
import Modal from 'react-modal';
import { Card } from './Card/Card'
import { useWindowSize } from 'react-use'
import Confetti from 'react-confetti'

Modal.setAppElement('#root');

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function App() {
  const cardCount = 24;
  const { width, height } = useWindowSize();

  const [mons, setMons] = useState([]);
  const [cardFlips, setCardFlips] = useState(Array(cardCount).fill(false));
  const [matchedCards, setMatchedCards] = useState(Array(cardCount).fill(false));
  const [isExploding, setIsExploding] = useState(false);
  const [confettiOrigin, setConfettiOrigin] = useState({ x: width / 2, y: height / 2 });
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [bestScore, setBestScore] = useState(null);
  const [modalIsOpen, setIsOpen] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [loading, setLoading] = useState(true);


  function closeModal() {
    setIsFadingOut(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsFadingOut(false);
    }, 250);
  }

  useEffect(() => {
    if (matchedCards.every(value => value === true)) {
      setGameComplete(true);
      if (bestScore === null) {
        setBestScore(moves);
      } else if (moves < bestScore) {
        setBestScore(moves);
      }
    }
  }, [matchedCards, moves, bestScore]);

  useEffect(() => {
    let flippedIndexes = cardFlips.reduce((acc, flipped, index) => {
      if (flipped && matchedCards[index] === false) acc.push(index);
      return acc;
    }, []);

    if (flippedIndexes.length === 2) {
      const [firstIndex, secondIndex] = flippedIndexes;
      const firstCard = mons[firstIndex];
      const secondCard = mons[secondIndex];

      if (firstCard && secondCard && firstCard.name === secondCard.name) {
        setIsExploding(false);
        setTimeout(() => {
          setIsExploding(true);
        }, 10);
        setMatchedCards(prev => {
          const newMatches = [...prev];
          newMatches[firstIndex] = true;
          newMatches[secondIndex] = true;
          return newMatches;
        });
      } else {
        setTimeout(() => {
          setCardFlips(prev => {
            const newFlips = [...prev];
            newFlips[firstIndex] = false;
            newFlips[secondIndex] = false;
            return newFlips;
          });
        }, 1000);
      }
    }
  }, [cardFlips, mons, matchedCards]);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = useCallback(async () => {
    console.log("Loading cards...");
    setLoading(true);

    let totalMons = await getPokemonCount();
    const randomIds = new Set();

    while (randomIds.size < (cardCount / 2)) {
      let r = Math.floor(Math.random() * totalMons) + 1;
      randomIds.add(r);
    }

    const duplicatedIds = Array.from(randomIds).flatMap(id => [id, id]);
    const promises = shuffleArray(duplicatedIds).map(id => getRandomPokemon(id));
    const monData = await Promise.all(promises);

    await Promise.all(monData.map(mon => preloadImage(mon.sprite)));

    monData.forEach(mon => mon.index = crypto.randomUUID());
    setMons(monData);
    setLoading(false);
    console.log("Cards set");
  }, []);



  function preloadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = resolve;
      img.onerror = reject;
    });
  }

  async function getPokemonCount() {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon-species/', { mode: "cors" });
    if (!response.ok) {
      throw new Error(`Error fetching Pokemon count, status: ${response.status}`);
    }
    const data = await response.json();
    return data.count;
  }

  async function getRandomPokemon(dexNumber) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${dexNumber}`, { mode: "cors" });
    if (!response.ok) {
      throw new Error(`Error fetching Pokemon, status: ${response.status}`);
    }
    const data = await response.json();

    const unhyphenatedName = data.name.replace("-", " ");
    return {
      name: unhyphenatedName,
      types: data.types.map(t => t.type.name),
      sprite: data.sprites.other["official-artwork"].front_default
    };
  }

  function resetGame() {
    setIsResetting(true);
    setCardFlips(Array(cardCount).fill(false));
    setMatchedCards(Array(cardCount).fill(false));
    setGameComplete(false);
    setMoves(0);

    setTimeout(() => {
      setMons([]);
      loadCards();
      setIsResetting(false);
    }, 350);
  }


  const cards = (
    <div className={`card-container ${isResetting ? "fade-out hidden" : ""}`}>
      {mons.map((mon, index) => (
        <Card
          key={mon.index}
          mon={mon}
          style={{ animationDelay: `${index * 0.025}s` }}
          isFaceDown={!cardFlips[index]}
          onClick={(e) => {
            if (!cardFlips[index]) {
              setMoves(m => m + 1);
              setCardFlips(prev => {
                const newFlips = [...prev];
                newFlips[index] = true;
                return newFlips;
              });
              setConfettiOrigin({ x: e.clientX, y: e.clientY });
            }
          }}
        />
      ))}
    </div>
  );

  const sidebar = (
    <div className="sidebar" style={{ animationDelay: `${(cardCount * 0.025) + 0.25}s` }}>
      <p>Total moves: {moves}</p>
      <p>Best score: {bestScore}</p>
      <button onClick={resetGame}>
        {gameComplete ? "New game" : "Reset game"}
      </button>
    </div>
  );

  return (
    <div className="container">
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className={`modal ${isFadingOut ? 'modal-exit' : ''}`}
        overlayClassName={`modal-overlay ${isFadingOut ? 'modal-overlay-exit' : ''}`}
        contentLabel="Game Instructions"
        shouldCloseOnOverlayClick={false}
      >
        <div className="modal-content">
          <h2>How to Play</h2>
          <p>Click on any card to flip it over and reveal a Pokémon. Then, click another card to try and find its match. If the two cards match, they’ll stay face up. Keep going until you’ve matched all the Pokémon, and try to win in as few moves as possible!</p>
          <button onClick={closeModal}>Start Game</button>
        </div>
      </Modal>

      {isExploding && (
        <Confetti
          width={width}
          height={height}
          confettiSource={{ x: confettiOrigin.x, y: confettiOrigin.y, w: 0, h: 0 }}
          numberOfPieces={50}
          gravity={.3}
          initialVelocity={{ x: 200, y: 200 }}
          friction={1.01}
          recycle={false}
          tweenDuration={100}
          onConfettiComplete={() => setIsExploding(false)}
        />
      )}

      {sidebar}
      {loading ? (
        <div className="loading-container">
          {/* Loading gif from loading.io */}
          <img src="/loading.gif" />
        </div>
      ) : (
        cards
      )}

    </div>
  );
}

export default App;