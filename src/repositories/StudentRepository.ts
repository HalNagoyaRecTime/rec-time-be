import { PrismaClient } from '@prisma/client';

export function createStudentRepository(prisma: PrismaClient) {
  return {
    async findById(id: number) {
      return prisma.student.findUnique({
        where: { studentId: id },
      });
    },
  };
}
