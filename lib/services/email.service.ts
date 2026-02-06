/**
 * Email Service
 * Handles sending emails via Vercel serverless API
 */

export interface ActivationEmailData {
    to: string;
    name: string;
    billValue?: string;
}

export class EmailService {
    private static apiUrl = '/api/send-email';

    /**
     * Send activation email to newly approved client
     */
    static async sendActivationEmail(data: ActivationEmailData): Promise<boolean> {
        try {
            console.log('[EmailService] Sending activation email to:', data.to);

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('[EmailService] Failed to send email:', error);
                return false;
            }

            const result = await response.json();
            console.log('[EmailService] Email sent successfully:', result.messageId);
            return true;

        } catch (error) {
            console.error('[EmailService] Error sending email:', error);
            return false;
        }
    }
}
