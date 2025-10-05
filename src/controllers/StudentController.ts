import { Context } from 'hono';
import { StudentServiceFunctions } from '../types/services';
import { StudentControllerFunctions } from '../types/controllers';
import { DownloadLogServiceFunctions } from '../services/DownloadLogService';

export function createStudentController(
  studentService: StudentServiceFunctions,
  downloadLogService: DownloadLogServiceFunctions
): StudentControllerFunctions {
  return {
    // 🔹 학생 ID로 조회
    getStudentById: async (c: Context) => {
      try {
        const id = c.req.param('studentId') || c.req.param('id');
        const student = await studentService.getStudentById(parseInt(id));
        return c.json(student);
      } catch (error) {
        console.error('[getStudentById] error =', error);
        if (error instanceof Error && error.message === 'Student not found') {
          return c.json({ error: 'Student not found' }, 404);
        }
        return c.json({ error: 'Failed to fetch student' }, 500);
      }
    },

    // 🔹 학번으로 학생 조회
    getStudentByStudentNum: async (c: Context) => {
      try {
        const studentNum = c.req.param('studentNum');
        const student = await studentService.getStudentByStudentNum(studentNum);
        return c.json(student);
      } catch (error) {
        console.error('[getStudentByStudentNum] error =', error);
        if (error instanceof Error && error.message === 'Student not found') {
          return c.json({ error: 'Student not found' }, 404);
        }
        return c.json({ error: 'Failed to fetch student' }, 500);
      }
    },

    // 🔒 보안 강화: 학번 + 생년월일로 학생 조회
    getStudentByStudentNumAndBirthday: async (c: Context) => {
      try {
        const studentNum = c.req.param('studentNum');
        const birthday = c.req.param('birthday');
        
        // 학번 형식 검증 / 学籍番号形式検証
        if (!studentNum || !/^\d+$/.test(studentNum)) {
          // 로그 등록: 실패 / ログ登録: 失敗
          await downloadLogService.logStudentDataDownload(studentNum, false);
          return c.json({ 
            error: '学籍番号が間違っています。数字のみ入力してください。', 
            code: 'INVALID_STUDENT_NUM',
            details: '学籍番号は数字のみで構成されている必要があります。'
          }, 400);
        }
        
        // 생년월일 형식 검증 / 生年月日形式検証
        if (!birthday || !/^\d{8}$/.test(birthday)) {
          // 로그 등록: 실패 / ログ登録: 失敗
          await downloadLogService.logStudentDataDownload(studentNum, false);
          return c.json({ 
            error: '生年月日が間違っています。8桁の数字で入力してください。', 
            code: 'INVALID_BIRTHDAY',
            details: '生年月日はYYYYMMDD形式の8桁数字である必要があります。'
          }, 400);
        }
        
        const student = await studentService.getStudentByStudentNumAndBirthday(studentNum, birthday);
        
        if (!student) {
          // 로그 등록: 실패 / ログ登録: 失敗
          await downloadLogService.logStudentDataDownload(studentNum, false);
          return c.json({ 
            error: '学籍番号または生年月日が間違っています。', 
            code: 'STUDENT_NOT_FOUND',
            details: '入力された学籍番号と生年月日が一致する学生が見つかりません。'
          }, 404);
        }
        
        // 로그 등록: 성공 / ログ登録: 成功
        await downloadLogService.logStudentDataDownload(studentNum, true);
        
        return c.json(student);
      } catch (error) {
        console.error('[getStudentByStudentNumAndBirthday] error =', error);
        // 로그 등록: 실패 / ログ登録: 失敗
        try {
          const studentNum = c.req.param('studentNum');
          await downloadLogService.logStudentDataDownload(studentNum, false);
        } catch (logError) {
          console.error('[log error] error =', logError);
        }
        return c.json({ 
          error: '学生情報の取得中にエラーが発生しました。', 
          code: 'INTERNAL_ERROR',
          details: 'サーバー内部エラーが発生しました。しばらくしてから再度お試しください。'
        }, 500);
      }
    },

    // 🔹 학번 기준 기본 페이로드 (학생 + 이벤트 + 내 출전 여부 flag)
    getStudentPayloadByStudentNum: async (c: Context) => {
      try {
        const studentNum = c.req.param('studentNum');
        if (!studentNum)
          return c.json({ error: 'studentNum is required' }, 400);

        const payload =
          await studentService.getStudentPayloadByStudentNum(studentNum);
        return c.json(payload);
      } catch (error) {
        console.error('[getStudentPayloadByStudentNum] error =', error);
        if (error instanceof Error && error.message === 'Student not found') {
          return c.json({ error: 'Student not found' }, 404);
        }
        return c.json({ error: 'Failed to fetch student payload' }, 500);
      }
    },

    // 🔹 학번 기준 풀 페이로드 (학생 + 엔트리 + 이벤트 + 그룹 + 알림 + 변경 로그)
    getStudentFullPayload: async (c: Context) => {
      try {
        const studentNum = c.req.param('studentNum');
        if (!studentNum)
          return c.json({ error: 'studentNum is required' }, 400);

        const payload = await studentService.getStudentFullPayload(studentNum);
        return c.json(payload);
      } catch (error) {
        console.error('[getStudentFullPayload] error =', error);
        if (error instanceof Error && error.message === 'Student not found') {
          return c.json({ error: 'Student not found' }, 404);
        }
        return c.json({ error: 'Failed to fetch full student payload' }, 500);
      }
    },
  };
}
