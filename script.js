
// ======================================
// SISTEMA DE LISTA DE TAREAS
// ======================================

// Obtener fecha actual
function obtenerFecha() {
    const hoy = new Date();

    return [
        hoy.getFullYear(),
        String(hoy.getMonth() + 1).padStart(2, "0"),
        String(hoy.getDate()).padStart(2, "0")
    ].join("-");
}

// Mostrar fecha en pantalla
function mostrarFecha() {
    const hoy = new Date();

    document.getElementById("fecha").textContent =
        hoy.toLocaleDateString("es-PE", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
}

// ======================================
// CARGAR DATOS GUARDADOS
// ======================================

let datos = JSON.parse(
    localStorage.getItem("misTareas")
) || {
    fecha: obtenerFecha(),
    tareas: []
};

// Guardar información
function guardar() {
    localStorage.setItem(
        "misTareas",
        JSON.stringify(datos)
    );
}

// ======================================
// DETECTAR CAMBIO DE DÍA
// ======================================

function revisarDia() {

    const hoy = obtenerFecha();

    if (datos.fecha !== hoy) {

        const pendientes = datos.tareas.filter(
            tarea => !tarea.completada
        );

        const aviso = document.getElementById("aviso");

        if (pendientes.length > 0) {

            aviso.style.display = "block";

            aviso.innerHTML =
                "<strong>⚠️ ¡Tienes tareas pendientes del día anterior!</strong><br>" +
                pendientes.map(tarea =>
                    "• " + escaparHTML(tarea.nombre)
                ).join("<br>");

        } else {

            aviso.style.display = "none";

        }

        // Actualizar fecha sin perder pendientes
        datos.fecha = hoy;

        guardar();
    }
}

// ======================================
// AGREGAR NUEVA TAREA
// ======================================

function agregarTarea() {

    const input = document.getElementById("nuevaTarea");

    const nombre = input.value.trim();

    if (nombre === "") {
        alert("Por favor, escribe una tarea.");
        return;
    }

    const tarea = {
        id: Date.now() + Math.random(),
        nombre: nombre,
        completada: false
    };

    datos.tareas.push(tarea);

    input.value = "";

    guardar();
    mostrarTareas();
}

// ======================================
// MARCAR TAREA COMO COMPLETADA
// ======================================

function completarTarea(id) {

    const tarea = datos.tareas.find(
        tarea => tarea.id === id
    );

    if (tarea) {
        tarea.completada = !tarea.completada;
    }

    guardar();
    mostrarTareas();
}

// ======================================
// ELIMINAR TAREA
// ======================================

function eliminarTarea(id) {

    const confirmar = confirm(
        "¿Seguro que deseas eliminar esta tarea?"
    );

    if (!confirmar) return;

    datos.tareas = datos.tareas.filter(
        tarea => tarea.id !== id
    );

    guardar();
    mostrarTareas();
}

// ======================================
// PROTEGER TEXTO DE LAS TAREAS
// ======================================

function escaparHTML(texto) {

    return texto.replace(/[&<>"']/g, caracter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[caracter]);
}

// ======================================
// MOSTRAR TAREAS EN PANTALLA
// ======================================

function mostrarTareas() {

    const pendientes = document.getElementById(
        "listaPendientes"
    );

    const completadas = document.getElementById(
        "listaCompletadas"
    );

    pendientes.innerHTML = "";
    completadas.innerHTML = "";

    const tareasPendientes = datos.tareas.filter(
        tarea => !tarea.completada
    );

    const tareasCompletadas = datos.tareas.filter(
        tarea => tarea.completada
    );

    // Mensaje cuando no existen pendientes
    if (tareasPendientes.length === 0) {

        pendientes.innerHTML =
            '<div class="vacio">¡No tienes tareas pendientes! 🎉</div>';

    }

    // Mensaje cuando no existen completadas
    if (tareasCompletadas.length === 0) {

        completadas.innerHTML =
            '<div class="vacio">Todavía no completaste tareas.</div>';

    }

    // Crear elementos de cada tarea
    datos.tareas.forEach(tarea => {

        const li = document.createElement("li");

        if (tarea.completada) {
            li.classList.add("hecha");
        }

        li.innerHTML = `
            <input
                type="checkbox"
                ${tarea.completada ? "checked" : ""}
                aria-label="Marcar como completada"
            >

            <span>${escaparHTML(tarea.nombre)}</span>

            <button aria-label="Eliminar tarea">✕</button>
        `;

        // Evento para completar
        li.querySelector("input").addEventListener(
            "change",
            () => completarTarea(tarea.id)
        );

        // Evento para eliminar
        li.querySelector("button").addEventListener(
            "click",
            () => eliminarTarea(tarea.id)
        );

        // Separar pendientes y completadas
        if (tarea.completada) {

            completadas.appendChild(li);

        } else {

            pendientes.appendChild(li);

        }

    });

    // Actualizar contador
    document.getElementById("contador").textContent =
        "Pendientes: " + tareasPendientes.length +
        " | Completadas: " + tareasCompletadas.length;
}

// ======================================
// AGREGAR TAREA PRESIONANDO ENTER
// ======================================

document.getElementById("nuevaTarea")
    .addEventListener("keypress", function(event) {

        if (event.key === "Enter") {
            agregarTarea();
        }

    });

// ======================================
// INICIAR SISTEMA
// ======================================

revisarDia();

mostrarFecha();

mostrarTareas();

// ======================================
// ACTUALIZAR AUTOMÁTICAMENTE CADA 30 SEG.
// ======================================

setInterval(() => {

    if (datos.fecha !== obtenerFecha()) {

        revisarDia();

        mostrarFecha();

        mostrarTareas();

    }

}, 30000);