export default class DBManager {
    // QUERY AND MUTATION FUNCTIONS GET/SET DATA FROM/TO
    // AN EXTERNAL SOURCE, WHICH FOR THIS APPLICATION
    // MEANS THE BROWSER'S LOCAL STORAGE
    queryGetSessionData = () => {
        let sessionDataString = localStorage.getItem("top5-data");
        return JSON.parse(sessionDataString);
    }

    queryIsList = (key) => {
        let list = localStorage.getItem("top5-list-" + key);
        return list != null;
    }

    /**
     * This query asks local storage for a list with a particular key,
     * which is then returned by this function.
     */
    queryGetList = (key) => {
        let listString = localStorage.getItem("top5-list-" + key);
        return JSON.parse(listString);
    }
    mutationSortList = (lists) => {
        lists.sort((keyPair1, keyPair2) => {
            // GET THE LISTS
            return keyPair1.name.localeCompare(keyPair2.name);
        });
        for (let i=0; i<lists.length; i++){
            lists[i].key= i;
        }
    }

    mutationCreateList = (list) => {
        this.mutationUpdateList(list);
    }

    mutationDeleteList = (list) => {
        let listString = JSON.stringify(list);
        localStorage.removeItem("top5-list-" + list.key, listString);
    }

    mutationUpdateList = (list) => {
        // AND FLOW THOSE CHANGES TO LOCAL STORAGE
        let listString = JSON.stringify(list);
        localStorage.setItem("top5-list-" + list.key, listString);
    }
    
    mutationUpdateSessionData = (sessionData) => {
        let sessionDataString = JSON.stringify(sessionData);
        localStorage.setItem("top5-data", sessionDataString);
    }
}