
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OTPEmailRequest {
  code: string;
  userEmail: string;
  adminEmail: string;
  type: 'login' | 'signup' | 'password_reset';
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, userEmail, adminEmail, type }: OTPEmailRequest = await req.json();
    
    console.log('Enviando código OTP por email:', { userEmail, adminEmail, type });

    const typeNames = {
      login: 'Login',
      signup: 'Cadastro',
      password_reset: 'Redefinição de Senha'
    };

    const emailContent = `
      <h2>🔐 Código de Verificação OTP</h2>
      <p><strong>Usuário:</strong> ${userEmail}</p>
      <p><strong>Tipo:</strong> ${typeNames[type]}</p>
      <p><strong>Código:</strong> <span style="font-size: 24px; font-weight: bold; color: #2563eb;">${code}</span></p>
      <p><em>Este código é válido por 10 minutos.</em></p>
      <br>
      <p><em>Data/Hora: ${new Date().toLocaleString('pt-BR')}</em></p>
    `;

    const emailResponse = await resend.emails.send({
      from: "La Elvis Tech <auth@dasalabs.com>",
      to: [adminEmail],
      subject: `🔐 Código OTP - ${typeNames[type]} para ${userEmail}`,
      html: emailContent,
    });

    console.log("Email OTP enviado:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Erro ao enviar email OTP:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
