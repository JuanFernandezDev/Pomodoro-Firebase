let ids = []
let tareas = []
let selected = 0
let interval
let flagReanudar = 0
const startElement = document.getElementById("counter")
let setModo = 1
let tiempoPomodoro = 1500
let tiempoShort = 300
let tiempoLong = 900

import { getUUID } from "./utils.js";
import { login, logOut, auth, user } from "./auth.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";
import { getTareas, newTarea, deleteTarea, actualizarTarea, eliminarCampo, actualizarCheck } from "./firestore.js";


let currentUser = ""

//Comprueba el estado del usuario cada vez que se refresca la pagina.
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user
        console.log("Usuario logueado", currentUser.displayName)
        init()
        pintarDatos()
    } else {
        currentUser = ""
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
document.getElementById("cancelEdit").addEventListener("click", cancelEdit)
document.getElementById("deleteTask").addEventListener("click", deleteTask)
document.getElementById("cancelTask").addEventListener("click", cancelTask)
document.getElementById("crearTask").addEventListener("click", añadirTask)
document.getElementById("botonAddEditar").addEventListener("click", añadirTextAreaEditar)
document.getElementById("botonAdd").addEventListener("click", añadirTextArea)
document.getElementById("boton-login").addEventListener("click", login)
document.getElementById("boton-login2").addEventListener("click", login)
document.getElementById("boton-logout").addEventListener("click", logOut)
document.getElementById("boton-logout2").addEventListener("click", logOut)
document.getElementById("actualizarEdit").addEventListener("click", actualizar)

document.getElementById("botonPomodoro").addEventListener("click", changePomodoro)
document.getElementById("botonShort").addEventListener("click", changeShortBreak)
document.getElementById("botonLong").addEventListener("click", changeLongBreak)
document.getElementById("start").addEventListener("click", start)
document.getElementById("pause").addEventListener("click", pauseCounter)
document.getElementById("img-next").addEventListener("click", next)
document.getElementById("contadorPomodoro").addEventListener("click", actualizarPomodoros)




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
    console.log(currentUser)
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
    document.getElementById("textAreaEditar").className = "mt-3.5 bg-[#EFEFEF] border-none rounded-md w-full"

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
    document.getElementById("addTask").classList.replace("hidden", "flex")
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
    if (currentUser != "") { //Comprobamos si el usuario esta logueado para que no intente actualizar la base de datos
        tareas.forEach(tareaAux => {
            if (tareaAux.id === tareaid) {
                actualizarCheck(tareaAux.id, tareaAux)
            }
        });
    }
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

    if (currentUser != "") { //Comprobamos si el usuario esta logueado para que no intente actualizar la base de datos
        tareas.forEach(tareaAux => {
            if (tareaAux.id === tareaid) {
                actualizarCheck(tareaAux.id, tareaAux)
            }
        });
    }
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
        tareas.push(tarea)
        cancelTask()


    }
}

//Saca el menu para editar la task y permite modificar los campos
function editTask(event) {
    let tareaid = event.target.dataset.tareaid
    document.getElementById("saveEdit").classList.replace("block", "hidden")
    document.getElementById("actualizarEdit").classList.replace("hidden", "block")
    document.getElementById("editarTask").className = "w-full text-[#555555] mt-10"
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


//Funcion que resetea los valores de la ventana de creacion de las task, y la esconde con hidden
function cancelEdit() {
    document.getElementById("textAreaEditar").classList.replace("block", "hidden")
    document.getElementById("editarTask").setAttribute('class', 'hidden')
    document.getElementById("addTask").classList.replace("hidden", "flex")
    document.getElementById(selected).classList.replace("hidden", "block")
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
        document.getElementById(`marco-${selected}`).className = "bg-white border-l-8 border-black rounded-md px-3 py-4 shadow-lg"
    }

}


function actualizar() {
    let tareaid = selected
    let taskAux

    if (currentUser != "") {
        tareas.forEach(tareaAux => {
            if (tareaAux.id === tareaid) {
                if (document.getElementById("taskEditar").value != "") {
                    taskAux = document.getElementById("taskEditar").value
                    tareaAux.titulo = taskAux

                }
                /*let setAux
                if (document.getElementById("numeroEst").value != "") {
                    setAux = document.getElementById("numeroEst").value
                    tarea.sets = setAux
                }*/
                let areaAux
                if (document.getElementById("textAreaEditar").value != "") {
                    areaAux = document.getElementById("textAreaEditar").value
                    tareaAux.textArea = areaAux
                } else {
                    if (tareaAux.textArea != "") {
                        eliminarCampo(tareaid, tareaAux)
                    }
                    delete tareaAux.textArea
                }

                ids = []
                //Mandamos la tarea a actualizar en la base de datos
                actualizarTarea(tareaid, tareaAux)
                // Reset del input
                document.getElementById("allTask").innerHTML = ""

                pintarDatos(); // para actualizar la vista
            }
        });
    } else {
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


    cancelEdit()


}


function startCounter(counterElement, count) {

    document.getElementById("start").setAttribute('class', 'hidden')
    document.getElementById("pause-line").className = 'flex flex-row justify-center ';
    switch (setModo) {
        case 1:
            document.getElementById("pause").className = 'text-2xl bg-white text-[#113149] font-bold px-16 py-3 rounded-md shadow-inner shadow-lg mb-6 ';
            break
        case 2:
            document.getElementById("pause").className = 'text-2xl bg-white text-[#BA4949] font-bold px-16 py-3 rounded-md shadow-inner shadow-lg mb-6 ';
            break
        case 3:
            document.getElementById("pause").className = 'text-2xl bg-white text-[#7D53A2] font-bold px-16 py-3 rounded-md shadow-inner shadow-lg mb-6 ';
            break
    }
    interval = setInterval(() => {
        count--;
        const minutes = Math.floor(count / 60)
        let seconds = count % 60
        seconds = seconds.toString().padStart(2, "0")
        // console.log(count + "Minutos: " + minutes + "Segundos: " + seconds)
        counterElement.innerHTML = `${minutes}:${seconds}`
        if (setModo == 1) {
            document.title = `${minutes}:${seconds} - Time to focus!`;
        } else {
            document.title = `${minutes}:${seconds} - Time for a break!`;
        }
        if (count === 0) {
            clearInterval(interval)
            next()
        }
    }, 1000);

}

function pauseCounter() {
    flagReanudar = 1
    document.getElementById("pause-line").setAttribute('class', 'hidden')
    switch (setModo) {
        case 1:
            document.getElementById("start").className = 'text-2xl bg-white text-[#113149] font-bold px-16 py-3 rounded-md shadow-inner shadow-lg mb-6 ';
            break
        case 2:
            document.getElementById("start").className = 'text-2xl bg-white text-[#BA4949] font-bold px-16 py-3 rounded-md shadow-inner shadow-lg mb-6 ';
            break
        case 3:
            document.getElementById("start").className = 'text-2xl bg-white text-[#7D53A2] font-bold px-16 py-3 rounded-md shadow-inner shadow-lg mb-6 ';
            break
    }
    clearInterval(interval)
}

function resumeCounter() {
    const counterElement = document.getElementById("counter");
    const time = counterElement.innerHTML;
    const minutes = parseInt(time.split(":")[0]);
    const seconds = parseInt(time.split(":")[1]);
    const count = minutes * 60 + seconds;
    startCounter(counterElement, count);
}

function start() {
    if (flagReanudar == 0) {
        switch (setModo) {
            case 1:
                startCounter(startElement, tiempoPomodoro)
                break
            case 2:
                startCounter(startElement, tiempoShort)
                break
            case 3:
                startCounter(startElement, tiempoLong)
                break
        }
    } else {
        resumeCounter()
    }
}

function darFormato(counter) {
    const minutes = Math.floor(counter / 60)
    let seconds = counter % 60
    seconds = seconds.toString().padStart(2, "0")
    startElement.innerHTML = `${minutes}:${seconds}`
}

function darMinutos(counter) {
    const minutes = Math.floor(counter / 60)
    let seconds = counter % 60
    seconds = seconds.toString().padStart(2, "0")
    return `${minutes}:${seconds}`
}
function changePomodoro() {
    setModo = 1
    document.getElementById("botonPomodoro").className = "rounded backdrop-opacity-10 bg-black/20 px-4 py-px font-semibold"
    document.getElementById("botonLong").className = ""
    document.getElementById("botonShort").className = ""
    document.getElementById("start").className = "transition-all duration-300 text-2xl bg-white font-bold px-16 py-3 rounded-md shadow-inner shadow-lg mb-6 text-[#113149]"
    document.getElementById("pause-line").setAttribute('class', 'hidden')
    document.title = `${darMinutos(tiempoPomodoro)} - Time to focus!`
    document.querySelector('#icono').setAttribute('href', 'Img/check-modo-1.png');
    if (ids.length == 0)
        document.getElementById('frase').innerHTML = "Time to focus!"

    darFormato(tiempoPomodoro)

    clearInterval(interval)

    document.getElementById("background").className = 'h-screen transition-all duration-300 bg-[#113149]'

}

function changeShortBreak() {
    setModo = 2
    document.getElementById("botonPomodoro").className = ""
    document.getElementById("botonLong").className = ""
    document.getElementById("botonShort").className = "rounded backdrop-opacity-10 bg-black/20 px-4 py-px font-semibold"
    document.getElementById("start").className = "transition-all duration-300 text-2xl bg-white font-bold px-16 py-3 rounded-md shadow-inner shadow-lg mb-6 text-[#BA4949]"
    document.getElementById("pause-line").setAttribute('class', 'hidden')
    document.title = `${darMinutos(tiempoShort)} - Time for a break!`
    document.querySelector('#icono').setAttribute('href', 'Img/check-modo-2.png');
    if (ids.length == 0)
        document.getElementById('frase').innerHTML = "Time for a break!"

    darFormato(tiempoShort)

    clearInterval(interval)

    document.getElementById("background").className = 'h-screen transition-all duration-300 bg-[#BA4949]'

}

function changeLongBreak() {
    setModo = 3
    document.getElementById("botonPomodoro").className = ""
    document.getElementById("botonLong").className = "rounded backdrop-opacity-10 bg-black/20 px-4 py-px font-semibold"
    document.getElementById("botonShort").className = ""
    document.getElementById("start").className = "transition-all duration-300 text-2xl bg-white font-bold px-16 py-3 rounded-md shadow-inner shadow-lg mb-6 text-[#7D53A2]"
    document.getElementById("pause-line").setAttribute('class', 'hidden')
    document.title = `${darMinutos(tiempoLong)} - Time for a break!`
    document.querySelector('#icono').setAttribute('href', 'Img/check-modo-3.png');
    if (ids.length == 0)
        document.getElementById('frase').innerHTML = "Time for a break!"

    darFormato(tiempoLong)

    clearInterval(interval)

    document.getElementById("background").className = 'h-screen transition-all duration-300 bg-[#7D53A2]'

}

function startPomodoro() {
    startCounter(startElement, tiempoPomodoro)
}

function startShortBreak() {
    startCounter(startElement, tiempoShort)
}

function startLongBreak() {
    startCounter(startElement, tiempoLong)
}

let longBreakInterval = 3
let intervalBreak = 0
let contadorPo = 0;

function aumentarNum() {
    let aux
    contadorPo++;
    document.getElementById("contadorPomodoro").innerHTML = `#${contadorPo}`
    if (ids.length != 0) {
        aux = parseInt(document.getElementById(`contPo-${selected}`).textContent.trim(), 10)
        aux++
        document.getElementById(`contPo-${selected}`).innerHTML = `${aux}`
    }

}

function next() {
    if (intervalBreak == 2 && setModo == 1) {
        intervalBreak = 0
        aumentarNum()
        changeLongBreak()
    } else if (setModo == 1) {
        aumentarNum()
        changeShortBreak()
    } else if (setModo == 2) {
        intervalBreak++
        changePomodoro()
    } else if (setModo == 3) {
        changePomodoro()
    }

}

function aumentarEst() {
    document.getElementById("numeroEst").value++
}

function disminuirEst() {
    if (document.getElementById("numeroEst").value > 1)
        document.getElementById("numeroEst").value--
}


function actualizarPomodoros() {
    return confirm('¿Seguro que quieres resetear el contador de pomodoros?');
}