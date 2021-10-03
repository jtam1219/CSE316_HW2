import React from "react";

export default class ItemCard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            text: this.props.name,
            editActive: false,
        }
    }
    handleClick = (event) => {
        this.handleToggleEdit(event);
    }

    handleToggleEdit = (event) => {
        this.setState({
            editActive: !this.state.editActive
        });
    }
    handleUpdate = (event) => {
        this.setState({ text: event.target.value });
    }
    handleKeyPress = (event) => {
        if (event.code === "Enter") {
            this.handleBlur();
        }
    }
    handleBlur = () => {
        let id = this.props.id;
        let textValue = this.state.text;
        console.log("Item handleBlur: " + textValue);
        this.props.renameItemCallback(id, textValue);
        this.handleToggleEdit();
    }

    render() {
        const {id, name} = this.props;

        if (this.state.editActive) {
            return (
                <input
                    id={"item-" + id}
                    className='top5-item'
                    type='text'
                    onKeyPress={this.handleKeyPress}
                    onBlur={this.handleBlur}
                    onChange={this.handleUpdate}
                    defaultValue={name}
                />)
        }
        else {
            return (
                <div
                    id={"item-"+id}
                    onDoubleClick={this.handleClick}
                    className='top5-item'>
                    {name}
                </div>
            );
        }
    }
}