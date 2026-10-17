
// Find the HTML elements we need
const studentForm = document.getElementById("studentForm");
const studentName = document.getElementById("studentName");
const rollNumber = document.getElementById("rollNumber");
const course = document.getElementById("course");
const email = document.getElementById("email");
const marks = document.getElementById("marks");

const studentTableBody = document.getElementById("studentTableBody");
const emptyMessage = document.getElementById("emptyMessage");
const searchInput = document.getElementById("searchInput");
const courseFilter = document.getElementById("courseFilter");

const totalStudents = document.getElementById("totalStudents");
const averageMarks = document.getElementById("averageMarks");
const totalCourses = document.getElementById("totalCourses");

const formTitle = document.getElementById("formTitle");
const submitButton = document.getElementById("submitButton");
const cancelButton = document.getElementById("cancelButton");
const clearAllButton = document.getElementById("clearAllButton");
const recordCount = document.getElementById("recordCount");

// Load previously saved students from the browser
let students = [];

try {
    const savedStudents = localStorage.getItem("studentRecords");
    const parsedStudents = savedStudents ? JSON.parse(savedStudents) : [];

    if (Array.isArray(parsedStudents)) {
        students = parsedStudents.filter(student =>
            student &&
            typeof student.id === "string" &&
            typeof student.name === "string" &&
            typeof student.roll === "string" &&
            typeof student.course === "string" &&
            typeof student.email === "string" &&
            Number.isFinite(Number(student.marks))
        );
    }
} catch (error) {
    console.error("Could not load saved student records:", error);
}

// If this is a new project, show a few sample records
if (students.length === 0 &&
    localStorage.getItem("studentRecords") === null) {
    students = [
        {
            id: "sample-1",
            name: "Aarav Sharma",
            roll: "ECE101",
            course: "ECE",
            email: "aarav@example.com",
            marks: 85
        },
        {
            id: "sample-2",
            name: "Priya Singh",
            roll: "CSE102",
            course: "CSE",
            email: "priya@example.com",
            marks: 92
        },
        {
            id: "sample-3",
            name: "Rohan Das",
            roll: "EEE103",
            course: "EEE",
            email: "rohan@example.com",
            marks: 76
        }
    ];

    saveStudents();
}

// This variable stores the ID of the student being edited
let editingId = null;

// Save the student list in browser storage
function saveStudents() {
    try {
        localStorage.setItem("studentRecords", JSON.stringify(students));
    } catch (error) {
        alert("Unable to save data. Please check your browser storage.");
    }
}

// Reset the form to add mode
function resetForm() {
    studentForm.reset();
    editingId = null;
    formTitle.textContent = "Add New Student";
    submitButton.textContent = "Add Student";
    cancelButton.hidden = true;
}

// Create a table cell using safe text content
function createCell(value) {
    const cell = document.createElement("td");
    cell.textContent = value;
    return cell;
}

// Display students in the table
function renderStudents() {
    const searchText = searchInput.value.trim().toLowerCase();
    const selectedCourse = courseFilter.value;

    // Apply search and course filter
    const filteredStudents = students.filter(student => {
        const matchesSearch =
            student.name.toLowerCase().includes(searchText) ||
            student.roll.toLowerCase().includes(searchText) ||
            student.email.toLowerCase().includes(searchText) ||
            student.course.toLowerCase().includes(searchText);

        const matchesCourse =
            selectedCourse === "" || student.course === selectedCourse;

        return matchesSearch && matchesCourse;
    });

    // Remove old rows before drawing the updated table
    studentTableBody.replaceChildren();

    filteredStudents.forEach(student => {
        const row = document.createElement("tr");

        row.appendChild(createCell(student.name));
        row.appendChild(createCell(student.roll));
        row.appendChild(createCell(student.course));
        row.appendChild(createCell(student.email));
        row.appendChild(createCell(`${student.marks}/100`));

        // Create the action buttons
        const actionCell = document.createElement("td");
        const actionButtons = document.createElement("div");
        actionButtons.className = "action-buttons";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Edit";
        editButton.className = "edit-btn";
        editButton.addEventListener("click", () => editStudent(student.id));

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";
        deleteButton.addEventListener("click", () => deleteStudent(student.id));

        actionButtons.append(editButton, deleteButton);
        actionCell.appendChild(actionButtons);
        row.appendChild(actionCell);

        studentTableBody.appendChild(row);
    });

    // Show or hide the empty-state message
    emptyMessage.hidden = filteredStudents.length > 0;

    // Update the record count
    recordCount.textContent =
        `Showing ${filteredStudents.length} of ${students.length} students`;

    // Update dashboard statistics using all records
    totalStudents.textContent = students.length;

    const average = students.length
        ? students.reduce((sum, student) => sum + Number(student.marks), 0)
            / students.length
        : 0;

    averageMarks.textContent = average.toFixed(1);

    const uniqueCourses = new Set(students.map(student => student.course));
    totalCourses.textContent = uniqueCourses.size;
}

// Add a new student or update an existing student
studentForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = studentName.value.trim();
    const roll = rollNumber.value.trim();
    const selectedCourse = course.value;
    const studentEmail = email.value.trim();
    const studentMarks = Number(marks.value);

    if (!name || !roll || !selectedCourse || !studentEmail) {
        alert("Please fill in all the fields.");
        return;
    }

    if (marks.value.trim() === "" ||
        !Number.isFinite(studentMarks) ||
        studentMarks < 0 ||
        studentMarks > 100) {
        alert("Marks must be a number between 0 and 100.");
        return;
    }

    // Roll numbers must be unique, ignoring letter case
    const duplicateRoll = students.some(student =>
        student.roll.toLowerCase() === roll.toLowerCase() &&
        student.id !== editingId
    );

    if (duplicateRoll) {
        alert("This roll number already exists. Please use a different one.");
        return;
    }

    if (editingId !== null) {
        // Update an existing record
        students = students.map(student => {
            if (student.id === editingId) {
                return {
                    ...student,
                    name,
                    roll,
                    course: selectedCourse,
                    email: studentEmail,
                    marks: studentMarks
                };
            }

            return student;
        });

        alert("Student details updated successfully!");
    } else {
        // Add a new record
        students.push({
            id: crypto.randomUUID(),
            name,
            roll,
            course: selectedCourse,
            email: studentEmail,
            marks: studentMarks
        });

        alert("Student added successfully!");
    }

    saveStudents();
    resetForm();
    renderStudents();
});

// Fill the form with the selected student's information
function editStudent(id) {
    const student = students.find(item => item.id === id);

    if (!student) return;

    editingId = id;
    studentName.value = student.name;
    rollNumber.value = student.roll;
    course.value = student.course;
    email.value = student.email;
    marks.value = student.marks;

    formTitle.textContent = "Edit Student Details";
    submitButton.textContent = "Update Student";
    cancelButton.hidden = false;

    // Bring the form into view
    studentForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Delete one student
function deleteStudent(id) {
    const student = students.find(item => item.id === id);

    if (!student) return;

    const confirmed = confirm(
        `Are you sure you want to delete ${student.name}?`
    );

    if (!confirmed) return;

    students = students.filter(item => item.id !== id);

    if (editingId === id) {
        resetForm();
    }

    saveStudents();
    renderStudents();
}

// Cancel editing
cancelButton.addEventListener("click", resetForm);

// Search as the user types
searchInput.addEventListener("input", renderStudents);

// Filter by selected course
courseFilter.addEventListener("change", renderStudents);

// Clear every record
clearAllButton.addEventListener("click", function() {
    if (students.length === 0) {
        alert("There are no records to clear.");
        return;
    }

    const confirmed = confirm(
        "Are you sure you want to delete ALL student records? This cannot be undone."
    );

    if (!confirmed) return;

    students = [];
    saveStudents();
    resetForm();
    renderStudents();
});

// Display the dashboard when the page opens
renderStudents();
