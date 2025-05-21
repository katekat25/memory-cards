import './Card.css'

function Card({ mon }) {
    // function getGradient() {
    //     if (mon.types.length > 1) {
    //         console.log(mon.types);
    //     }
    // }

    // getGradient();

    return <div className="Card">
        <img src={`${mon.sprite}`} />
        Test
    </div>
}

export { Card }