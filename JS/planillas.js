// Función para cargar las planillas desde el localStorage
function loadPlanillas() {
    const planillaSelect = document.getElementById("planilla-select");

    // Limpiar el contenido del select
    planillaSelect.innerHTML = "";

    // Agregar la opción predeterminada
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Selecciona una planilla";
    planillaSelect.appendChild(defaultOption);

    // Cargar las planillas del localStorage
    Object.keys(localStorage).forEach((key) => {
        if (key !== "length" && key !== "setItem" && key !== "getItem" && key !== "removeItem" && key !== "clear") {
            const option = document.createElement("option");
            option.value = key;
            option.textContent = key;
            planillaSelect.appendChild(option);
        }
    });
}

// Función para crear una nueva planilla
const crearPlanillaButton = document.getElementById("crear-planilla");
crearPlanillaButton.addEventListener("click", function() {
    const planillaName = prompt("Ingresa el nombre de la nueva planilla:");

    if (planillaName) {
        // Verificar si la planilla ya existe
        if (localStorage.getItem(planillaName)) {
            alert("La planilla ya existe.");
        } else {
            // Crear una nueva planilla vacía (puedes agregar estudiantes más tarde)
            localStorage.setItem(planillaName, JSON.stringify([]));

            // Actualiza el select de planillas
            loadPlanillas();

            alert("Planilla creada con éxito.");
        }
    } else {
        alert("El nombre de la planilla no puede estar vacío.");
    }
});

// Función para cargar los estudiantes de la planilla seleccionada
function loadEstudiantes(planillaName) {
    const tablaEstudiantes = document.getElementById("tabla-estudiantes");
    tablaEstudiantes.innerHTML = ""; // Limpiar la tabla de estudiantes

    if (planillaName) {
        const estudiantes = JSON.parse(localStorage.getItem(planillaName));

        if (estudiantes) {
            estudiantes.forEach((estudiante) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${estudiante.nombre}</td>
                    <td>${estudiante.apellido}</td>
                    <td>${estudiante.email}</td>
                `;
                tablaEstudiantes.appendChild(row);
            });
        }
    }
}

// Función para eliminar una planilla
const eliminarPlanillaButton = document.getElementById("eliminar-planilla");
eliminarPlanillaButton.addEventListener("click", function() {
    const planillaSelect = document.getElementById("planilla-select");
    const planillaName = planillaSelect.value;

    if (planillaName) {
        if (confirm(`¿Estás seguro de que quieres eliminar la planilla '${planillaName}' y todos sus datos asociados?`)) {
            // Eliminar la planilla del localStorage
            localStorage.removeItem(planillaName);

            // Limpiar el valor del select para evitar que quede seleccionada una planilla eliminada
            planillaSelect.value = "";

            // Actualiza el select de planillas
            loadPlanillas();

            // Si no hay planilla seleccionada, vaciar la tabla
            loadEstudiantes(""); // Pasa una cadena vacía para limpiar la tabla

            alert("Planilla y datos eliminados con éxito.");
        }
    } else {
        alert("Por favor, selecciona una planilla para eliminar.");
    }
});

// Llamada a la función para cargar las planillas cuando se carga la página
window.onload = function() {
    loadPlanillas();
};
