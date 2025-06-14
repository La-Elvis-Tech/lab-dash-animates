
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AlertEmailRequest {
  type: 'stock' | 'expiry' | 'prediction';
  title: string;
  description: string;
  item: string;
  priority: 'critical' | 'high' | 'medium';
  adminEmail: string;
  currentStock?: number;
  minStock?: number;
  unit?: string;
  expiryDate?: string;
  lot?: string;
  predictedDate?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const alertData: AlertEmailRequest = await req.json();
    
    console.log('Enviando email de alerta:', alertData);

    const priorityColor = {
      critical: '#dc2626',
      high: '#ea580c', 
      medium: '#ca8a04'
    };

    const typeLabel = {
      stock: 'Estoque',
      expiry: 'Vencimento',
      prediction: 'Previsão'
    };

    let detailsHtml = '';
    
    if (alertData.type === 'stock') {
      detailsHtml = `
        <p><strong>Estoque Atual:</strong> ${alertData.currentStock} ${alertData.unit || 'unidades'}</p>
        <p><strong>Estoque Mínimo:</strong> ${alertData.minStock} ${alertData.unit || 'unidades'}</p>
      `;
    } else if (alertData.type === 'expiry') {
      detailsHtml = `
        <p><strong>Data de Vencimento:</strong> ${alertData.expiryDate}</p>
        <p><strong>Lote:</strong> ${alertData.lot || 'N/A'}</p>
      `;
    } else if (alertData.type === 'prediction') {
      detailsHtml = `
        <p><strong>Data Prevista:</strong> ${alertData.predictedDate}</p>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "DASA Labs <alerts@dasalabs.com>",
      to: [alertData.adminEmail],
      subject: `🚨 Alerta ${typeLabel[alertData.type]} - ${alertData.item}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🚨 Alerta do Sistema DASA Labs</h1>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="background: ${priorityColor[alertData.priority]}; color: white; padding: 10px; border-radius: 4px; margin-bottom: 20px;">
              <h2 style="margin: 0; font-size: 18px;">
                Prioridade: ${alertData.priority.toUpperCase()} - ${typeLabel[alertData.type]}
              </h2>
            </div>
            
            <h3 style="color: #333; margin-bottom: 10px;">${alertData.title}</h3>
            <p style="color: #666; font-size: 16px; margin-bottom: 20px;">${alertData.description}</p>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
              <h4 style="color: #333; margin-top: 0;">Detalhes do Item:</h4>
              <p><strong>Item:</strong> ${alertData.item}</p>
              ${detailsHtml}
            </div>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 4px; border-left: 4px solid #2196f3;">
              <h4 style="color: #1976d2; margin-top: 0;">🔔 Ação Necessária</h4>
              <p style="margin-bottom: 0; color: #666;">
                Este alerta requer sua atenção imediata. Acesse o sistema DASA Labs para tomar as medidas necessárias.
              </p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
              <p style="color: #999; font-size: 14px; margin: 0;">
                Sistema de Gestão Laboratorial DASA Labs<br>
                Email enviado automaticamente em ${new Date().toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Email de alerta enviado:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Erro ao enviar email de alerta:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
