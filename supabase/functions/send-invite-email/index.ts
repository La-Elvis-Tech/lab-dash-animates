
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteEmailRequest {
  code: string;
  role: 'admin' | 'user' | 'supervisor';
  maxUses: number;
  expiresHours: number;
  adminEmail: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, role, maxUses, expiresHours, adminEmail }: InviteEmailRequest = await req.json();
    
    console.log('Enviando código de convite por email:', { role, maxUses, expiresHours });

    const roleNames = {
      admin: 'Administrador',
      user: 'Usuário',
      supervisor: 'Supervisor'
    };

    const emailContent = `
      <h2>📧 Código de Convite Gerado</h2>
      <p><strong>Código:</strong> <span style="font-size: 20px; font-weight: bold; color: #2563eb;">${code}</span></p>
      <p><strong>Tipo de Usuário:</strong> ${roleNames[role]}</p>
      <p><strong>Usos Máximos:</strong> ${maxUses}</p>
      <p><strong>Expira em:</strong> ${expiresHours} horas</p>
      <br>
      <p><em>Compartilhe este código com as pessoas que você deseja convidar para o sistema.</em></p>
      <p><em>Data/Hora: ${new Date().toLocaleString('pt-BR')}</em></p>
    `;

    const emailResponse = await resend.emails.send({
      from: "La Elvis Tech <invites@dasalabs.com>",
      to: [adminEmail],
      subject: `📧 Código de Convite - ${roleNames[role]}`,
      html: emailContent,
    });

    console.log("Email de convite enviado:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Erro ao enviar email de convite:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
