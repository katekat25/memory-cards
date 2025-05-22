//todos:
//can we just make this a fucking normal memory game please? ~we have the technology~
//make modal slide in that explains rules

//to make it normal memory:
//start them all face down
//cards store a flipped status
//track score in App
//when a pair is matched, remove the cards from the game but keep a space where they were
//add reset game button, etc

//add japanese support!
//add dark mode support?

import './App.css'
import { useState, useEffect } from 'react';
import { Card } from './Card/Card'

function App() {
  const cardCount = 24;
  const [mons, setMons] = useState([]);
  const [cardFlips, setCardFlips] = useState(Array(cardCount).fill(false));
  const [matchedCards, setMatchedCards] = useState(Array(cardCount).fill(false));

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

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

  useEffect(() => {
    async function loadCards() {
      let totalMons = await getPokemonCount();
      const randomIds = new Set()

      while (randomIds.size < (cardCount / 2)) {
        let r = Math.floor(Math.random() * totalMons) + 1;
        randomIds.add(r);
      }

      const duplicatedIds = Array.from(randomIds).flatMap(id => [id, id]);
      const shuffledIds = shuffleArray(duplicatedIds);
      const promises = shuffledIds.map(id => getRandomPokemon(id));
      const monData = await Promise.all(promises);

      await Promise.all(monData.map(mon => preloadImage(mon.sprite)));

      monData.forEach(mon => mon.index = crypto.randomUUID());
      setMons(monData);
    }
    loadCards();
  }, []);

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
    return { name: unhyphenatedName, types: data.types.map(t => t.type.name), sprite: data.sprites.other["official-artwork"].front_default };
  }

  const cards =
    <div className="card-container">
      {mons.map((mon, index) => (
        <Card
          key={mon.index}
          mon={mon}
          style={{ animationDelay: `${index * 0.025}s` }}
          isFaceDown={!cardFlips[index]}
          onClick={() => {
            console.log(`Clicked card ${index}`);
            setCardFlips(prev => {
              const newFlips = [...prev];
              newFlips[index] = true;
              return newFlips;
            });
          }}
        />
      ))}
    </div>

  return (
    <>
      {cards}
    </>
  )
}

export default App
