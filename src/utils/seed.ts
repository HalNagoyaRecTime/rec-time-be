import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('シードデータを投入中...')

  // 学生データ
  const students = [
    {
      studentId: 20001,
      classCode: '1A',
      attendanceNumber: 1,
      name: '田中太郎'
    },
    {
      studentId: 20002,
      classCode: '1A',
      attendanceNumber: 2,
      name: '佐藤花子'
    },
    {
      studentId: 20003,
      classCode: '1B',
      attendanceNumber: 1,
      name: '鈴木一郎'
    },
    {
      studentId: 20004,
      classCode: '1B',
      attendanceNumber: 2,
      name: '高橋美咲'
    },
    {
      studentId: 20005,
      classCode: '2A',
      attendanceNumber: 1,
      name: '山田健太'
    }
  ]

  for (const student of students) {
    await prisma.student.upsert({
      where: { studentId: student.studentId },
      update: {},
      create: student,
    })
    console.log(`学生を登録: ${student.name} (${student.studentId})`)
  }

  // レクリエーションデータ
  const recreations = [
    {
      title: 'スポーツフェスティバル',
      description: '年次恒例の体育祭です',
      location: '体育館',
      startDatetime: new Date('2024-05-15T09:00:00Z'),
      endDatetime: new Date('2024-05-15T17:00:00Z'),
      maxParticipants: 100,
      status: 'scheduled'
    },
    {
      title: '文化祭',
      description: '学生による文化祭の開催',
      location: '学校全体',
      startDatetime: new Date('2024-06-20T10:00:00Z'),
      endDatetime: new Date('2024-06-20T16:00:00Z'),
      maxParticipants: 200,
      status: 'scheduled'
    },
    {
      title: 'ゲーム大会',
      description: 'eスポーツとボードゲームの大会',
      location: '第2教室',
      startDatetime: new Date('2024-07-10T13:00:00Z'),
      endDatetime: new Date('2024-07-10T18:00:00Z'),
      maxParticipants: 50,
      status: 'scheduled'
    }
  ]

  const createdRecreations = []
  for (const recreation of recreations) {
    const created = await prisma.recreation.create({
      data: recreation
    })
    createdRecreations.push(created)
    console.log(`レクリエーションを登録: ${recreation.title} (ID: ${created.recreationId})`)
  }

  // 参加データ
  const participations = [
    { studentId: 20001, recreationId: createdRecreations[0].recreationId, status: 'registered' },
    { studentId: 20002, recreationId: createdRecreations[0].recreationId, status: 'registered' },
    { studentId: 20003, recreationId: createdRecreations[1].recreationId, status: 'registered' },
    { studentId: 20004, recreationId: createdRecreations[1].recreationId, status: 'registered' },
    { studentId: 20005, recreationId: createdRecreations[2].recreationId, status: 'registered' },
    { studentId: 20001, recreationId: createdRecreations[2].recreationId, status: 'registered' },
  ]

  for (const participation of participations) {
    await prisma.participation.upsert({
      where: {
        studentId_recreationId: {
          studentId: participation.studentId,
          recreationId: participation.recreationId
        }
      },
      update: {},
      create: participation
    })
    console.log(`参加登録: 学生ID ${participation.studentId} → レクリエーションID ${participation.recreationId}`)
  }

  console.log('シードデータの投入が完了しました！')
}

main()
  .catch((e) => {
    console.error(e)
  })
