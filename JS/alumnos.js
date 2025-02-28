document.addEventListener("DOMContentLoaded", () => {
    const studentList = document.getElementById("student-list");
    const addStudentButton = document.getElementById("add-student");
    const undoButton = document.getElementById("undo-action");

    let students = JSON.parse(localStorage.getItem("students")) || [];
    const planillaSelect = document.getElementById("planilla-select");

    let actionHistory = [];
    const TOTAL_CLASSES = 36;

    function saveToLocalStorage() {
        const planilla = getCurrentPlanilla();
        if (planilla) {
            localStorage.setItem(planilla, JSON.stringify(students));
        }
    }

    function getCurrentPlanilla() {
        return planillaSelect.value;
    }

    function loadStudents() {
        const planilla = getCurrentPlanilla();
        if (!planilla) {
            return; // Si no hay planilla seleccionada, no hacer nada
        }

        // Limpiar estudiantes antes de cargar los nuevos datos
        students = [];

        // Verificar si existe la clave para esa planilla en localStorage
        const storedData = localStorage.getItem(planilla);
        if (storedData) {
            students = JSON.parse(storedData);
        }

        console.log("Datos cargados desde localStorage:", students);

        // Asegurarse de que los objetos de los estudiantes están correctamente inicializados
        students.forEach((student, idx) => {
            if (!student) {
                console.warn(`Error: estudiante en índice ${idx} es undefined.`);
            }
            student.practicals = student.practicals || [];
            student.evaluations = student.evaluations || [];
        });

        renderTable(); // Asegúrate de renderizar con los datos correctos.
    }

    // Cargar estudiantes al cambiar de planilla
    planillaSelect.addEventListener("change", () => {
        students = []; // Limpiar la lista de estudiantes al cambiar de planilla
        loadStudents(); // Cargar los estudiantes de la nueva planilla
    });

    // Función para actualizar los trabajos prácticos
    function updatePracticals(index, subIndex, field, value) {
        const student = students[index];
        const practical = student.practicals[subIndex];
        const previousValue = practical[field];

        practical[field] = value;

        actionHistory.push({
            type: "updatePractical",
            index,
            subIndex,
            field,
            previousValue
        });

        saveToLocalStorage();
        updateStats();
    }

    // Función para agregar un nuevo estudiante
    function addStudent() {
        const studentName = prompt("Ingrese el nombre del alumno:");
        if (studentName) {
            const newStudent = {
                name: studentName,
                attendance: 0,
                absences: 0,
                practicals: [],
                evaluations: [],
                observations: "",
                status: "Aprobado"
            };

            // Guardamos la acción en el historial para deshacerla
            actionHistory.push({ type: "add", student: newStudent });

            students.push(newStudent);
            saveToLocalStorage();
            renderTable();
            updateStats(); // Actualizamos las estadísticas
        }
    }

    // Función para agregar el estudiante a la planilla seleccionada
    function addStudentToSheet() {
        const newStudent = {
            name: "Nuevo Estudiante",
            attendance: 0,
            absences: 0,
            practicals: [],
            evaluations: [],
            observations: "",
            status: "Aprobado"
        };

        // Guardamos la acción en el historial para deshacerla
        actionHistory.push({ type: "add", student: newStudent });

        students.push(newStudent);
        saveToLocalStorage();
        renderTable();
        updateStats(); // Actualizamos las estadísticas
    }

    // Función para actualizar la asistencia de un estudiante
    function updateAttendance(index, isPresent) {
        const student = students[index];
        if (student.attendance + student.absences < TOTAL_CLASSES) {
            const previousStudentState = { ...student };

            if (isPresent) {
                student.attendance++;
            } else {
                student.absences++;
            }

            student.status = student.absences >= 7 ? "Reprobado" : student.attendance >= 29 ? "Aprobado" : "En proceso";

            // Guardamos la acción en el historial para deshacerla
            actionHistory.push({
                type: "attendance",
                index,
                previousState: previousStudentState,
                updatedState: { ...student }
            });

            saveToLocalStorage();
            renderTable();
            updateStats(); // Actualizamos las estadísticas
        } else {
            alert("Este alumno ya ha completado las 36 clases.");
        }
    }

    // Función para deshacer la última acción
    function undoLastAction() {
        if (actionHistory.length > 0) {
            const lastAction = actionHistory.pop();

            switch (lastAction.type) {
                case "add":
                    // Si fue un "add", eliminamos el último alumno agregado
                    students = students.filter(student => student !== lastAction.student);
                    break;
                case "attendance":
                    // Si fue una acción de asistencia, revertimos el cambio
                    students[lastAction.index] = lastAction.previousState;
                    break;
                case "delete":
                    // Si fue una acción de eliminar, restauramos el alumno
                    students.splice(lastAction.index, 0, lastAction.student);
                    break;
                case "addPractical":
                    // Si fue agregar trabajo práctico, lo eliminamos
                    students[lastAction.index].practicals.pop();
                    break;
                case "addEvaluation":
                    // Si fue agregar evaluación, lo eliminamos
                    students[lastAction.index].evaluations.pop();
                    break;
                case "updatePractical":
                    // Si fue actualizar un trabajo práctico, restauramos el valor anterior
                    students[lastAction.index].practicals[lastAction.subIndex][lastAction.field] = lastAction.previousValue;
                    break;
                case "updateEvaluation":
                    // Si fue actualizar una evaluación, restauramos el valor anterior
                    students[lastAction.index].evaluations[lastAction.subIndex][lastAction.field] = lastAction.previousValue;
                    break;
            }

            saveToLocalStorage();
            renderTable();
            updateStats(); // Actualizamos las estadísticas
        } else {
            alert("No hay acciones para deshacer.");
        }
    }

    // Función para eliminar un estudiante
    function deleteStudent(index) {
        if (confirm("¿Estás seguro de que deseas eliminar este alumno?")) {
            const deletedStudent = students[index];

            // Guardamos la acción en el historial
            actionHistory.push({
                type: "delete",
                student: deletedStudent,
                index
            });

            students.splice(index, 1);
            saveToLocalStorage();
            renderTable();
            updateStats(); // Actualizamos las estadísticas
        }
    }

    // Función para actualizar los campos editables
    function updateEditableFields(index, field, value) {
        students[index][field] = isNaN(value) ? value : Number(value);
        saveToLocalStorage();
        updateStats(); // Actualizamos las estadísticas
    }

    // Función para agregar un trabajo práctico a un estudiante
    function addPractical(index) {
        if (!students[index]) {
            console.error(`Error: No existe el estudiante en la posición ${index}`);
            return;
        }

        if (!students[index].practicals) {
            students[index].practicals = []; // Asegurar que la propiedad existe
        }

        const newPractical = { name: "", date: "", grade: "" };

        actionHistory.push({
            type: "addPractical",
            index,
            practical: newPractical
        });

        students[index].practicals.push(newPractical);
        saveToLocalStorage();
        renderTable();

        updateStats(); // Actualizamos las estadísticas
    }

    // Función para agregar una evaluación a un estudiante
    function addEvaluation(index) {
        if (!students[index]) {
            console.error(`Error: No existe el estudiante en la posición ${index}`);
            return;
        }

        if (!students[index].evaluations) {
            students[index].evaluations = []; // Asegurar que la propiedad existe
        }

        const newEvaluation = { name: "", date: "", grade: "" };

        actionHistory.push({
            type: "addEvaluation",
            index,
            evaluation: newEvaluation
        });

        students[index].evaluations.push(newEvaluation);
        saveToLocalStorage();
        renderTable();

        updateStats(); // Actualizamos las estadísticas
    }

    // Función para actualizar las evaluaciones de un estudiante
    function updateEvaluations(index, subIndex, field, value) {
        const student = students[index];
        const evaluation = student.evaluations[subIndex];
        const previousValue = evaluation[field];

        evaluation[field] = value;

        actionHistory.push({
            type: "updateEvaluation",
            index,
            subIndex,
            field,
            previousValue
        });

        saveToLocalStorage();
        updateStats(); // Actualizamos las estadísticas
    }

    // Función para renderizar la tabla de estudiantes
    function renderTable() {
        studentList.innerHTML = "";
    
        students.forEach((student, index) => {
    
            // Generar los inputs para los trabajos prácticos
            let practicalInputs = student.practicals.map((practical, subIndex) => `
                <div>
                    <input type="text" placeholder="Nombre" value="${practical.name}" onchange="updatePracticals(${index}, ${subIndex}, 'name', this.value)">
                    <input type="date" value="${practical.date}" onchange="updatePracticals(${index}, ${subIndex}, 'date', this.value)">
                    <input type="number" placeholder="Nota" value="${practical.grade}" onchange="updatePracticals(${index}, ${subIndex}, 'grade', this.value)">
                </div>
            `).join("");
    
            // Generar los inputs para las evaluaciones
            let evaluationInputs = student.evaluations.map((evaluation, subIndex) => `
                <div>
                    <input type="text" placeholder="Nombre de la evaluación" value="${evaluation.name}" onchange="updateEvaluations(${index}, ${subIndex}, 'name', this.value)">
                    <input type="date" value="${evaluation.date}" onchange="updateEvaluations(${index}, ${subIndex}, 'date', this.value)">
                    <input type="number" placeholder="Nota" value="${evaluation.grade}" onchange="updateEvaluations(${index}, ${subIndex}, 'grade', this.value)">
                </div>
            `).join("");
    
            // Crear la fila para el estudiante
            const row = document.createElement("tr");
    
            row.innerHTML = `
                <td>${student.name}</td>
                <td>${student.attendance}</td>
                <td>${student.absences}</td>
                <td>
                    ${practicalInputs}
                    <button onclick="addPractical(${index})">+ Agregar Trabajo</button>
                </td>
                <td>
                    ${evaluationInputs}
                    <button onclick="addEvaluation(${index})">+ Agregar Evaluación</button>
                </td>
                <td>${student.status}</td>
                <td contenteditable="true" onblur="updateEditableFields(${index}, 'observations', this.innerText)">${student.observations || ""}</td>
                <td>
                    <button onclick="updateAttendance(${index}, true)">Presente</button>
                    <button onclick="updateAttendance(${index}, false)">Ausente</button>
                </td>
                <td>
                    <button class="delete" onclick="deleteStudent(${index})">Eliminar</button>
                </td>
            `;
    
            studentList.appendChild(row);
        });
    }
    

    // Función para actualizar las estadísticas
    function updateStats() {
        // Aquí puedes agregar las estadísticas como el total de clases, aprobados, reprobados, etc.
        console.log("Estadísticas actualizadas");
    }

    window.updateAttendance = updateAttendance;
    window.deleteStudent = deleteStudent;
    window.updateEditableFields = updateEditableFields;
    window.addPractical = addPractical;
    window.addEvaluation = addEvaluation;
    window.updatePracticals = updatePracticals;
    window.updateEvaluations = updateEvaluations;
    // Inicializar la página cargando los estudiantes desde localStorage
    loadStudents();
    
    // Asignar los eventos a los botones
    addStudentButton.addEventListener("click", addStudent);
    undoButton.addEventListener("click", undoLastAction);
});
