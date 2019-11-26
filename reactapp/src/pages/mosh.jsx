import React, { Component } from 'react';
import Counters from './../components/mosh/counters';
import NavBar from '../components/mosh/moshNav';


class MoshTest extends Component {
    state = { 
        counters: [
            { id: 1, value: 3, img: 'https://picsum.photos/40'},
            { id: 2, value: 1, img: 'https://picsum.photos/40'},
            { id: 3, value: 5, img: 'https://picsum.photos/40'},
            { id: 4, value: 0, img: 'https://picsum.photos/40'},
        ],
     }

     handleIncrement = counter => {
         const counters = [...this.state.counters];
         const index = counters.indexOf(counter);
         counters[index] = { ...counter };
         counters[index].value++;
         this.setState({ counters });
     }

     handleDecrement = counter => {
        const counters = [...this.state.counters];
        const index = counters.indexOf(counter);
        counters[index] = { ...counter };
        counters[index].value--;
        this.setState({ counters });
    }

     handleReset = () => {
         const counters = this.state.counters.map(c => {
             c.value = 0;
             return c;
         });
         this.setState({ counters });
     };

     handleDelete = (counterId) => {
         console.log('Deleted', counterId);
         const counters = this.state.counters.filter(c => c.id !== counterId);
         this.setState({ counters });
     };

    render() {
        return (
            <React.Fragment>
                <h1>Mosh Testing</h1>
                <NavBar 
                    totalCounters={this.state.counters.filter(c => c.value > 0).length}
                />
                <Counters 
                    onReset={this.handleReset}
                    onDelete={this.handleDelete}
                    onIncrement={this.handleIncrement}
                    onDecrement={this.handleDecrement}
                    counters={this.state.counters}
                />
                <hr />
            </React.Fragment>
        );
    }
}

export default MoshTest;