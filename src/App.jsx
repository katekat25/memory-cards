import './App.css'
import { useState, useEffect } from 'react'
import { Card } from './Card/Card'

function App() {
  const cardCount = 12;
  const [mons, setMons] = useState([]);

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
    return { name: data.name, types: data.types.map(t => t.type.name), sprite: data.sprites.front_default };
  }

  return (
    <>
      {mons.map((mon) => (
        <Card key={mon.index} mon={mon} />
      ))}
    </>
  )
}

export default App
