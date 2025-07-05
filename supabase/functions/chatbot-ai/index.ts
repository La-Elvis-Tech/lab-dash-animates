import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Chatbot function called')
    
    if (!PERPLEXITY_API_KEY) {
      throw new Error('PERPLEXITY_API_KEY not found')
    }

    const { message, conversationId, userId } = await req.json()
    console.log('Request data:', { messageLength: message?.length, conversationId, userId })

    // Criar ou buscar conversa
    let conversation
    if (conversationId) {
      const { data } = await supabaseClient
        .from('chat_conversations')
        .select('*')
        .eq('id', conversationId)
        .single()
      conversation = data
    } else {
      const { data, error } = await supabaseClient
        .from('chat_conversations')
        .insert({
          user_id: userId,
          title: message.substring(0, 50) + '...'
        })
        .select()
        .single()
      
      if (error) throw error
      conversation = data
    }

    // Buscar histórico da conversa
    const { data: messageHistory } = await supabaseClient
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true })
      .limit(10)

    // Preparar contexto da conversa
    const conversationContext = messageHistory?.map(msg => 
      `${msg.sender === 'user' ? 'Usuário' : 'Assistente'}: ${msg.content}`
    ).join('\n') || ''

    // Salvar mensagem do usuário
    await supabaseClient
      .from('chat_messages')
      .insert({
        conversation_id: conversation.id,
        content: message,
        sender: 'user'
      })

    // Preparar prompt especializado para laboratório
    const systemPrompt = `Você é um assistente especializado em gestão laboratorial da DASA, com expertise em:
- Inventário de reagentes e materiais médicos
- Agendamento de exames e procedimentos
- Compliance HIPAA/LGPD e segurança
- Análise de dados laboratoriais
- Otimização de processos

Contexto da conversa anterior:
${conversationContext}

Responda de forma precisa, técnica quando necessário, mas sempre clara e útil. Se não souber algo específico sobre os dados do sistema, sugira como o usuário pode encontrar a informação ou que tipo de consulta SQL seria útil.`

    // Chamar API da Perplexity
    console.log('Calling Perplexity API with model: sonar-deep-research')
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-deep-research',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 1000,
        return_images: false,
        return_related_questions: false,
        frequency_penalty: 1,
        presence_penalty: 0
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Perplexity API error:', response.status, errorText)
      throw new Error(`Perplexity API error: ${response.status} - ${errorText}`)
    }

    const aiResponse = await response.json()
    const aiMessage = aiResponse.choices[0].message.content

    // Salvar resposta da IA
    await supabaseClient
      .from('chat_messages')
      .insert({
        conversation_id: conversation.id,
        content: aiMessage,
        sender: 'assistant'
      })

    // Atualizar timestamp da conversa
    await supabaseClient
      .from('chat_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversation.id)

    // Detectar se precisa de consulta SQL
    const needsSQL = aiMessage.toLowerCase().includes('consulta sql') || 
                     aiMessage.toLowerCase().includes('query') ||
                     message.toLowerCase().includes('dados') ||
                     message.toLowerCase().includes('relatório')

    return new Response(
      JSON.stringify({
        response: aiMessage,
        conversationId: conversation.id,
        needsSQL,
        suggestions: needsSQL ? [
          "Gerar consulta SQL para este dados",
          "Ver relatório detalhado",
          "Exportar dados para análise"
        ] : []
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Chatbot error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})