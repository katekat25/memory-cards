//todos:
//can we just make this a fucking normal memory game please? ~we have the technology~
//make modal slide in that explains rules

//to make it normal memory:
//get half the number of pokemon as there are cardCount, then duplicate each pokemon
//shuffle all the pokemon randomly
//start them all face down
//cards store a flipped status
//track score in App
//when a pair is matched, remove the cards from the game but keep a space where they were
//add reset game button, etc

//add japanese support!
//add dark mode support?

import './App.css'
import { useState, useEffect } from 'react'
import { Card } from './Card/Card'

function App() {
  const cardCount = 12;
  const [mons, setMons] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    async function loadCards() {
      let totalMons = await getPokemonCount();
      const randomIds = new Set()

      while (randomIds.size < cardCount) {
        let r = Math.floor(Math.random() * totalMons) + 1;
        randomIds.add(r);
      }

      const promises = Array.from(randomIds).map(id => getRandomPokemon(id));
      const monData = await Promise.all(promises);

      monData.forEach(mon => mon.index = crypto.randomUUID());

      setMons(monData);
    }
    loadCards();
  }, []);

  useEffect(() => {
    if (loadedCount === cardCount) {
      setLoaded(true);
    }
  }, [loadedCount]);

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
    return { name: unhyphenatedName, types: data.types.map(t => t.type.name), sprite: data.sprites.front_default };
  }

  const cards =
    <div className="card-container">
      {mons.map((mon) => (
        <Card
          key={mon.index}
          mon={mon}
          onLoad={() => { setLoadedCount(prev => prev + 1); }}
        />
      ))}
    </div>

  return (
    <>
      <div style={{ display: loaded ? 'block' : 'none' }}>
        {cards}
      </div>
    </>
  )
}

export default App
