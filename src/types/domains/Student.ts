export interface StudentEntity {
  studentId: number;
  classCode: string;
  attendanceNumber: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentDTO {
  studentId: string;
  class: string;
  attendanceNumber: string;
  name: string;
}
