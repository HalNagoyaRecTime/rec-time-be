// src/services/EmailService.ts
export interface EmailServiceFunctions {
  sendErrorEmail: (error: {
    studentNum?: string;
    errorType: string;
    errorMessage: string;
    stackTrace?: string;
    timestamp: string;
    userAgent?: string;
    url?: string;
  }) => Promise<void>;
}

export function createEmailService(): EmailServiceFunctions {
  return {
    // -------------------------
    // sendErrorEmail
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
        // Cloudflare Workers에서 메일 전송 (예: Resend, SendGrid 등)
        const emailData = {
          to: 'admin@example.com', // 관리자 이메일
          subject: `🚨 PWA 에러 발생 - ${error.errorType}`,
          html: `
            <h2>🚨 PWA 에러 리포트</h2>
            <table border="1" style="border-collapse: collapse; width: 100%;">
              <tr>
                <td style="padding: 8px; background-color: #f5f5f5;"><strong>학번</strong></td>
                <td style="padding: 8px;">${error.studentNum || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; background-color: #f5f5f5;"><strong>에러 타입</strong></td>
                <td style="padding: 8px;">${error.errorType}</td>
              </tr>
              <tr>
                <td style="padding: 8px; background-color: #f5f5f5;"><strong>에러 메시지</strong></td>
                <td style="padding: 8px;">${error.errorMessage}</td>
              </tr>
              <tr>
                <td style="padding: 8px; background-color: #f5f5f5;"><strong>발생 시간</strong></td>
                <td style="padding: 8px;">${error.timestamp}</td>
              </tr>
              <tr>
                <td style="padding: 8px; background-color: #f5f5f5;"><strong>URL</strong></td>
                <td style="padding: 8px;">${error.url || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; background-color: #f5f5f5;"><strong>User Agent</strong></td>
                <td style="padding: 8px;">${error.userAgent || 'N/A'}</td>
              </tr>
            </table>
            ${error.stackTrace ? `
              <h3>스택 트레이스:</h3>
              <pre style="background-color: #f8f8f8; padding: 10px; border-radius: 4px; overflow-x: auto;">
                ${error.stackTrace}
              </pre>
            ` : ''}
          `,
        };

        // 실제 메일 전송 구현 (Resend 예시)
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailData),
        });

        if (!response.ok) {
          throw new Error(`메일 전송 실패: ${response.status}`);
        }

        console.log('📧 에러 메일 전송 완료');
      } catch (error) {
        console.error('📧 메일 전송 실패:', error);
        // 메일 전송 실패해도 앱이 중단되지 않도록
      }
    },
  };
}
