export function createStudentController(studentService) {
    const getStudentById = async (c) => {
        try {
            const id = c.req.param('studentId') || c.req.param('id');
            const student = await studentService.getStudentById(parseInt(id));
            return c.json(student);
        }
        catch (error) {
            if (error instanceof Error && error.message === 'Student not found') {
                return c.json({ error: 'Student not found' }, 404);
            }
            return c.json({ error: 'Failed to fetch student' }, 500);
        }
    };
    return {
        getStudentById,
    };
}
