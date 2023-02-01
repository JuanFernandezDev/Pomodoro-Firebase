
import {
    getFirestore,
    getDocs,
    collection,
    doc,
    deleteDoc,
    setDoc,
    updateDoc,
} from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js"


let todos = []

export const db = getFirestore();

let currentUser


export async function getTareas(user) {
    todos = []
    currentUser = user
    let ide = 1
    let coleccion = "Tareas-" + user.uid
    const doc = await getDocs(collection(db, coleccion))
    doc.forEach(tareaAu => {

        todos.push({
            id: tareaAu.id,
            titulo: tareaAu.data().titulo,
            textArea: tareaAu.data().textArea,
            completado: tareaAu.data().completado,
            iden: ide,
            user: user.uid,
            uname: user.displayName,
        });
        ide++
    });

    return todos
}


export async function newTarea(tarea) {
    // Add a new document with a generated id
    let colecion = "Tareas-" + currentUser.uid
    const tareaRef = doc(collection(db, colecion));
    await setDoc(tareaRef, tarea).then((result) => {
        console.log("Succesful la subida")
    }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
    });
}

export async function deleteTarea(tareaId) {
    let coleccion = "Tareas-" + currentUser.uid
    await deleteDoc(doc(db, coleccion, tareaId));
}