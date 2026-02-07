import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Microsoft Graph Email API
 * Envia emails via Office 365/Outlook usando credenciais de aplicativo (client_credentials)
 * 
 * Variáveis de ambiente necessárias:
 * - TENANT_ID: Azure AD Tenant ID
 * - CLIENT_ID: App Registration Client ID  
 * - CLIENT_SECRET: App Registration Client Secret
 * - EMAIL_FROM: Email do remetente (deve ter permissão Mail.Send)
 */

// Interface para o payload do email
interface EmailPayload {
    to: string;
    subject: string;
    html: string;
}

// Obtém token de acesso via OAuth2 client_credentials
async function getAccessToken(): Promise<string> {
    const tenantId = process.env.TENANT_ID;
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;

    if (!tenantId || !clientId || !clientSecret) {
        throw new Error('Missing Azure AD credentials (TENANT_ID, CLIENT_ID, CLIENT_SECRET)');
    }

    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

    const params = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials'
    });

    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('[Graph API] Token request failed:', errorData);
        throw new Error(`Token request failed: ${errorData.error_description || response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
}

// Envia email via Microsoft Graph API
async function sendEmailViaGraph(payload: EmailPayload): Promise<void> {
    const emailFrom = process.env.EMAIL_FROM;

    if (!emailFrom) {
        throw new Error('Missing EMAIL_FROM environment variable');
    }

    const accessToken = await getAccessToken();

    const graphUrl = `https://graph.microsoft.com/v1.0/users/${emailFrom}/sendMail`;

    const emailBody = {
        message: {
            subject: payload.subject,
            body: {
                contentType: 'HTML',
                content: payload.html
            },
            toRecipients: [
                {
                    emailAddress: {
                        address: payload.to
                    }
                }
            ]
        },
        saveToSentItems: true
    };

    const response = await fetch(graphUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailBody)
    });

    if (!response.ok) {
        let errorData: any = {};
        try {
            errorData = await response.json();
        } catch {
            errorData = { message: response.statusText };
        }
        console.error('[Graph API] Send email failed:', errorData);
        throw new Error(`Send email failed: ${errorData.error?.message || response.statusText}`);
    }

    console.log(`[Graph API] Email sent successfully to ${payload.to}`);
}

// Template: Cliente Ativado
function getClientActivationTemplate(recipientName: string): { subject: string; html: string } {
    return {
        subject: 'Cadastro aprovado na Solinvestti ✅',
        html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f8fafc;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800;">SOLINVESTTI</h1>
                            <p style="margin: 8px 0 0; color: #10b981; font-size: 11px; font-weight: 600; letter-spacing: 2px;">DIGITAL ENERGY WEALTH</p>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <div style="text-align: center; margin-bottom: 30px;">
                                <span style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; line-height: 60px; color: white; font-size: 30px;">✓</span>
                            </div>
                            <h2 style="margin: 0 0 20px; color: #0f172a; font-size: 24px; text-align: center;">Cadastro Aprovado!</h2>
                            <p style="color: #475569; font-size: 16px; line-height: 1.6;">Olá <strong>${recipientName}</strong>,</p>
                            <p style="color: #475569; font-size: 16px; line-height: 1.6;">É com grande satisfação que informamos que seu cadastro na <strong style="color: #10b981;">Solinvestti</strong> foi aprovado!</p>
                            <p style="color: #475569; font-size: 16px; line-height: 1.6;">Agora você pode acessar nosso marketplace e escolher a melhor geradora de energia solar para o seu perfil de consumo.</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="https://solinvestti.com.br/#/marketplace" style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 700; font-size: 14px;">ACESSAR MARKETPLACE</a>
                            </div>
                            <p style="color: #64748b; font-size: 14px; text-align: center;">Dúvidas? <a href="mailto:contato@solinvestti.com.br" style="color: #10b981;">contato@solinvestti.com.br</a></p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0; color: #94a3b8; font-size: 12px;">© 2026 Solinvestti. Todos os direitos reservados.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`
    };
}

// Template: Usina Ativada
function getGeneratorActivationTemplate(generatorName: string): { subject: string; html: string } {
    return {
        subject: 'Usina aprovada na Solinvestti ⚡',
        html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f8fafc;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800;">SOLINVESTTI</h1>
                            <p style="margin: 8px 0 0; color: #10b981; font-size: 11px; font-weight: 600; letter-spacing: 2px;">DIGITAL ENERGY WEALTH</p>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <div style="text-align: center; margin-bottom: 30px;">
                                <span style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 50%; line-height: 60px; color: white; font-size: 30px;">⚡</span>
                            </div>
                            <h2 style="margin: 0 0 20px; color: #0f172a; font-size: 24px; text-align: center;">Usina Aprovada!</h2>
                            <p style="color: #475569; font-size: 16px; line-height: 1.6;">Olá,</p>
                            <p style="color: #475569; font-size: 16px; line-height: 1.6;">Temos o prazer de informar que a usina <strong style="color: #10b981;">${generatorName}</strong> foi aprovada e já está disponível para operar na plataforma <strong>Solinvestti</strong>.</p>
                            <p style="color: #475569; font-size: 16px; line-height: 1.6;">A partir de agora, sua usina aparecerá no marketplace e poderá receber adesões de clientes interessados em energia limpa.</p>
                            <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin: 20px 0;">
                                <h3 style="margin: 0 0 12px; color: #0f172a; font-size: 14px;">Próximos passos:</h3>
                                <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.8;">
                                    <li>Verifique se os dados cadastrados estão corretos</li>
                                    <li>Acompanhe as adesões pelo painel de gestão</li>
                                    <li>Entre em contato conosco em caso de dúvidas</li>
                                </ul>
                            </div>
                            <p style="color: #64748b; font-size: 14px; text-align: center;">Dúvidas? <a href="mailto:contato@solinvestti.com.br" style="color: #10b981;">contato@solinvestti.com.br</a></p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0; color: #94a3b8; font-size: 12px;">© 2026 Solinvestti. Todos os direitos reservados.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`
    };
}

// Template: Notificação Admin
function getAdminNotificationTemplate(data: any): { subject: string; html: string } {
    const adminLink = `https://solinvestti.vercel.app/#/admin`; // Link fixo para produção conforme solicitado
    const typeLabel = data.type === 'geradora' ? 'Geradora' :
        data.type === 'empresa' ? 'Empresa' : 'Residencial';

    const color = data.type === 'geradora' ? '#f59e0b' : '#3b82f6'; // Amarelo ou Azul

    return {
        subject: `Novo cadastro no Solinvestti — ${typeLabel} — ${data.name}`,
        html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f8fafc;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800;">NOVO CADASTRO</h1>
                            <p style="margin: 8px 0 0; color: ${color}; font-size: 14px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">${typeLabel}</p>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding-bottom: 20px; border-bottom: 1px solid #e2e8f0;">
                                        <p style="margin: 0 0 5px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Nome</p>
                                        <p style="margin: 0; color: #0f172a; font-size: 16px; font-weight: 600;">${data.name}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 20px 0; border-bottom: 1px solid #e2e8f0;">
                                        <p style="margin: 0 0 5px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Email</p>
                                        <p style="margin: 0; color: #0f172a; font-size: 16px;">${data.email}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 20px 0; border-bottom: 1px solid #e2e8f0;">
                                        <p style="margin: 0 0 5px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Telefone</p>
                                        <p style="margin: 0; color: #0f172a; font-size: 16px;">${data.phone || 'Não informado'}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 20px 0; border-bottom: 1px solid #e2e8f0;">
                                        <p style="margin: 0 0 5px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Localização</p>
                                        <p style="margin: 0; color: #0f172a; font-size: 16px;">${data.city || '-'} / ${data.state || '-'}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 20px 0;">
                                        <p style="margin: 0 0 5px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Detalhes do Sistema</p>
                                        <p style="margin: 0; color: #64748b; font-size: 13px; font-family: monospace;">ID: ${data.id}</p>
                                        <p style="margin: 5px 0 0; color: #64748b; font-size: 13px;">Data: ${new Date().toLocaleString('pt-BR')}</p>
                                    </td>
                                </tr>
                            </table>

                            <div style="text-align: center; margin-top: 30px;">
                                <a href="${adminLink}" style="display: inline-block; background: #0f172a; color: white; text-decoration: none; padding: 16px 30px; border-radius: 12px; font-weight: 700; font-size: 14px;">ACESSAR PAINEL ADMIN</a>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`
    };
}

// Handler principal
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Apenas POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { to, type, recipientName, customSubject, customBody, signupData } = req.body;

        // Validação de tipo
        if (!type || !['client', 'generator', 'admin_notification'].includes(type)) {
            return res.status(400).json({ error: 'Missing or invalid field: type' });
        }

        // Seleciona template
        let emailTemplate: { subject: string; html: string };
        let finalTo = to;

        if (type === 'admin_notification') {
            // Segurança: Forçar envio para o email do admin (configurado no ENV ou fixo)
            const adminEmail = process.env.EMAIL_FROM || 'contato@solinvestti.com.br';
            finalTo = adminEmail;

            if (!signupData) {
                return res.status(400).json({ error: 'Missing signupData for admin notification' });
            }
            emailTemplate = getAdminNotificationTemplate(signupData);
        } else {
            // Fluxos normais (cliente/geradora) exigem 'to'
            if (!to) {
                return res.status(400).json({ error: 'Missing required field: to' });
            }

            if (customSubject && customBody) {
                // ... (custom content logic)
                console.log('[send-email-graph] Using custom email content');
                emailTemplate = {
                    subject: customSubject,
                    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f8fafc;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800;">SOLINVESTTI</h1>
                            <p style="margin: 8px 0 0; color: #10b981; font-size: 11px; font-weight: 600; letter-spacing: 2px;">DIGITAL ENERGY WEALTH</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <p style="color: #475569; font-size: 16px; line-height: 1.8; white-space: pre-wrap;">${customBody}</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0; color: #94a3b8; font-size: 12px;">© 2026 Solinvestti. Todos os direitos reservados.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`
                };
            } else if (type === 'client') {
                emailTemplate = getClientActivationTemplate(recipientName || 'Cliente');
            } else {
                emailTemplate = getGeneratorActivationTemplate(recipientName || 'Usina');
            }
        }

        // Envia email
        await sendEmailViaGraph({
            to: finalTo,
            subject: emailTemplate.subject,
            html: emailTemplate.html
        });

        console.log(`[send-email-graph] Email de ativação (${type}) enviado para: ${to}`);

        return res.status(200).json({
            success: true,
            message: `Email de ativação enviado para ${to}`
        });

    } catch (error: any) {
        // Log detalhado do erro
        console.error('[send-email-graph] Error:', error.response?.data || error.message);

        return res.status(500).json({
            error: 'Failed to send email',
            details: error.message
        });
    }
}
