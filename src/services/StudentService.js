export function createStudentService(studentRepository) {
    return {
        async getStudentById(id) {
            const student = await studentRepository.findById(id);
            if (!student) {
                throw new Error('Student not found');
            }
            return student;
        },
    };
}
