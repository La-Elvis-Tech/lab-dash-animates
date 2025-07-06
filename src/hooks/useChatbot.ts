
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  created_at: string;
}

interface ChatConversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export const useChatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Carregar conversas do usuário
  const loadConversations = useCallback(async () => {
    if (!user) {
      console.log('No user found, skipping conversation load')
      return;
    }

    try {
      console.log('Loading conversations for user:', user.id)
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error loading conversations:', error)
        throw error;
      }
      
      console.log('Loaded conversations:', data?.length || 0)
      setConversations(data || []);
    } catch (error: any) {
      console.error('Failed to load conversations:', error);
      toast({
        title: 'Erro ao carregar conversas',
        description: 'Não foi possível carregar as conversas anteriores.',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  // Carregar mensagens de uma conversa
  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      console.log('Loading messages for conversation:', conversationId)
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error)
        throw error;
      }
      
      console.log('Loaded messages:', data?.length || 0)
      setMessages((data || []).map(msg => ({
        ...msg,
        sender: msg.sender as 'user' | 'assistant'
      })));
    } catch (error: any) {
      console.error('Failed to load messages:', error);
      toast({
        title: 'Erro ao carregar mensagens',
        description: 'Não foi possível carregar as mensagens da conversa.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Enviar mensagem para o chatbot
  const sendMessage = useCallback(async (message: string) => {
    if (!user) {
      console.error('No user found when trying to send message')
      toast({
        title: 'Erro de autenticação',
        description: 'Você precisa estar logado para usar o chat.',
        variant: 'destructive',
      });
      return;
    }

    if (!message.trim()) {
      console.log('Empty message, skipping send')
      return;
    }

    console.log('=== SENDING MESSAGE ===')
    console.log('User ID:', user.id)
    console.log('Message:', message.substring(0, 100) + (message.length > 100 ? '...' : ''))
    console.log('Current conversation ID:', currentConversationId)

    setIsLoading(true);
    setIsTyping(true);

    // Adicionar mensagem do usuário imediatamente na interface
    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      content: message,
      sender: 'user',
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      console.log('Invoking chatbot-ai edge function...')
      
      const { data, error } = await supabase.functions.invoke('chatbot-ai', {
        body: {
          message,
          conversationId: currentConversationId,
          userId: user.id,
        },
      });

      console.log('Edge function response:', { 
        hasData: !!data, 
        hasError: !!error,
        errorMessage: error?.message 
      })

      if (error) {
        console.error('Edge function error:', error)
        throw new Error(error.message || 'Falha na comunicação com o servidor')
      }

      if (!data) {
        console.error('No data received from edge function')
        throw new Error('Resposta vazia do servidor')
      }

      if (data.error) {
        console.error('Server returned error:', data.error)
        throw new Error(data.error)
      }

      const { response, conversationId: newConversationId } = data;

      if (!response) {
        console.error('No response content received')
        throw new Error('Resposta vazia da IA')
      }

      console.log('AI response received successfully')

      // Atualizar ID da conversa se for nova
      if (!currentConversationId && newConversationId) {
        console.log('Setting new conversation ID:', newConversationId)
        setCurrentConversationId(newConversationId);
        loadConversations(); // Recarregar lista de conversas
      }

      // Adicionar resposta da IA
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        content: response,
        sender: 'assistant',
        created_at: new Date().toISOString(),
      };

      // Substituir a mensagem temporária do usuário e adicionar resposta da IA
      setMessages(prev => [...prev.slice(0, -1), userMessage, aiMessage]);

      console.log('=== MESSAGE SENT SUCCESSFULLY ===')

    } catch (error: any) {
      console.error('=== MESSAGE SEND FAILED ===')
      console.error('Error details:', error)
      
      toast({
        title: 'Erro no Chatbot',
        description: error.message || 'Não foi possível enviar a mensagem. Tente novamente.',
        variant: 'destructive',
      });
      
      // Remover mensagem temporária em caso de erro
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [user, currentConversationId, loadConversations, toast]);

  // Iniciar nova conversa
  const startNewConversation = useCallback(() => {
    console.log('Starting new conversation')
    setCurrentConversationId(null);
    setMessages([]);
  }, []);

  // Selecionar conversa existente
  const selectConversation = useCallback(async (conversationId: string) => {
    console.log('Selecting conversation:', conversationId)
    setCurrentConversationId(conversationId);
    await loadMessages(conversationId);
  }, [loadMessages]);

  // Deletar conversa
  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      console.log('Deleting conversation:', conversationId)
      const { error } = await supabase
        .from('chat_conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;

      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      if (currentConversationId === conversationId) {
        startNewConversation();
      }

      toast({
        title: 'Conversa deletada',
        description: 'A conversa foi removida com sucesso.',
      });
      
      console.log('Conversation deleted successfully')
    } catch (error: any) {
      console.error('Error deleting conversation:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível deletar a conversa.',
        variant: 'destructive',
      });
    }
  }, [currentConversationId, startNewConversation, toast]);

  useEffect(() => {
    if (user) {
      console.log('User detected, loading conversations')
      loadConversations();
    } else {
      console.log('No user, clearing conversations')
      setConversations([]);
      setMessages([]);
      setCurrentConversationId(null);
    }
  }, [user, loadConversations]);

  return {
    messages,
    conversations,
    currentConversationId,
    isLoading,
    isTyping,
    sendMessage,
    startNewConversation,
    selectConversation,
    deleteConversation,
  };
};
