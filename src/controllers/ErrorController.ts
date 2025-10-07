// src/controllers/ErrorController.ts
import { Context } from 'hono';
import { EmailServiceFunctions } from '../services/EmailService';

/**
 * 🔧 ErrorControllerFunctions インターフェース
 * - フロントエンドから送信されたエラーレポートを受信し、
 *   メールとして管理者に転送する。
 * - 프론트엔드에서 전송된 에러 리포트를 받아 관리자의 이메일로 전송.
 */
export interface ErrorControllerFunctions {
  reportError: (c: Context) => Promise<Response>;
}

/**
 * 📩 ErrorController 実装
 * - メール送信サービス(EmailService)を使用して、
 *   API経由でエラーレポートを送信。
 * - EmailService를 통해 백엔드에서 메일을 전송하는 컨트롤러.
 */
export function createErrorController(
  emailService: EmailServiceFunctions
): ErrorControllerFunctions {
  return {
    /**
     * ---------------------------------------------------------
     * reportError()
     * ---------------------------------------------------------
     * 📥 エラーレポート受信エンドポイント
     * ルート: POST /api/error/report
     *
     * ✅ 受信内容:
     * - studentNum : 学籍番号 / 학번
     * - errorType : エラーの種類 / 에러 종류
     * - errorMessage : エラーメッセージ / 에러 메시지
     * - stackTrace : スタックトレース / 스택 트레이스
     * - userAgent : ブラウザ情報 / 브라우저 정보
     * - url : 発生ページのURL / 발생 페이지 URL
     *
     * ✅ 処理内容:
     * - 上記の情報をメール形式で管理者に転送
     * - 오류 정보를 메일로 관리자에게 전송
     * ---------------------------------------------------------
     */
    reportError: async (c: Context) => {
      try {
        // 요청 JSON 파싱 / リクエストのJSONを取得
        const body = await c.req.json();
        const {
          studentNum,
          errorType,
          errorMessage,
          stackTrace,
          userAgent,
          url,
        } = body;

        // 📧 メール送信（エラーメール送信処理）
        // 📧 에러 메일 전송 처리
        await emailService.sendErrorEmail({
          studentNum,
          errorType: errorType || 'Unknown Error',
          errorMessage: errorMessage || 'No error message provided',
          stackTrace,
          timestamp: new Date().toISOString(),
          userAgent: userAgent || c.req.header('User-Agent'),
          url: url || c.req.url,
        });

        // ✅ 정상 응답 반환 / 正常レスポンスを返す
        return c.json({
          success: true,
          message: '✅ エラーレポートが送信されました。', // 에러 리포트가 전송되었습니다.
        });
      } catch (error) {
        // ❌ エラー発生時の処理 / 오류 발생 시 처리
        console.error('❌ [ErrorController] メール送信失敗:', error);
        return c.json(
          {
            error: '⚠️ エラーレポートの転送に失敗しました。', // 에러 리포트 전송에 실패했습니다.
          },
          500
        );
      }
    },
  };
}
