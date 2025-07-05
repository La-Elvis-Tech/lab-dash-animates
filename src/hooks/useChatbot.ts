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
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error: any) {
      console.error('Error loading conversations:', error);
    }
  }, [user]);

  // Carregar mensagens de uma conversa
  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []).map(msg => ({
        ...msg,
        sender: msg.sender as 'user' | 'assistant'
      })));
    } catch (error: any) {
      console.error('Error loading messages:', error);
    }
  }, []);

  // Enviar mensagem para o chatbot
  const sendMessage = useCallback(async (message: string) => {
    if (!user || !message.trim()) return;

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
      const { data, error } = await supabase.functions.invoke('chatbot-ai', {
        body: {
          message,
          conversationId: currentConversationId,
          userId: user.id,
        },
      });

      if (error) throw error;

      const { response, conversationId: newConversationId } = data;

      // Atualizar ID da conversa se for nova
      if (!currentConversationId && newConversationId) {
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

      setMessages(prev => [...prev.slice(0, -1), userMessage, aiMessage]);

    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Erro no Chatbot',
        description: 'Não foi possível enviar a mensagem. Tente novamente.',
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
    setCurrentConversationId(null);
    setMessages([]);
  }, []);

  // Selecionar conversa existente
  const selectConversation = useCallback(async (conversationId: string) => {
    setCurrentConversationId(conversationId);
    await loadMessages(conversationId);
  }, [loadMessages]);

  // Deletar conversa
  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
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
      loadConversations();
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