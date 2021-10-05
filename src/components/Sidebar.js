import React from "react";
import ListCard from "./ListCard";

export default class Sidebar extends React.Component {
    handleClick = () => {
        let button = document.getElementById("add-list-button")
        if (button.classList.contains("disabled")){
        }
        else{
            this.props.createNewListCallback();
        }
    }
    render() {
        const { heading,
                currentList,
                keyNamePairs,
                createNewListCallback, 
                deleteListCallback, 
                loadListCallback,
                clearTransactionsCallback,
                renameListCallback,tps,
                doUndoCallback,
                doRedoCallback, } = this.props;
        return (
            <div id="top5-sidebar">
                <div id="sidebar-heading">
                    <input 
                        type="button" 
                        id="add-list-button" 
                        onClick={this.handleClick}
                        className="top5-button" 
                        value="+" />
                    {heading}
                </div>
                <div id="sidebar-list">
                {
                    keyNamePairs.map((pair) => (
                        <ListCard
                            key={pair.key}
                            keyNamePair={pair}
                            selected={(currentList !== null) && (currentList.key === pair.key)}
                            deleteListCallback={deleteListCallback}
                            loadListCallback={loadListCallback}
                            renameListCallback={renameListCallback}
                            clearTransactionsCallback={clearTransactionsCallback}
                            doUndoCallback={doUndoCallback}
                            doRedoCallback={doRedoCallback}
                            tps={tps}
                        />
                    ))
                }
                </div>
            </div>
        );
    }
}