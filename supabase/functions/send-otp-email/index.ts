
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OTPEmailRequest {
  code: string;
  userEmail: string;
  adminEmail: string;
  type: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, userEmail, adminEmail, type }: OTPEmailRequest = await req.json();

    // Por enquanto, apenas log no console (você pode integrar com Resend mais tarde)
    console.log(`=== CÓDIGO OTP ===`);
    console.log(`Tipo: ${type}`);
    console.log(`Email do usuário: ${userEmail}`);
    console.log(`Código: ${code}`);
    console.log(`Email do admin: ${adminEmail}`);
    console.log(`==================`);

    // Simular envio de email (em produção, você integraria com Resend)
    // Para desenvolvimento, retornamos sucesso
    const emailResponse = {
      id: `sim_${Date.now()}`,
      status: 'sent',
      message: `Código OTP ${code} enviado para ${adminEmail}`
    };

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-otp-email function:", error);
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
