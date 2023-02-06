// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";



// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB6MPkwmFCZQlWcXbDy5zYECJCZV6429dc",
    authDomain: "todo-list-juan.firebaseapp.com",
    projectId: "todo-list-juan",
    storageBucket: "todo-list-juan.appspot.com",
    messagingSenderId: "290993083560",
    appId: "1:290993083560:web:d908e94d5bb8d1478d1e9d"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const provider = new GoogleAuthProvider()
export const user = {}

//Funcion de login
export async function login() {
    try {
        await signInWithPopup(auth, provider).then((result) => {
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            // The signed-in user info.
            const user = result.user;
            // Quitamos el boton de login y mostramos el de logOut
            document.getElementById("img-logout").innerHTML = `<img class = "rounded-full mr-2" src="${user.photoURL}" width="17" />`
            document.getElementById("boton-login").classList.replace("flex", "hidden")
            document.getElementById("boton-logout").classList.replace("hidden", "flex")
            document.getElementById("img-logout2").innerHTML = `<img class = "rounded-full mr-2" src="${user.photoURL}" width="16" />`
            document.getElementById("boton-login2").classList.replace("flex", "hidden")
            document.getElementById("boton-logout2").classList.replace("hidden", "flex")
            return user
        }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.customData.email;
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);
            // ...
        });

    } catch (error) {
        throw new Error(error)
    }
}
//Funcion de logout
export function logOut() {

    signOut(auth).then(() => {
        console.log("LogOut succesful")
        //Quitamos el usuario.
        document.getElementById("user").innerHTML = ""
        // Quitamos el boton de logout y mostramos el de login.
        document.getElementById("boton-logout").classList.replace("flex", "hidden")
        document.getElementById("boton-login").classList.replace("hidden", "flex")
        document.getElementById("boton-logout2").classList.replace("flex", "hidden")
        document.getElementById("boton-login2").classList.replace("hidden", "flex")
        //Borramos las tasks del usuario.
        document.getElementById("allTask").innerHTML = ""
        const user = undefined
        return user
    }).catch((error) => {
        console.log(error)
    })

}

