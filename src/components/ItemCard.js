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
        let listid = this.props.listid;
        let textValue = this.state.text;
        console.log("Item handleBlur: " + textValue);
        this.props.renameItemCallback(id, listid, textValue);
        this.handleToggleEdit();
    }

    //FIX DRAG AND DROP, MAKE IT SO THAT IT CAN PROPERLY DROP!!!!
    allowDrop = (event) => {
        event.preventDefault();
        if (event.target.draggable){
            event.target.style.background = "#669966";
        }
      }
      
    drag = (event) => {
        event.dataTransfer.setData("text", event.target.id);
        event.dataTransfer.setData("id", event.target.id);
      }
      
    drop = (event) => {
        event.preventDefault();
        let oldId = event.dataTransfer.getData("id");
        event.target.style.background = "";
        this.props.moveItemCallback(this.props.listid, oldId, event.target.id);
    }

    leave = (event) => {
        event.preventDefault();
        event.target.style.background = "";
    }

    render() {
        const {id, listid, name} = this.props;

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
                    listid= {listid}
                    draggable={true}
                    onDoubleClick={this.handleClick}
                    onDrop={this.drop}
                    onDragOver={this.allowDrop}
                    onDragLeave={this.leave}
                    onDragStart={this.drag}
                    className='top5-item'>
                    {name}
                </div>
            );
        }
    }
}