import jsTPS_Transaction from "../common/jsTPS.js";

/**
 * ChangeItem_Transaction
 * 
 * This class represents a transaction that updates the text
 * for a given item. It will be managed by the transaction stack.
 * 
 * @author McKilla Gorilla
 * @author ?
 */
export default class RenameItem_Transaction extends jsTPS_Transaction {
    constructor(initApp, listid, initId, initOldText, initNewText) {
        super();
        this.app= initApp;
        this.id = initId;
        this.listid= listid;
        this.oldText = initOldText;
        this.newText = initNewText;
    }

    doTransaction() {
        this.app.renameItem(this.id, this.listid, this.newText);
    }
    
    undoTransaction() {
        this.app.renameItem(this.id, this.listid, this.oldText);
    }
}