import React from "react";
import EditToolbar from "./EditToolbar";

export default class Banner extends React.Component {
    render() {
        const {title,
               closeCallback,
               doUndoCallback, doRedoCallback} = this.props;
        return (
            <div id="top5-banner">
                {title}
                <EditToolbar
                    closeListCallback={closeCallback}
                    doUndoCallback={doUndoCallback}
                    doRedoCallback={doRedoCallback} />
            </div>
        );
    }
}