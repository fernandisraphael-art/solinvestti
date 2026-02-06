import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, name, billValue } = req.body;

    if (!to || !name) {
      return res.status(400).json({ error: 'Missing required fields: to, name' });
    }

    // Initialize Resend with API key
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Email HTML template
    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo à Solinvestti</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">
                SOLINVESTTI
              </h1>
              <p style="margin: 8px 0 0; color: #10b981; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">
                Digital Energy Wealth
              </p>
            </td>
          </tr>

          <!-- Success Icon -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 40px;">✓</span>
              </div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <h2 style="margin: 0 0 20px; color: #0f172a; font-size: 24px; font-weight: 700; text-align: center;">
                Cadastro Aprovado!
              </h2>
              
              <p style="margin: 0 0 20px; color: #475569; font-size: 16px; line-height: 1.6;">
                Olá <strong style="color: #0f172a;">${name}</strong>,
              </p>
              
              <p style="margin: 0 0 20px; color: #475569; font-size: 16px; line-height: 1.6;">
                É com grande satisfação que informamos que seu cadastro na <strong style="color: #10b981;">Solinvestti</strong> foi aprovado! 🎉
              </p>

              <p style="margin: 0 0 30px; color: #475569; font-size: 16px; line-height: 1.6;">
                Agora você pode acessar nosso marketplace e escolher a melhor geradora de energia solar para o seu perfil de consumo${billValue ? ` de <strong style="color: #10b981;">R$ ${billValue}</strong>` : ''}.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="https://solinvestti.com.br/#/marketplace" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 700; font-size: 14px; letter-spacing: 0.5px; text-transform: uppercase; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                      Acessar Marketplace
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Next Steps -->
              <div style="background-color: #f1f5f9; border-radius: 16px; padding: 24px; margin: 30px 0;">
                <h3 style="margin: 0 0 16px; color: #0f172a; font-size: 16px; font-weight: 700;">
                  Próximos Passos:
                </h3>
                <ol style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.8;">
                  <li>Acesse o marketplace através do link acima</li>
                  <li>Compare as geradoras disponíveis para sua região</li>
                  <li>Escolha a opção com melhor desconto</li>
                  <li>Simule sua economia mensal e anual</li>
                  <li>Finalize sua adesão</li>
                </ol>
              </div>

              <p style="margin: 30px 0 0; color: #64748b; font-size: 14px; line-height: 1.6; text-align: center;">
                Dúvidas? Entre em contato conosco através do e-mail<br>
                <a href="mailto:contato@solinvestti.com.br" style="color: #10b981; text-decoration: none; font-weight: 600;">contato@solinvestti.com.br</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px; color: #94a3b8; font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">
                Solinvestti
              </p>
              <p style="margin: 0; color: #cbd5e1; font-size: 11px;">
                © 2026 Solinvestti. Todos os direitos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Send email using Resend
    const data = await resend.emails.send({
      from: 'Solinvestti <onboarding@resend.dev>',
      to: [to],
      subject: 'Bem-vindo à Solinvestti - Cadastro Aprovado! ✅',
      html: htmlContent,
    });

    console.log('Email sent via Resend:', data.id);
    return res.status(200).json({ success: true, messageId: data.id });

  } catch (error: any) {
    console.error('Email sending error:', error);
    return res.status(500).json({
      error: 'Failed to send email',
      details: error.message
    });
  }
}
