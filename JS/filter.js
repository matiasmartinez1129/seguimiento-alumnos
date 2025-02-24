document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search-student");
    const filterSelect = document.getElementById("filter-status");
    const studentList = document.getElementById("student-list");
    
    function filterStudents() {
        const searchText = searchInput.value.toLowerCase();
        const selectedStatus = filterSelect.value;
        
        const rows = studentList.getElementsByTagName("tr");
        
        for (let row of rows) {
            const nameCell = row.cells[0]?.textContent.toLowerCase() || "";
            const statusCell = row.cells[5]?.textContent || "";
            
            const matchesSearch = nameCell.includes(searchText);
            const matchesFilter = selectedStatus === "all" || statusCell === selectedStatus;
            
            row.style.display = matchesSearch && matchesFilter ? "" : "none";
        }
    }
    
    searchInput.addEventListener("input", filterStudents);
    filterSelect.addEventListener("change", filterStudents);
});
