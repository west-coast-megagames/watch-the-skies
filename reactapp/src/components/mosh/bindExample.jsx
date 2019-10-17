import React, { Component } from 'react';

class Counter extends Component {
    state = {
        count: 0,
        imgUrl: 'https://picsum.photos/40',
        tags: ['tag1', 'tag2', 'tag3']
    };

    constructor() {
        super();
        this.handleIncrement = this.handleIncrement.bind(this);
    }

    render() {
        return (
            <React.Fragment>
                <img className="rounded-circle" src={ this.state.imgUrl } alt="Alt" />
                <span className={ this.getBadgeClasses() }>{ this.formatCount() }</span>
                <button onClick={ this.handleIncrement } className=" btn btn-secondary btn-small">Increment</button>
                <ul>
                    { this.state.tags.map(tag => <li key={ tag }>{ tag }</li>) }
                </ul>
            </React.Fragment>
        );
    }

    handleIncrement() {
        this.setState({ count: this.state.count + 1 });
    }

    getBadgeClasses() {
        let classes = "badge m-2 badge-";
        classes += (this.state.count === 0) ? "warning" : "primary";
        return classes;
    };

    formatCount() {
        const { count } = this.state;
        return count === 0 ? "Zero" : count;
    };
}
 
export default Counter;