enum StudentStatus {
  Active,
  AcademicLeave,
  Graduated,
  Expelled,
}

enum CourseType {
  Mandatory,
  Optional,
  Special,
}

enum Semester {
  First,
  Second,
}

enum Grade {
  Excellent = 5,
  Good = 4,
  Satisfactory = 3,
  Unsatisfactory = 2,
}

enum Faculty {
  ComputerScience,
  Economics,
  Law,
  Engineering,
}

interface Student {
  id: number;
  fullName: string;
  faculty: Faculty;
  year: number;
  status: StudentStatus;
  enrollmentDate: Date;
  groupNumber: string;
}

interface Course {
  id: number;
  name: string;
  type: CourseType;
  credits: number;
  semester: Semester;
  faculty: Faculty;
  maxStudents: number;
}

interface StudentGrade {
  studentId: number;
  courseId: number;
  grade: Grade;
  date: Date;
  semester: Semester;
}

class UniversityManagement {
  private students: Map<number, Student> = new Map();
  private courses: Map<number, Course> = new Map();
  private grades: StudentGrade[] = [];
  private studentIdCounter = 1;
  private courseRegistrations: Map<number, Set<number>> = new Map();

  // Додавання нового студента
  addStudent(studentData: Omit<Student, 'id'>): Student {
    const student: Student = { ...studentData, id: this.studentIdCounter++ };
    this.students.set(student.id, student);
    return student;
  }

  // Додавання курсу до системи
  addCourse(course: Course): void {
    if (this.courses.has(course.id)) {
      throw new Error("Курс з таким ID вже існує");
    }
    this.courses.set(course.id, course);
  }

  // Реєстрація студента на курс
  enrollInCourse(studentId: number, courseId: number): void {
    const course = this.courses.get(courseId);
    const student = this.students.get(studentId);

    if (!course) throw new Error("Курс не знайдено");
    if (!student) throw new Error("Студента не знайдено");

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
  assignGrade(studentId: number, courseId: number, gradeValue: Grade): void {
    const courseStudents = this.courseRegistrations.get(courseId);
    if (!courseStudents || !courseStudents.has(studentId)) {
      throw new Error("Студент не зареєстрований на цей курс");
    }

    const grade: StudentGrade = {
      studentId,
      courseId,
      grade: gradeValue,
      date: new Date(),
      semester: this.courses.get(courseId)!.semester,
    };
    this.grades.push(grade);
  }

  // Оновлення статусу студента
  changeStudentStatus(studentId: number, newStatus: StudentStatus): void {
    const student = this.students.get(studentId);
    if (!student) throw new Error("Студента не знайдено");

    if (student.status === StudentStatus.Graduated || student.status === StudentStatus.Expelled) {
      throw new Error("Не можна змінити статус студента, який вже випустився або був відрахований");
    }

    student.status = newStatus;
  }

  // Отримання студентів по факультету
  listStudentsByFaculty(faculty: Faculty): Student[] {
    return Array.from(this.students.values()).filter((student) => student.faculty === faculty);
  }

  // Отримання оцінок студента
  getGradesForStudent(studentId: number): StudentGrade[] {
    return this.grades.filter((grade) => grade.studentId === studentId);
  }

  // Отримання курсів доступних для певного семестру та факультету
  getCoursesForFacultyAndSemester(faculty: Faculty, semester: Semester): Course[] {
    return Array.from(this.courses.values()).filter(
      (course) => course.faculty === faculty && course.semester === semester
    );
  }

  // Обчислення середньої оцінки для студента
  computeAverageGrade(studentId: number): number {
    const studentGrades = this.getGradesForStudent(studentId);
    if (studentGrades.length === 0) {
      throw new Error("Студент не має оцінок");
    }

    const sum = studentGrades.reduce((total, grade) => total + grade.grade, 0);
    return sum / studentGrades.length;
  }

  // Отримання списку відмінників факультету
  listHonorsStudents(faculty: Faculty): Student[] {
    return Array.from(this.students.values()).filter((student) => {
      if (student.faculty !== faculty) return false;

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
const course: Course = {
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
