document.addEventListener("DOMContentLoaded", () => {
    const studentStatsModal = document.getElementById("student-stats-modal");
    const closeModalBtn = document.getElementById("close-modal");
    const searchStudentInput = document.getElementById("search-student-modal"); // Cambié el id aquí
    const studentLinksContainer = document.getElementById("student-links-container");
    const studentStatsContainer = document.getElementById("student-stats-container");

    // Función para calcular el porcentaje de asistencia
    function calculateAttendancePercentage(student) {
        const totalClasses = 36; // Número total de clases
        return student.attendance && totalClasses > 0 ? ((student.attendance / totalClasses) * 100).toFixed(2) : 0;
    }

    // Función para calcular el promedio de notas de los trabajos prácticos
    function calculateAveragePracticals(student) {
        const totalGrade = student.practicals.reduce((sum, practical) => sum + (practical.grade || 0), 0);
        return student.practicals.length > 0 ? (totalGrade / student.practicals.length).toFixed(2) : 0;
    }

    // Función para calcular el promedio de notas de las evaluaciones
    function calculateAverageEvaluations(student) {
        const totalGrade = student.evaluations.reduce((sum, evaluation) => sum + (evaluation.grade || 0), 0);
        return student.evaluations.length > 0 ? (totalGrade / student.evaluations.length).toFixed(2) : 0;
    }

    // Función para renderizar las estadísticas del alumno seleccionado
    function renderStudentStats(student) {
        const attendancePercentage = calculateAttendancePercentage(student);
        const practicalAvg = calculateAveragePracticals(student);
        const evaluationAvg = calculateAverageEvaluations(student);

        const statsHtml = `
            <ul>
                <li><strong>Asistencia:</strong> ${student.attendance} clases</li>
                <li><strong>Ausencias:</strong> ${student.absences} clases</li>
                <li><strong>Porcentaje de Asistencia:</strong> ${attendancePercentage}%</li>
                <li><strong>Promedio de Trabajos Prácticos:</strong> ${practicalAvg}</li>
                <li><strong>Promedio de Evaluaciones:</strong> ${evaluationAvg}</li>
                <li><strong>Estado:</strong> ${student.status}</li>
            </ul>
        `;
        studentStatsContainer.innerHTML = statsHtml;
    }

    // Función para renderizar la lista de alumnos filtrados
    function renderStudentLinks(students) {
        studentLinksContainer.innerHTML = ''; // Limpiar los resultados anteriores

        students.forEach((student) => {
            const li = document.createElement("li");
            li.textContent = student.name;
            li.style.cursor = "pointer";

            // Agregar evento para mostrar las estadísticas al hacer clic en el nombre del alumno
            li.addEventListener("click", () => renderStudentStats(student));

            studentLinksContainer.appendChild(li);
        });
    }

    // Función para filtrar y mostrar los alumnos según el texto de búsqueda
    searchStudentInput.addEventListener("input", () => {
        const query = searchStudentInput.value.toLowerCase();
        const students = JSON.parse(localStorage.getItem("students")) || [];

        if (students.length === 0) {
            alert("No hay estudiantes disponibles.");
            return;
        }

        // Filtrar alumnos por nombre
        const filteredStudents = students.filter(student =>
            student.name.toLowerCase().includes(query)
        );

        renderStudentLinks(filteredStudents);
    });

    // Función para abrir el modal
    document.getElementById("show-stats-modal").addEventListener("click", () => {
        studentStatsModal.style.display = "block";
    });

    // Función para cerrar el modal
    closeModalBtn.addEventListener("click", () => {
        studentStatsModal.style.display = "none";
    });

    // Cerrar el modal si se hace clic fuera de él
    window.addEventListener("click", (event) => {
        if (event.target === studentStatsModal) {
            studentStatsModal.style.display = "none";
        }
    });
});
