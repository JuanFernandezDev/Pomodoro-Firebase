
import {
    getFirestore,
    getDocs,
    collection,
    doc,
    deleteDoc,
    setDoc,
    updateDoc,
    deleteField,
} from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js"


let todos = []

export const db = getFirestore();

let currentUser


export async function getTareas(user) {
    todos = []
    currentUser = user
    let coleccion = "Tareas-" + user.uid
    const doc = await getDocs(collection(db, coleccion))
    doc.forEach(tareaAu => {

        todos.push({
            id: tareaAu.id,
            titulo: tareaAu.data().titulo,
            textArea: tareaAu.data().textArea,
            completado: tareaAu.data().completado,
            user: user.uid,
            uname: user.displayName,
            contPo: tareaAu.data().contPo,
            estPo: tareaAu.data().estPo,
        });

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


export async function actualizarTarea(tareaId, tarea) {
    const tareaRef = doc(db, `Tareas-${currentUser.uid}`, tareaId);
    await updateDoc(tareaRef, tarea);
}

export async function eliminarCampo(tareaId, tarea) {
    const tareaRef = doc(db, `Tareas-${currentUser.uid}`, tareaId);
    await updateDoc(tareaRef, {
        textArea: deleteField()
    });
}

export async function actualizarCheck(tareaId, tarea) {
    const tareaRef = doc(db, `Tareas-${currentUser.uid}`, tareaId);
    await updateDoc(tareaRef, {
        completado: tarea.completado
    });
    console.log(tarea.completado)
}

export async function actualizarContPo(tareaId, tarea) {
    console.log("Entro")
    const tareaRef = doc(db, `Tareas-${currentUser.uid}`, tareaId);
    await updateDoc(tareaRef, {
        contPo: tarea.contPo
    });
    console.log(tarea.contPo)
}