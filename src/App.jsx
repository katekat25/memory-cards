//todos:
//make modal slide in that explains rules

//to make it normal memory:
//add reset game button, etc

//add japanese support!
//add dark mode support?

import './App.css'
import { useState, useEffect, useCallback } from 'react';
import { Card } from './Card/Card'
import { useWindowSize } from 'react-use'
import Confetti from 'react-confetti'

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

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  useEffect(() => {
    if (matchedCards.every(value => value === true)) {
      setGameComplete(true);
      setBestScore(moves);
    }
  }, [matchedCards, moves])

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

  function preloadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = resolve;
      img.onerror = reject;
    })
  }

  const loadCards = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  async function getPokemonCount() {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon-species/', { mode: "cors" });
    if (!response.ok) {
      throw new Error(`Error fetching Pokemon count, status: ${response.status}`)
    }
    const data = await response.json();
    return data.count;
  }

  async function getRandomPokemon(dexNumber) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${dexNumber}`, { mode: "cors" });
    if (!response.ok) {
      throw new Error(`Error fetching Pokemon, status: ${response.status}`)
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
    setMoves(0);
    setGameComplete(false);
    setMatchedCards(Array(cardCount).fill(false));
    setCardFlips(Array(cardCount).fill(false));
    loadCards();
  }

  const cards =
    <div className="card-container">
      {mons.map((mon, index) => (
        <Card
          key={mon.index}
          mon={mon}
          style={{ animationDelay: `${index * 0.025}s` }}
          isFaceDown={!cardFlips[index]}
          onClick={(e) => {
            if (cardFlips[index] === false) {
              console.log(`Clicked card ${index}`);
              setMoves(moves => moves + 1);
              const x = e.clientX;
              const y = e.clientY;
              setCardFlips(prev => {
                const newFlips = [...prev];
                newFlips[index] = true;
                return newFlips;
              });
              setConfettiOrigin({ x, y });
            }
          }}
        />
      ))}
    </div>

  const sidebar = (
    <div>
      <button onClick={resetGame}>
        {gameComplete ? "New game" : "Reset game"}
      </button>
      <p>Total moves: {moves}</p>
      {bestScore !== null && <p>Best score: {bestScore}</p>}
    </div>
  );

  return <>
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
    {cards}
  </>
}

export default App
