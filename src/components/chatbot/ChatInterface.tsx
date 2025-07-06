
import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, MessageSquare, Trash2, Bot, User, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useChatbot } from '@/hooks/useChatbot';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export const ChatInterface = () => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const {
    messages,
    conversations,
    currentConversationId,
    isLoading,
    isTyping,
    sendMessage,
    startNewConversation,
    selectConversation,
    deleteConversation,
  } = useChatbot();

  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const message = inputMessage;
    setInputMessage('');
    await sendMessage(message);
    inputRef.current?.focus();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Você precisa estar logado para usar o chat IA.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gradient-to-br from-background to-muted/20">
      {/* Sidebar com conversas */}
      <div className="w-80 border-r border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="p-4 border-b border-border/50">
          <Button
            onClick={startNewConversation}
            className="w-full gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            Nova Conversa
          </Button>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <div key={conversation.id} className="group relative">
                <Button
                  variant="ghost"
                  onClick={() => selectConversation(conversation.id)}
                  className={cn(
                    "w-full justify-start text-left h-auto p-3 hover:bg-primary/10",
                    currentConversationId === conversation.id && "bg-primary/10 border border-primary/20"
                  )}
                >
                  <div className="flex items-start gap-2 w-full">
                    <MessageSquare className="h-4 w-4 mt-1 flex-shrink-0 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {conversation.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(conversation.updated_at)}
                      </p>
                    </div>
                  </div>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteConversation(conversation.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            
            {conversations.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                Nenhuma conversa ainda.
                <br />
                Comece uma nova conversa!
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Área principal do chat */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border/50 bg-card/30 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary-foreground flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">Assistente DASA Labs</h1>
              <p className="text-sm text-muted-foreground">
                Especialista em gestão laboratorial
              </p>
            </div>
          </div>
        </div>

        {/* Mensagens */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.length === 0 && (
              <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                <Bot className="h-16 w-16 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">
                  Olá! Sou seu assistente especializado
                </h3>
                <p className="text-muted-foreground mb-4">
                  Posso ajudar com inventário, agendamentos, compliance e muito mais.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    "Como está o estoque de reagentes?",
                    "Mostrar próximos agendamentos",
                    "Relatório de compliance",
                    "Alertas de baixo estoque"
                  ].map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      onClick={() => setInputMessage(suggestion)}
                      className="text-xs hover:bg-primary/10 hover:border-primary/30"
                      disabled={isLoading}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </Card>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 animate-in slide-in-from-bottom-2",
                  message.sender === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {message.sender === 'assistant' && (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary-foreground flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
                
                <Card
                  className={cn(
                    "max-w-[70%] p-3",
                    message.sender === 'user'
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border/50"
                  )}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p
                    className={cn(
                      "text-xs mt-2 opacity-70",
                      message.sender === 'user' ? "text-primary-foreground" : "text-muted-foreground"
                    )}
                  >
                    {formatTime(message.created_at)}
                  </p>
                </Card>

                {message.sender === 'user' && (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-secondary to-secondary-foreground flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-secondary-foreground" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 animate-in slide-in-from-bottom-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary-foreground flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <Card className="p-3 bg-card border-border/50">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  </div>
                </Card>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border/50 bg-card/30 backdrop-blur-sm">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                disabled={isLoading}
                className="flex-1 bg-background/50 border-border/50 focus:border-primary/50"
              />
              <Button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="px-4 bg-primary hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {isLoading && (
              <div className="mt-2 text-sm text-muted-foreground text-center">
                Processando sua mensagem...
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
