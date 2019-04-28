import * as firebase from 'firebase';
import 'firebase/auth';

const config = {
    apiKey: "AIzaSyCW-o6RlUxUwl27MDGLX9DoJStq6dzUhyc",
    authDomain: "tatabox-9c354.firebaseapp.com",
    databaseURL: "https://tatabox-9c354.firebaseio.com",
    projectId: "tatabox-9c354",
    storageBucket: "tatabox-9c354.appspot.com",
    messagingSenderId: "666619023503"
};

class Firebase{
    constructor() {
        firebase.initializeApp(config);
        this.auth = firebase.auth;
    }

    // **** AUTH API ****
    createUser = (id, password) => {
        this.auth.createUserWithEmailAndPassword(id,password).catch(function(error){
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log("error Code : "+errorCode+", msg : "+errorMessage);
        })
    }

    signIn = (id,password) => {
        this.auth.signInWithEmailAndPassword(id,password).catch(function(error){
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log("error Code : "+errorCode+", msg : "+errorMessage);
        })
    }

    signOut = () => this.auth.signOut();

}


export default Firebase;