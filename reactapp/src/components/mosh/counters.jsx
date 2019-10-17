import React, { Component } from 'react';
import Counter from './counter';

class Counters extends Component {
    state = { 
        counters: [
            { id: 1, value: 3, img: 'https://picsum.photos/40'},
            { id: 2, value: 1, img: 'https://picsum.photos/40'},
            { id: 3, value: 5, img: 'https://picsum.photos/40'},
            { id: 4, value: 0, img: 'https://picsum.photos/40'},
        ],
     }
    render() { 
        return (
            <div>
                { this.state.counters.map(counter => <Counter key={ counter.id } value={ counter.value } img={ counter.img } />) }
            </div>
        );
    }
}
 
export default Counters;