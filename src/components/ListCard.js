import React from "react";

export default class ListCard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            text: this.props.keyNamePair.name,
            editActive: false,
        }

        this.myDiv = React.createRef();
    }
    
    componentDidMount = () => {
        this.myDiv.current.addEventListener('keydown', this.handleKey);
        this.myDiv.current.focus();
    }

    componentWillUnmount = () => {
        this.myDiv.current.removeEventListener('keydown', this.handleKey);
    }

    handleKey = (event) => {
        if (event.code === "KeyZ" && event.ctrlKey){
            this.props.doUndoCallback();
        }
        else if(event.code === "KeyY" && event.ctrlKey){
            this.props.doRedoCallback();
        }
        else{   
        }
    }

    handleClick = (event) => {
        if (event.detail === 1) {
            this.handleLoadList(event);
        }
        else if (event.detail === 2) {
            this.handleToggleEdit(event);
        }
    }
    handleLoadList = (event) => {
        let listKey = event.target.id;
        if (listKey.startsWith("list-card-text-")) {
            listKey = listKey.substring("list-card-text-".length);
        }
        this.props.tps.clearAllTransactions();
        this.props.loadListCallback(listKey);
    }
    handleDeleteList = (event) => {
        event.stopPropagation();
        this.props.deleteListCallback(this.props.keyNamePair.key);
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
        let key = this.props.keyNamePair.key;
        let textValue = this.state.text;
        console.log("ListCard handleBlur: " + textValue);
        this.props.renameListCallback(key, textValue);
        this.handleToggleEdit();
    }

    render() {
        const { keyNamePair, selected } = this.props;

        if (this.state.editActive) {
            return (
                <input
                    id={"list-" + keyNamePair.name}
                    className='list-card'
                    type='text'
                    onKeyDown={this.handleKeyPress}
                    onBlur={this.handleBlur}
                    onChange={this.handleUpdate}
                    defaultValue={keyNamePair.name}
                />)
        }
        else {

            let selectClass = "unselected-list-card";
            if (selected) {
                selectClass = "selected-list-card";
            }
            return (
                <div
                    ref={this.myDiv}
                    id={keyNamePair.key}
                    key={keyNamePair.key}
                    onClick={this.handleClick}
                    onKeyDown={this.handleKey}
                    className={'list-card ' + selectClass}>
                    <span
                        id={"list-card-text-" + keyNamePair.key}
                        key={keyNamePair.key}
                        className="list-card-text">
                        {keyNamePair.name}
                    </span>
                    <input
                        type="button"
                        id={"delete-list-" + keyNamePair.key}
                        className="list-card-button"
                        onClick={this.handleDeleteList}
                        value={"\u2715"} />
                </div>
            );
        }
    }
}