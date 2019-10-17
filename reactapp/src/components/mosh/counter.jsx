import React, { Component } from 'react';

class Counter extends Component {
    state = {
        value: this.props.value,
        imgUrl: this.props.img
    };

    render() {
        return (
            <div>
                <img className="rounded-circle" src={ this.state.imgUrl } alt="Alt" />
                <span className={ this.getBadgeClasses() }>{ this.formatCount() }</span>
                <button onClick={ this.handleIncrement } className=" btn btn-secondary btn-small">Increment</button>
            </div>
        );
    }

    handleIncrement = () => {
        this.setState({ value: this.state.value + 1 });
    }

    getBadgeClasses() {
        let classes = "badge m-2 badge-";
        classes += (this.state.value === 0) ? "warning" : "primary";
        return classes;
    };

    formatCount() {
        const { value: count } = this.state;
        return count === 0 ? "Zero" : count;
    };
}
 
export default Counter;