import React from 'react';
import './App.css';

// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import DBManager from './db/DBManager';

// THESE ARE OUR REACT COMPONENTS
import DeleteModal from './components/DeleteModal';
import Banner from './components/Banner.js'
import Sidebar from './components/Sidebar.js'
import Workspace from './components/Workspace.js';
import Statusbar from './components/Statusbar.js'

import jsTPS from './common/jsTPS.js'
import MoveItem_Transaction from './transactions/MoveItem_Transaction.js';
import RenameItem_Transaction from "./transactions/RenameItem_Transaction.js"

class App extends React.Component {
    constructor(props) {
        super(props);

        // THIS WILL TALK TO LOCAL STORAGE
        this.db = new DBManager();

        // GET THE SESSION DATA FROM OUR DATA MANAGER
        let loadedSessionData = this.db.queryGetSessionData();

        // SETUP THE INITIAL STATE
        this.state = {
            currentList : null,
            sessionData : loadedSessionData
        }

        this.tps= new jsTPS();
    }
    sortKeyNamePairsByName = (keyNamePairs) => {
        keyNamePairs.sort((keyPair1, keyPair2) => {
            // GET THE LISTS
            return keyPair1.name.localeCompare(keyPair2.name);
        });
        for (let i=0; i<keyNamePairs.length; i++){
            keyNamePairs[i].key= i;
        }
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CREATING A NEW LIST
    createNewList = () => {
        this.tps.clearAllTransactions();
        // FIRST FIGURE OUT WHAT THE NEW LIST'S KEY AND NAME WILL BE
        let newKey = this.state.sessionData.nextKey;
        let newName = "Untitled" + newKey;

        // MAKE THE NEW LIST
        let newList = {
            key: newKey,
            name: newName,
            items: ["?", "?", "?", "?", "?"]
        };

        // MAKE THE KEY,NAME OBJECT SO WE CAN KEEP IT IN OUR
        // SESSION DATA SO IT WILL BE IN OUR LIST OF LISTS
        let newKeyNamePair = { "key": newKey, "name": newName };
        let updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
        this.sortKeyNamePairsByName(updatedPairs);

        // CHANGE THE APP STATE SO THAT IT THE CURRENT LIST IS
        // THIS NEW LIST AND UPDATE THE SESSION DATA SO THAT THE
        // NEXT LIST CAN BE MADE AS WELL. NOTE, THIS setState WILL
        // FORCE A CALL TO render, BUT THIS UPDATE IS ASYNCHRONOUS,
        // SO ANY AFTER EFFECTS THAT NEED TO USE THIS UPDATED STATE
        // SHOULD BE DONE VIA ITS CALLBACK
        this.setState(prevState => ({
            currentList: newList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey + 1,
                counter: prevState.sessionData.counter + 1,
                keyNamePairs: updatedPairs
            }
        }), () => {
            // PUTTING THIS NEW LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationCreateList(newList);
            let list=this.db.queryGetList(newList.key);
            let tempStorage=[];
            let newKey;
            for (let i=0; i<updatedPairs.length; i++){
                let j=0;
                let tempList=this.db.queryGetList(j);
                while (updatedPairs[i].name !== tempList.name){
                    tempList=this.db.queryGetList(j);    
                    j++;
                }
                if(updatedPairs[i].name === list.name){
                    newKey=i;
                }
                tempList.key = updatedPairs[i].key;
                tempStorage[i]=tempList; 
            }

            for (let i=0; i<tempStorage.length; i++){
                let list=tempStorage[i];
                this.db.mutationUpdateList(list);
            }
            this.db.mutationUpdateSessionData(this.state.sessionData);
            this.loadList(tempStorage[newKey].key);
            console.log(this.tps.transactions);
        });
    }
    renameList = (key, newName) => {
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME
        for (let i = 0; i < newKeyNamePairs.length; i++) {
            let pair = newKeyNamePairs[i];
            if (pair.key === key) {
                pair.name = newName;
            }
        }
        this.sortKeyNamePairsByName(newKeyNamePairs);

        // WE MAY HAVE TO RENAME THE currentList
        let currentList = this.state.currentList;
        if (currentList.key === key) {
            currentList.name = newName;
        }

        this.setState(prevState => ({
            currentList: prevState.currentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            let list = this.db.queryGetList(key);
            list.name = newName;
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
            let tempStorage=[];
            let newKey;
            for (let i=0; i<newKeyNamePairs.length; i++){
                let j=0;
                let tempList=this.db.queryGetList(j);
                while (newKeyNamePairs[i].name !== tempList.name){
                    tempList=this.db.queryGetList(j);    
                    j++;
                }
                if(newKeyNamePairs[i].name === list.name){
                    newKey=i;
                }
                tempList.key = newKeyNamePairs[i].key;
                tempStorage[i]=tempList; 
            }

            for (let i=0; i<tempStorage.length; i++){
                let list=tempStorage[i];
                this.db.mutationUpdateList(list);
            }
            this.db.mutationUpdateSessionData(this.state.sessionData);
            this.loadList(tempStorage[newKey].key);
        });
    }
    renameItem = (id, listid, newName) => {
        let items = this.state.currentList.items;
        // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME
        for (let i = 0; i < items.length; i++) {
            if (i === id) {
                items[i] = newName;
            }
        }
        this.setState(prevState => ({
            currentList: prevState.currentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs:  [...this.state.sessionData.keyNamePairs]
            }
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            let list = this.db.queryGetList(listid); //get the list based on the id for the item
            list.items[id]=newName;
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF LOADING A LIST FOR EDITING
    loadList = (key) => {
        this.updateToolbarButtons();
        this.enableButton("close-button");
        let newCurrentList = this.db.queryGetList(key);
        this.setState(prevState => ({
            currentList: newCurrentList,
            sessionData: prevState.sessionData
        }), () => {
            // ANY AFTER EFFECTS?
            console.log(this.tps.transactions);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CLOSING THE CURRENT LIST
    closeCurrentList = () => {
        this.setState(prevState => ({
            currentList: null,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            sessionData: this.state.sessionData
        }), () => {
            // ANY AFTER EFFECTS?
            this.disableButton("close-button");
            this.tps.clearAllTransactions();
            this.updateToolbarButtons();
        });
    }
    deleteList = (key) => {
        // SOMEHOW YOU ARE GOING TO HAVE TO FIGURE OUT
        // WHICH LIST IT IS THAT THE USER WANTS TO
        // DELETE AND MAKE THAT CONNECTION SO THAT THE
        // NAME PROPERLY DISPLAYS INSIDE THE MODAL
        this.showDeleteListModal(key);
    }

    //EXECUTES THE FUNCTION TO REMOVE LIST FROM LOCAL STORAGE
    //NEEDS FIXING, THE UNTITLED WOULD BUG OUT AND GIVE SAME NUMBER ,COUNTER ALSO GOES BELOW 0 FOR SOME REASON...
    doDeleteList = (key) => {
        //FIGURE OUT HOW TO PHYSICALLY REMOVE THE LIST FROM THE LOCAL STORAGE
        let updatedPairs = [...this.state.sessionData.keyNamePairs];
        updatedPairs.splice(key, 1);
        let list = this.db.queryGetList(key);
        this.db.mutationDeleteList(list);
        for (let i=0; i<updatedPairs.length; i++){
            if ((updatedPairs[i].key)>key){
                let updatingList= this.db.queryGetList(updatedPairs[i].key);
                let oldList = this.db.queryGetList(updatedPairs[i].key);
                updatingList.key = String(updatingList.key - 1);
                updatedPairs[i].key = String(updatedPairs[i].key -1);
                this.db.mutationUpdateList(updatingList);
                this.db.mutationDeleteList(oldList);
            }
        }

        this.sortKeyNamePairsByName(updatedPairs);

        this.setState(prevState => ({
            sessionData: {
                nextKey: prevState.sessionData.nextKey - 1,
                counter: prevState.sessionData.counter - 1,
                keyNamePairs: updatedPairs
            }
        }), () => {
            // AFTER EFFECT
            this.db.mutationUpdateSessionData(this.state.sessionData);
            this.closeCurrentList();
            this.hideDeleteListModal();
            this.tps.clearAllTransactions();
        });
        
    }
    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE LIST
    showDeleteListModal(key) {
        let modal = document.getElementById("delete-modal");
        let newCurrentList = this.db.queryGetList(key);
        this.setState(prevState => ({
            currentList: newCurrentList,
            sessionData: prevState.sessionData
        }), () => {
            // ANY AFTER EFFECTS?
        });
        modal.classList.add("is-visible");
    }
    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideDeleteListModal() {
        let modal = document.getElementById("delete-modal");
        modal.classList.remove("is-visible");
    }
    addRenameItemTransaction = (listid, id, newText) => {
        // GET THE CURRENT TEXT
        let list = this.db.queryGetList(listid);
        let oldText = list.items[id];
        let transaction = new RenameItem_Transaction(this, listid, id, oldText, newText);
        this.tps.addTransaction(transaction);
        this.updateToolbarButtons();
    }

    addMoveItemTransaction = (listid, oldIndex, newIndex) => {
        //GET THE CURRENT TEXT
        oldIndex = oldIndex[5];
        newIndex = newIndex[5];
        //oldIndex--;
        //newIndex--;
        let transaction = new MoveItem_Transaction(this, listid, oldIndex, newIndex);
        this.tps.addTransaction(transaction);
        this.updateToolbarButtons();
        console.log(this.tps.transactions);
    }

    moveItem = (listid, oldId, newId) => {
        let list=this.db.queryGetList(listid);
        list.items.splice(newId,  0, list.items.splice(oldId, 1)[0]);
        this.db.mutationUpdateList(list);
        this.loadList(listid);
    }

    // SIMPLE UNDO/REDO FUNCTIONS
    undo = () => {
        if (this.tps.hasTransactionToUndo()) {
            this.tps.undoTransaction();
            this.updateToolbarButtons();
        }
    }

    redo = () => {
        if (this.tps.hasTransactionToRedo()) {
            this.tps.doTransaction();
            this.updateToolbarButtons();
        }
    }
 
    disableButton(id) {
        let button = document.getElementById(id);
        button.classList.add("disabled");
    }

    enableButton(id) {
        let button = document.getElementById(id);
        button.classList.remove("disabled");
    }

    updateToolbarButtons = () => {
        let tps = this.tps;
        if (!tps.hasTransactionToUndo()) {
            this.disableButton("undo-button");
        }
        else {
            this.enableButton("undo-button");
        }   
        if (!tps.hasTransactionToRedo()) {
            this.disableButton("redo-button");
        }
        else {
            this.enableButton("redo-button");
        }   
        
    }
    
    componentDidMount = () => {
        window.addEventListener('keydown', this.handleKey);
    }

    componentWillUnmount = () => {
        window.removeEventListener('keydown', this.handleKey);
    }

    handleKey = (event) => {
        if (event.ctrlKey && event.code === "KeyZ"){
            this.undo();
        }
        else if(event.ctrlKey && event.code === "KeyY"){
            this.redo();
        }
        else{   
        }
    }

    render() {
        return (
            <div id="app-root" ref={this.myDiv}
                    onKeyDown={this.handleKey}>
                <Banner 
                    title='Top 5 Lister'
                    closeCallback={this.closeCurrentList}
                    doUndoCallback={this.undo}
                    doRedoCallback={this.redo} />
                <Sidebar
                    heading='Your Lists'
                    currentList={this.state.currentList}
                    keyNamePairs={this.state.sessionData.keyNamePairs}
                    createNewListCallback={this.createNewList}
                    deleteListCallback={this.deleteList}
                    loadListCallback={this.loadList}
                    renameListCallback={this.renameList}
                    clearTransactionsCallback={this.tps.clearAllTransactions}
                    doUndoCallback={this.undo}
                    doRedoCallback={this.redo} 
                    tps={this.tps}
                />
                <Workspace
                    currentList={this.state.currentList}
                    moveItemCallback={this.addMoveItemTransaction}
                    renameItemCallback={this.addRenameItemTransaction}
                    disableButtonCallback={this.disableButton}
                    enableButtonCallback={this.enableButton} />
                <Statusbar 
                    currentList={this.state.currentList} />
                <DeleteModal
                    listKeyPair={this.state.currentList}
                    doDeleteListCallback={this.doDeleteList}
                    hideDeleteListModalCallback={this.hideDeleteListModal}
                />
            </div>
        );
    }
}

export default App;
