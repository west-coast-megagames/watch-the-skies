import React, { Component } from 'react';

class Counter extends Component {
    state = {
        count: 0,
        imgUrl: 'https://picsum.photos/40'
    };

    styles = {
        fontSize: 15,
        fontWeight: 'bold'
    }

    formatCount() {
        const { count } = this.state;
        return count === 0 ? "Zero" : count;
    };

    render() { 
        return (
            <React.Fragment>
                <img className="rounded-circle" src={ this.state.imgUrl } alt="Alt" />
                <span style={ this.styles } className="badge badge-primary m-2">{ this.formatCount() }</span>
                <button className=" btn btn-secondary btn-small">Increment</button>
            </React.Fragment>
        );
    }
}
 
export default Counter;