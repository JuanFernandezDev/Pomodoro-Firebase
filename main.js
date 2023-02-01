let ids = []
let selected = 0
let i = 1

import { getUUID } from "./utils.js";
import { login, logOut, auth, user } from "./auth.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";
import { getTareas, newTarea, deleteTarea } from "./firestore.js";


let currentUser = ""

//Comprueba el estado del usuario cada vez que se refresca la pagina.
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user
        console.log("Usuario logueado", currentUser.displayName)
        init()
        pintarDatos()
    } else {
        console.log("No hay usuario logueado")
    }
})


//Inicializamos si ya esta logueado
function init() {
    document.getElementById("boton-login").classList.replace("flex", "hidden")
    document.getElementById("boton-logout").classList.replace("hidden", "flex")
    document.getElementById("img-logout").innerHTML = `<img class = "rounded-full mr-2" src="${currentUser.photoURL}" width="24" />`
    document.getElementById("img-logout2").innerHTML = `<img class = "rounded-full mr-2" src="Img/profile-user.png" width="16" />`
    document.getElementById("boton-login2").classList.replace("flex", "hidden")
    document.getElementById("boton-logout2").classList.replace("hidden", "flex")
    /* document.getElementById("user").innerHTML = 
    `
        <img class = "rounded-full" src="${currentUser.photoURL}" width="24" />
        <span class = "ml-2 text-white">${currentUser.displayName}</span>
    ` */
}


let todos = []

//LLama a la funcion getTareas de firestore.js para imprimir las task del user
function pintarDatos() {
    ids = []
    document.getElementById("allTask").innerHTML = ""
    getTareas(currentUser).then(data => {
        data.forEach((tarea) => {
            crearTask(tarea)
            if (tarea.completado == true) {
                checkTask2(tarea.id)
            }
        })
    }).catch(err => {
        console.log("Error en pintar datos" + err)
    })

}


//document.getElementById("aumentarEst").addEventListener("click", aumentarEst)
document.getElementById("addTask").addEventListener("click", añadirTarea)
document.getElementById("saveEdit").addEventListener("click", saveEdit)
document.getElementById("cancelEdit").addEventListener("click", cancelEdit)
document.getElementById("deleteTask").addEventListener("click", deleteTask)
document.getElementById("cancelTask").addEventListener("click", cancelTask)
document.getElementById("cancelTask").addEventListener("click", cancelTask)
document.getElementById("crearTask").addEventListener("click", añadirTask)
document.getElementById("botonAddEditar").addEventListener("click", añadirTextAreaEditar)
document.getElementById("botonAdd").addEventListener("click", añadirTextArea)
document.getElementById("boton-login").addEventListener("click", login)
document.getElementById("boton-login2").addEventListener("click", login)
document.getElementById("boton-logout").addEventListener("click", logOut)
document.getElementById("boton-logout2").addEventListener("click", logOut)
//document.getElementById("actualizarEdit").addEventListener("click", logOut)



//Funcion para añadir los eventListener en los task, que esta se ejecuta cuando se crea una task.
function añadirEventsListeners(tareaid) {
    let editId = "editTask-" + tareaid
    let selectId = "marco-" + tareaid
    let checkId = "checkTask-" + tareaid
    // los onclick tienen "event" que no devuelve el objeto html entero para que podamos acceder a cualquier dato del mismo
    document.getElementById(editId).addEventListener("click", editTask, false);
    document.getElementById(selectId).addEventListener("click", select, false);
    document.getElementById(checkId).addEventListener("click", checkTask, false);
}

//Crea la tarea con sus datos y llama a pintarDatos(), comprueba si los valores estan vacios, para rellenarlos o no.
function añadirTask() {

    let taskAux
    let tarea = {}
    if (document.getElementById("realTask").value != "") {
        taskAux = document.getElementById("realTask").value
        console.log(taskAux)
        tarea.titulo = taskAux

    }
    /*let setAux
    if (document.getElementById("numeroEst").value != "") {
        setAux = document.getElementById("numeroEst").value
        tarea.sets = setAux
    }*/
    let areaAux
    if (document.getElementById("textArea").value != "") {
        areaAux = document.getElementById("textArea").value
        tarea.textArea = areaAux
    }
    tarea.completado = false
    tarea.id = getUUID()
    if (currentUser != "") {
        tarea.uid = currentUser.uid
        tarea.uname = currentUser.displayName
    }
    ids = []
    if (currentUser != "") {
        newTarea(tarea)
        // Reset del input
        document.getElementById("allTask").innerHTML = ""

        pintarDatos(); // para actualizar la vista
    } else {
        crearTask(tarea)
    }

}


//Añade el cuadro del text area en el formulario, para poder rellenar el text complementario de la task 
function añadirTextAreaEditar(event) {
    document.getElementById(event.target.id).setAttribute('class', 'hidden')
    document.getElementById("textAreaEditar").className = "mt-3.5 bg-[#EFEFEF] border-none rounded-md"

}// onclick="añadirTextArea(textArea, botonAdd)"

function añadirTextArea(event) {
    document.getElementById(event.target.id).classList.replace("block", "hidden")
    document.getElementById("textArea").classList.replace("hidden", "block")

}

function añadirTarea() {
    document.getElementById("saveEdit").classList.replace("hidden", "block")
    document.getElementById("actualizarEdit").classList.replace("block", "hidden")
    document.getElementById("addTask").classList.replace("block", "hidden")
    document.getElementById("generarTask").className = "w-full text-[#555555] mt-10"
}

function resetTask() {
    document.getElementById("realTask").value = ""
    document.getElementById("numeroEst").value = 1
    document.getElementById("textArea").value = ""
}

function cancelTask() {
    resetTask()
    document.getElementById("textArea").classList.replace("block", "hidden")
    document.getElementById("botonAdd").classList.replace("hidden", "block")
    document.getElementById("generarTask").setAttribute('class', 'hidden')
    document.getElementById("addTask").className = "flex text-white items-center justify-center font-semibold rounded-md border border-dashed w-full mt-5 py-4 opacity-60 backdrop-opacity-10 bg-black/20 hover:opacity-70"
}


//Marca la task como completada pero se llama desde el html 
function checkTask(event) {
    let tareaid = event.target.dataset.tareaid
    let checkTaskAux = `checkTask-${tareaid}`
    let taskAux = `taskh1-${tareaid}`
    document.getElementById(checkTaskAux).removeEventListener("click", checkTask)
    document.getElementById(checkTaskAux).addEventListener("click", unCheckTask)
    document.getElementById(taskAux).className = "flex line-through opacity-40 text-[#555555] font-bold text-lg ml-3"
    document.getElementById(checkTaskAux).className = "w-8 h-8 bg-[#BA4949] rounded-full flex items-center justify-center hover:opacity-70"
}

//Marca la task como completada pero desde la funcion pintar datos
function checkTask2(tareaid) {
    let checkTaskAux = `checkTask-${tareaid}`
    let taskAux = `taskh1-${tareaid}`
    document.getElementById(checkTaskAux).removeEventListener("click", checkTask)
    document.getElementById(checkTaskAux).addEventListener("click", unCheckTask)
    document.getElementById(taskAux).className = "flex line-through opacity-40 text-[#555555] font-bold text-lg ml-3"
    document.getElementById(checkTaskAux).className = "w-8 h-8 bg-[#BA4949] rounded-full flex items-center justify-center hover:opacity-70"
}
//Desmarca la task como completada
function unCheckTask(event) {
    let tareaid = event.target.dataset.tareaid
    let checkTaskAux = `checkTask-${tareaid}`
    let taskAux = `taskh1-${tareaid}`
    document.getElementById(checkTaskAux).removeEventListener("click", unCheckTask)
    document.getElementById(checkTaskAux).addEventListener("click", checkTask)
    document.getElementById(taskAux).className = "flex text-[#555555] font-bold text-lg ml-3"
    document.getElementById(checkTaskAux).className = "w-8 h-8 bg-[#DFDFDF] rounded-full flex items-center justify-center hover:opacity-70"

}


//Funcion para crear las task a raiz del parametro tarea
function crearTask(tarea) {
    let taskAux = tarea.titulo
    let setAux
    let areaAux = ""
    let tareaid = tarea.id

    setAux = 1 //Esto habria que cambiarlo


    //Si no esta vacio lo rellena para que se muestre el campo
    if (tarea.textArea != undefined) {
        areaAux = tarea.textArea
    }

    if (taskAux != "") {
        let div = document.createElement("div")
        let text = "hidden"
        let borde = "border-l-8 border-transparent hover:border-gray-200"
        if (areaAux != "") {
            text = "block"
        }
        if (ids.length == 0) {
            borde = "border-l-8 border-black"
        }

        div.id = `${tareaid}`
        div.innerHTML = `
                <div
                class="bg-white  ${borde} rounded-md px-3 py-4 shadow-lg"
                id = "marco-${tareaid}"
                data-tareaid="${tareaid}"
            >
                <div class="flex justify-between" data-tareaid="${tareaid}">
                    <div class="flex items-center" id="task-${tareaid} data-tareaid="${tareaid}">
                        <div
                            class="w-8 h-8 bg-[#DFDFDF] rounded-full flex items-center justify-center hover:opacity-70"                 
                            id="checkTask-${tareaid}"
                            data-tareaid="${tareaid}"
                            >
                            <img class="w-6" data-tareaid="${tareaid}" src="Img/check-blanco.png" alt="" />
                        </div>
                        <h1 id="taskh1-${tareaid}" class="text-[#555555] font-bold text-lg ml-3" data-tareaid="${tareaid}">
                            ${taskAux}
                        </h1>
                    </div>

                    <div class="text-[#555555] flex items-center opacity-40" data-tareaid="${tareaid}">
                        <h1 class="text-sm tracking-widest font-bold data-tareaid="${tareaid}"">
                            <span class="text-lg" id="contPo-${tareaid} data-tareaid="${tareaid}"">0</span>/<span id="est-${tareaid}" >${setAux}</span>
                        </h1>

                        <div
                            class="w-8 h-8 border border-[#DFDFDF] ml-3 flex items-center justify-center rounded-md hover:bg-[#DFDFDF]"
                            id="editTask-${tareaid}" data-tareaid="${tareaid}"
                        >
                            <img
                            class="w-5"
                            data-tareaid="${tareaid}"
                            src="Img/boton-de-tres-morron.png"
                            alt=""
                            />
                        </div>
                    </div>
                </div> 
                <div
                class="rounded-md ml-8 mr-2 px-4 py-2 mt-4 bg-[#FCF8DE] shadow ${text}"
                id="textArea-${tareaid}" data-tareaid="${tareaid}"
                >
                <h1 data-tareaid="${tareaid}">${areaAux}</h1>
                </div>
            </div>`

        div.className = "mt-2"
        document.getElementById("allTask").appendChild(div)
        añadirEventsListeners(tareaid)

        if (ids.length == 0) {
            selected = tareaid;
        }

        ids.push(tareaid)

        cancelTask()


    }
}

//Saca el menu para editar la task y permite modificar los campos
function editTask(event) {
    let tareaid = event.target.dataset.tareaid
    document.getElementById("saveEdit").classList.replace("block", "hidden")
    document.getElementById("actualizarEdit").classList.replace("hidden", "block")
    document.getElementById("editarTask").className = "w-full text-[#555555] mt-10"
    document.getElementById("flag").innerHTML = tareaid
    document.getElementById(tareaid).className = "hidden"
    document.getElementById("taskEditar").value = document.getElementById(`taskh1-${tareaid}`).textContent.trim()
    //document.getElementById("actEditar").value = document.getElementById(`contPo-${num}`).textContent.trim()
    //document.getElementById("estEditar").value = document.getElementById(`est-${num}`).textContent.trim()

    if (document.getElementById(`textArea-${tareaid}`).textContent.trim() != "") {
        document.getElementById("textAreaEditar").className = "mt-3.5 bg-[#EFEFEF] border-none rounded-md"
        document.getElementById("botonAddEditar").setAttribute('class', 'hidden')
        document.getElementById("textAreaEditar").value = document.getElementById(`textArea-${tareaid}`).textContent.trim()
    }
}


//Funcion por manejar todavia
function saveEdit() {
    let tareaid = document.getElementById("flag").textContent.trim()
    document.getElementById("editarTask").className = "hidden"
    document.getElementById(tareaid).className = "mt-2"
    document.getElementById(`taskh1-${tareaid}`).innerHTML = document.getElementById("taskEditar").value
    //document.getElementById(`contPo-${num}`).innerHTML = document.getElementById("actEditar").value
    //document.getElementById(`est-${num}`).innerHTML = document.getElementById("estEditar").value

    if (document.getElementById("textAreaEditar").value != "") {
        document.getElementById(`textArea-${tareaid}`).className = "rounded-md ml-8 mr-2 px-4 py-2 mt-4 bg-[#FCF8DE] shadow"
        document.getElementById(`textArea-${tareaid}`).innerHTML = document.getElementById("textAreaEditar").value
    } else {
        document.getElementById(`textArea-${tareaid}`).className = "hidden"
        document.getElementById(`textArea-${tareaid}`).innerHTML = ""
        document.getElementById("textAreaEditar").setAttribute('class', 'hidden')
        document.getElementById("botonAddEditar").className = "text-sm text-black opacity-40 hover:opacity-50 font-bold underline mt-3.5 ml-2"
    }

}


//Funcion que resetea los valores de la ventana de creacion de las task, y la esconde con hidden
function cancelEdit() {
    document.getElementById("editarTask").className = "hidden"
    document.getElementById("taskEditar").value = ""
    //document.getElementById("actEditar").value = ""
    //document.getElementById("estEditar").value = ""
    document.getElementById("textAreaEditar").value = ""
    document.getElementById("textAreaEditar").className = "hidden"
}





//Funcion para eliminar una task
function deleteTask() {
    //Eliminamos el div de la task
    document.getElementById(selected).remove()

    console.log("Quiero eliminar: ", selected);
    //Llamamos a la funcion de firestore.js para eliminarlo en la base de datos
    deleteTarea(selected);

    let cont = 0
    //Quitamos el valor de la id del array de ids
    for (const numero of ids) {
        if (numero == selected) {
            ids.splice(cont, 1);
        }
        cont++
    }

    if (ids.length != 0) {
        //Seleccionamos una task para marcarla como seleccionado
        selected = obtenerAleatorio().id
        select2(selected)
    }
    console.log(ids)
    pintarDatos(); // para actualizar la vista
    cancelEdit()
}

//Obtener un task aleatoriamente
function obtenerAleatorio() {
    //Cogemos un hijo del div donde estan todas las task
    let div = document.getElementById("allTask")
    let hijos = div.children;
    let hijoAleatorio = hijos[Math.floor(Math.random() * hijos.length)];

    return hijoAleatorio
}

//Funcion de seleccion para cuando selecionamos uno de manera manual
function select(event) {
    if (event.target != undefined) {
        let tareaid = event.target.dataset.tareaid //ID de la task

        if (tareaid != selected) {

            document.getElementById(`marco-${selected}`).className = "bg-white border-l-8 border-transparent rounded-md px-3 py-4 shadow-lg"
            selected = tareaid
            document.getElementById(`marco-${selected}`).className = "bg-white border-l-8 border-black rounded-md px-3 py-4 shadow-lg"
        }

        if (selected == tareaid) {
            document.getElementById(`marco-${selected}`).className = "bg-white border-l-8 border-black rounded-md px-3 py-4 shadow-lg"

        }
    }
}

//Funcion de seleccion para cuando lo asigna el metodo eliminar
function select2(tareaid) {

    if (tareaid != selected) {
        document.getElementById(`marco-${selected}`).className = "bg-white border-l-8 border-transparent rounded-md px-3 py-4 shadow-lg"
        selected = tareaid
        document.getElementById(`marco-${selected}`).className = "bg-white border-l-8 border-black rounded-md px-3 py-4 shadow-lg"
    }

    if (selected == tareaid) {
        console.log(selected)
        document.getElementById(`marco-${selected}`).className = "bg-white border-l-8 border-black rounded-md px-3 py-4 shadow-lg"
    }

}