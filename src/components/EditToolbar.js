import React from "react";

export default class EditToolbar extends React.Component { 
    render() {
        const {closeListCallback, doRedoCallback, doUndoCallback} = this.props;

        return (
            <div id="edit-toolbar">
                <div 
                    id='undo-button' 
                    className="top5-button"
                    onClick={doUndoCallback}>
                        &#x21B6;
                    
                </div>
                <div
                    id='redo-button'
                    className="top5-button"
                    onClick={doRedoCallback}>
                        &#x21B7;
                </div>
                <div
                    id='close-button'
                    className="top5-button"
                    onClick={closeListCallback}>
                        &#x24E7;
                </div>
            </div>
        )
    }
}