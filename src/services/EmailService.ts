// src/services/EmailService.ts
export interface EmailServiceFunctions {
  sendErrorEmail: (error: {
    studentNum?: string; // 학번 / 学籍番号
    errorType: string; // 에러 종류 / エラーの種類
    errorMessage: string; // 에러 메시지 / エラーメッセージ
    stackTrace?: string; // 스택 트레이스 / スタックトレース
    timestamp: string; // 발생 시각 / 発生時刻
    userAgent?: string; // 브라우저 정보 / ユーザーエージェント情報
    url?: string; // 발생한 페이지 URL / 発生ページのURL
  }) => Promise<void>;
}

export function createEmailService(): EmailServiceFunctions {
  return {
    // -------------------------
    // sendErrorEmail (에러 메일 전송 / エラーメール送信)
    // -------------------------
    async sendErrorEmail(error: {
      studentNum?: string;
      errorType: string;
      errorMessage: string;
      stackTrace?: string;
      timestamp: string;
      userAgent?: string;
      url?: string;
    }): Promise<void> {
      try {
        // Cloudflare Workers에서 메일 전송 (Resend API 사용)
        // Cloudflare Workersでメールを送信（Resend APIを使用）
        const emailData = {
          to: 'ellan1223@naver.com', // 📨 너의 메일 주소 / あなたのメールアドレス
          subject: `🚨 PWA エラー発生 - ${error.errorType}`, // 메일 제목 / メール件名
          html: `
            <h2>🚨 PWA エラーレポート</h2>
            <table border="1" style="border-collapse: collapse; width: 100%;">
              <tr>
                <td style="padding: 8px; background-color: #f5f5f5;"><strong>学籍番号 / 학번</strong></td>
                <td style="padding: 8px;">${error.studentNum || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; background-color: #f5f5f5;"><strong>エラー種別 / 에러 타입</strong></td>
                <td style="padding: 8px;">${error.errorType}</td>
              </tr>
              <tr>
                <td style="padding: 8px; background-color: #f5f5f5;"><strong>エラーメッセージ / 에러 메시지</strong></td>
                <td style="padding: 8px;">${error.errorMessage}</td>
              </tr>
              <tr>
                <td style="padding: 8px; background-color: #f5f5f5;"><strong>発生時刻 / 발생 시간</strong></td>
                <td style="padding: 8px;">${error.timestamp}</td>
              </tr>
              <tr>
                <td style="padding: 8px; background-color: #f5f5f5;"><strong>URL</strong></td>
                <td style="padding: 8px;">${error.url || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; background-color: #f5f5f5;"><strong>User Agent / 사용자 브라우저 정보</strong></td>
                <td style="padding: 8px;">${error.userAgent || 'N/A'}</td>
              </tr>
            </table>
            ${
              error.stackTrace
                ? `
              <h3>スタックトレース / 스택 트레이스:</h3>
              <pre style="background-color: #f8f8f8; padding: 10px; border-radius: 4px; overflow-x: auto;">
                ${error.stackTrace}
              </pre>
            `
                : ''
            }
          `,
        };

        // 실제 메일 전송 (Resend API 사용 예시)
        // 実際のメール送信処理（Resend APIの例）
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`, // Resend API 키 / Resend APIキー
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailData),
        });

        if (!response.ok) {
          throw new Error(
            `メール送信失敗 / 메일 전송 실패: ${response.status}`
          );
        }

        console.log('📧 エラーメール送信完了 / 에러 메일 전송 완료');
      } catch (error) {
        console.error('📧 メール送信エラー / 메일 전송 실패:', error);
        // 메일 전송 실패 시 앱 중단 방지 / メール送信失敗時もアプリが停止しないように
      }
    },
  };
}
