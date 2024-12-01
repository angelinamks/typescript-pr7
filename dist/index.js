"use strict";
var StudentStatus;
(function (StudentStatus) {
    StudentStatus[StudentStatus["Active"] = 0] = "Active";
    StudentStatus[StudentStatus["AcademicLeave"] = 1] = "AcademicLeave";
    StudentStatus[StudentStatus["Graduated"] = 2] = "Graduated";
    StudentStatus[StudentStatus["Expelled"] = 3] = "Expelled";
})(StudentStatus || (StudentStatus = {}));
var CourseType;
(function (CourseType) {
    CourseType[CourseType["Mandatory"] = 0] = "Mandatory";
    CourseType[CourseType["Optional"] = 1] = "Optional";
    CourseType[CourseType["Special"] = 2] = "Special";
})(CourseType || (CourseType = {}));
var Semester;
(function (Semester) {
    Semester[Semester["First"] = 0] = "First";
    Semester[Semester["Second"] = 1] = "Second";
})(Semester || (Semester = {}));
var Grade;
(function (Grade) {
    Grade[Grade["Excellent"] = 5] = "Excellent";
    Grade[Grade["Good"] = 4] = "Good";
    Grade[Grade["Satisfactory"] = 3] = "Satisfactory";
    Grade[Grade["Unsatisfactory"] = 2] = "Unsatisfactory";
})(Grade || (Grade = {}));
var Faculty;
(function (Faculty) {
    Faculty[Faculty["ComputerScience"] = 0] = "ComputerScience";
    Faculty[Faculty["Economics"] = 1] = "Economics";
    Faculty[Faculty["Law"] = 2] = "Law";
    Faculty[Faculty["Engineering"] = 3] = "Engineering";
})(Faculty || (Faculty = {}));
class UniversityManagement {
    constructor() {
        this.students = new Map();
        this.courses = new Map();
        this.grades = [];
        this.studentIdCounter = 1;
        this.courseRegistrations = new Map();
    }
    // Додавання нового студента
    addStudent(studentData) {
        const student = Object.assign(Object.assign({}, studentData), { id: this.studentIdCounter++ });
        this.students.set(student.id, student);
        return student;
    }
    // Додавання курсу до системи
    addCourse(course) {
        if (this.courses.has(course.id)) {
            throw new Error("Курс з таким ID вже існує");
        }
        this.courses.set(course.id, course);
    }
    // Реєстрація студента на курс
    enrollInCourse(studentId, courseId) {
        const course = this.courses.get(courseId);
        const student = this.students.get(studentId);
        if (!course)
            throw new Error("Курс не знайдено");
        if (!student)
            throw new Error("Студента не знайдено");
        if (course.faculty !== student.faculty) {
            throw new Error("Студент не може зареєструватися на курс іншого факультету");
        }
        const registeredStudents = this.courseRegistrations.get(courseId) || new Set();
        if (registeredStudents.size >= course.maxStudents) {
            throw new Error("Курс уже заповнений");
        }
        registeredStudents.add(studentId);
        this.courseRegistrations.set(courseId, registeredStudents);
    }
    // Встановлення оцінки студенту за курс
    assignGrade(studentId, courseId, gradeValue) {
        const courseStudents = this.courseRegistrations.get(courseId);
        if (!courseStudents || !courseStudents.has(studentId)) {
            throw new Error("Студент не зареєстрований на цей курс");
        }
        const grade = {
            studentId,
            courseId,
            grade: gradeValue,
            date: new Date(),
            semester: this.courses.get(courseId).semester,
        };
        this.grades.push(grade);
    }
    // Оновлення статусу студента
    changeStudentStatus(studentId, newStatus) {
        const student = this.students.get(studentId);
        if (!student)
            throw new Error("Студента не знайдено");
        if (student.status === StudentStatus.Graduated || student.status === StudentStatus.Expelled) {
            throw new Error("Не можна змінити статус студента, який вже випустився або був відрахований");
        }
        student.status = newStatus;
    }
    // Отримання студентів по факультету
    listStudentsByFaculty(faculty) {
        return Array.from(this.students.values()).filter((student) => student.faculty === faculty);
    }
    // Отримання оцінок студента
    getGradesForStudent(studentId) {
        return this.grades.filter((grade) => grade.studentId === studentId);
    }
    // Отримання курсів доступних для певного семестру та факультету
    getCoursesForFacultyAndSemester(faculty, semester) {
        return Array.from(this.courses.values()).filter((course) => course.faculty === faculty && course.semester === semester);
    }
    // Обчислення середньої оцінки для студента
    computeAverageGrade(studentId) {
        const studentGrades = this.getGradesForStudent(studentId);
        if (studentGrades.length === 0) {
            throw new Error("Студент не має оцінок");
        }
        const sum = studentGrades.reduce((total, grade) => total + grade.grade, 0);
        return sum / studentGrades.length;
    }
    // Отримання списку відмінників факультету
    listHonorsStudents(faculty) {
        return Array.from(this.students.values()).filter((student) => {
            if (student.faculty !== faculty)
                return false;
            const grades = this.getGradesForStudent(student.id);
            return grades.length > 0 && grades.every((grade) => grade.grade === Grade.Excellent);
        });
    }
}
function main() {
    // Використання
    const universitySystem = new UniversityManagement();
    // Додавання студента
    const student = universitySystem.addStudent({
        fullName: "Петро Петренко",
        faculty: Faculty.ComputerScience,
        year: 1,
        status: StudentStatus.Active,
        enrollmentDate: new Date(),
        groupNumber: "CS102",
    });
    // Додавання курсу
    const course = {
        id: 1,
        name: "Основи комп'ютерних наук",
        type: CourseType.Mandatory,
        credits: 4,
        semester: Semester.First,
        faculty: Faculty.ComputerScience,
        maxStudents: 25,
    };
    universitySystem.addCourse(course);
    // Реєстрація на курс
    universitySystem.enrollInCourse(student.id, course.id);
    // Виставлення оцінки
    universitySystem.assignGrade(student.id, course.id, Grade.Good);
    // Оновлення статусу студента
    universitySystem.changeStudentStatus(student.id, StudentStatus.AcademicLeave);
    // Отримання студентів за факультетом
    console.log("Студенти факультету Computer Science:", universitySystem.listStudentsByFaculty(Faculty.ComputerScience));
    // Отримання відмінників
    console.log("Відмінники факультету Computer Science:", universitySystem.listHonorsStudents(Faculty.ComputerScience));
}
main();
