import './Card.css'

function Card({ mon, onLoad }) {

    const typeColors = {
        normal: "A8A77A",
        fire: "EE8130",
        water: "6390F0",
        electric: "F7D02C",
        grass: "7AC74C",
        ice: "96D9D6",
        fighting: "C22E28",
        poison: "A33EA1",
        ground: "E2BF65",
        flying: "A98FF3",
        psychic: "F95587",
        bug: "A6B91A",
        rock: "B6A136",
        ghost: "735797",
        dragon: "6F35FC",
        dark: "705746",
        steel: "B7B7CE",
        fairy: "D685AD"
    };

    function getBackgroundStyle() {
        if (mon.types.length > 1) {
            const type1 = mon.types[0];
            const type2 = mon.types[1];
            const hex1 = typeColors[type1];
            const hex2 = typeColors[type2];
            return {
                background: `linear-gradient(#${hex1}, #${hex2})`
            };
        } else return { backgroundColor: `#${typeColors[mon.types[0]]}` };
    }

    return <div className="Card" style={getBackgroundStyle()}>
        <img
            src={mon.sprite}
            alt={mon.name}
            onLoad={onLoad}
        />
        <p>{mon.name.toUpperCase()}</p>
    </div>
}

export { Card }