import './App.css'
import { Card } from './Card/Card'

function App() {
  let cardCount = 12;
  const mons = [];

  async function getCards(cardCount) {
    let totalMons = await getPokemonCount();

    const randomIds = new Set()

    //get cardCount number of random dex numbers
    while (randomIds.size < cardCount) {
      let r = Math.floor(Math.random() * totalMons) + 1;
      randomIds.add(r);

      if (mons.indexOf(r) === -1) {
        console.log("r: " + r);
        let mon = await getRandomPokemon(r);
        mons.push(mon);
      }
    }

    const promises = Array.from(randomIds).map(id => getRandomPokemon(id));
    const monData = await Promise.all(promises);

    return monData;
  }

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

  console.log(getCards(cardCount));

  return (
    <>
      <Card />
    </>
  )
}

export default App
