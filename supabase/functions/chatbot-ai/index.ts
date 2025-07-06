
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('=== CHATBOT FUNCTION START ===')
    
    // Verificar se a API Key existe
    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY')
    
    if (!PERPLEXITY_API_KEY) {
      console.error('PERPLEXITY_API_KEY not found in environment')
      return new Response(
        JSON.stringify({ 
          error: 'Configuração da API não encontrada. Verifique as configurações do sistema.',
          details: 'API key missing'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      )
    }

    // Parse request body
    let requestBody
    try {
      requestBody = await req.json()
      console.log('Request body parsed successfully:', {
        hasMessage: !!requestBody.message,
        messageLength: requestBody.message?.length,
        conversationId: requestBody.conversationId,
        userId: requestBody.userId
      })
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError)
      throw new Error('Invalid request body')
    }

    const { message, conversationId, userId } = requestBody

    if (!message || !userId) {
      console.error('Missing required fields:', { message: !!message, userId: !!userId })
      throw new Error('Message and userId are required')
    }

    // Criar ou buscar conversa
    let conversation
    if (conversationId) {
      console.log('Finding existing conversation:', conversationId)
      const { data, error } = await supabaseClient
        .from('chat_conversations')
        .select('*')
        .eq('id', conversationId)
        .single()
      
      if (error) {
        console.error('Error finding conversation:', error)
      } else {
        conversation = data
        console.log('Found existing conversation')
      }
    }
    
    if (!conversation) {
      console.log('Creating new conversation')
      const { data, error } = await supabaseClient
        .from('chat_conversations')
        .insert({
          user_id: userId,
          title: message.substring(0, 50) + (message.length > 50 ? '...' : '')
        })
        .select()
        .single()
      
      if (error) {
        console.error('Error creating conversation:', error)
        throw new Error('Failed to create conversation')
      }
      conversation = data
      console.log('Created new conversation:', conversation.id)
    }

    // Buscar histórico da conversa
    console.log('Loading message history for conversation:', conversation.id)
    const { data: messageHistory, error: historyError } = await supabaseClient
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true })
      .limit(10)

    if (historyError) {
      console.error('Error loading message history:', historyError)
    } else {
      console.log('Loaded message history:', messageHistory?.length || 0, 'messages')
    }

    // Preparar contexto da conversa
    const conversationContext = messageHistory?.map(msg => 
      `${msg.sender === 'user' ? 'Usuário' : 'Assistente'}: ${msg.content}`
    ).join('\n') || ''

    // Salvar mensagem do usuário
    console.log('Saving user message')
    const { error: saveUserError } = await supabaseClient
      .from('chat_messages')
      .insert({
        conversation_id: conversation.id,
        content: message,
        sender: 'user'
      })

    if (saveUserError) {
      console.error('Error saving user message:', saveUserError)
      throw new Error('Failed to save user message')
    }

    // Preparar prompt especializado para laboratório
    const systemPrompt = `Você é um assistente especializado em gestão laboratorial da DASA, com expertise em:
- Inventário de reagentes e materiais médicos
- Agendamento de exames e procedimentos
- Compliance HIPAA/LGPD e segurança
- Análise de dados laboratoriais
- Otimização de processos

Contexto da conversa anterior:
${conversationContext}

Responda de forma concisa, precisa e útil. Seja técnico quando necessário, mas mantenha a clareza.`

    // Chamar API da Perplexity
    console.log('Calling Perplexity API with model: sonar-deep-research')
    
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
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
        temperature: 0.3,
        max_tokens: 800
      }),
    })

    console.log('Perplexity API response status:', perplexityResponse.status)

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text()
      console.error('Perplexity API error details:', errorText)
      throw new Error(`Perplexity API error: ${perplexityResponse.status} - ${errorText}`)
    }

    const aiResponse = await perplexityResponse.json()
    console.log('Perplexity API response received successfully')
    
    if (!aiResponse.choices || !aiResponse.choices[0] || !aiResponse.choices[0].message) {
      console.error('Invalid response structure from Perplexity:', aiResponse)
      throw new Error('Invalid response from AI service')
    }

    const aiMessage = aiResponse.choices[0].message.content

    // Salvar resposta da IA
    console.log('Saving AI response')
    const { error: saveAiError } = await supabaseClient
      .from('chat_messages')
      .insert({
        conversation_id: conversation.id,
        content: aiMessage,
        sender: 'assistant'
      })

    if (saveAiError) {
      console.error('Error saving AI message:', saveAiError)
      throw new Error('Failed to save AI response')
    }

    // Atualizar timestamp da conversa
    const { error: updateError } = await supabaseClient
      .from('chat_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversation.id)

    if (updateError) {
      console.error('Error updating conversation timestamp:', updateError)
    }

    // Detectar se precisa de consulta SQL
    const needsSQL = aiMessage.toLowerCase().includes('consulta sql') || 
                     aiMessage.toLowerCase().includes('query') ||
                     message.toLowerCase().includes('dados') ||
                     message.toLowerCase().includes('relatório')

    console.log('=== CHATBOT FUNCTION SUCCESS ===')
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
    console.error('=== CHATBOT FUNCTION ERROR ===')
    console.error('Error details:', error)
    console.error('Error stack:', error.stack)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
