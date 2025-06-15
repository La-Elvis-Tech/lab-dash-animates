
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AlertEmailRequest {
  type: 'stock' | 'expiry' | 'prediction';
  title: string;
  description: string;
  item: string;
  priority: 'critical' | 'high' | 'medium';
  currentStock?: number;
  minStock?: number;
  unit?: string;
  expiryDate?: string;
  lot?: string;
  predictedDate?: string;
  adminEmail: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const alertData: AlertEmailRequest = await req.json();
    
    console.log('Enviando alerta por email:', alertData);

    let emailContent = `
      <h2>🚨 Alerta do Sistema - ${alertData.title}</h2>
      <p><strong>Tipo:</strong> ${alertData.type === 'stock' ? 'Estoque' : alertData.type === 'expiry' ? 'Vencimento' : 'Predição'}</p>
      <p><strong>Prioridade:</strong> ${alertData.priority}</p>
      <p><strong>Item:</strong> ${alertData.item}</p>
      <p><strong>Descrição:</strong> ${alertData.description}</p>
    `;

    if (alertData.currentStock && alertData.minStock) {
      emailContent += `
        <p><strong>Estoque Atual:</strong> ${alertData.currentStock} ${alertData.unit || 'unidades'}</p>
        <p><strong>Estoque Mínimo:</strong> ${alertData.minStock} ${alertData.unit || 'unidades'}</p>
      `;
    }

    if (alertData.expiryDate) {
      emailContent += `<p><strong>Data de Vencimento:</strong> ${alertData.expiryDate}</p>`;
    }

    if (alertData.lot) {
      emailContent += `<p><strong>Lote:</strong> ${alertData.lot}</p>`;
    }

    if (alertData.predictedDate) {
      emailContent += `<p><strong>Data Prevista de Ruptura:</strong> ${alertData.predictedDate}</p>`;
    }

    emailContent += `
      <br>
      <p><em>Este é um alerta automático do Sistema de Gestão La Elvis Tech.</em></p>
      <p><em>Data/Hora: ${new Date().toLocaleString('pt-BR')}</em></p>
    `;

    const emailResponse = await resend.emails.send({
      from: "La Elvis Tech <alerts@dasalabs.com>",
      to: [alertData.adminEmail],
      subject: `🚨 ${alertData.priority.toUpperCase()} - ${alertData.title}`,
      html: emailContent,
    });

    console.log("Email de alerta enviado:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Erro ao enviar email de alerta:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
