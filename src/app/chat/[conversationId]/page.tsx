
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { chat } from '@/ai/flows/chat';
import { textToSpeech } from '@/ai/flows/tts';
import type { Message } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AppHeader } from '@/components/app-header';
import {
  Bot,
  Send,
  User,
  Loader2,
  ExternalLink,
  Volume2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { AgentSettings } from '@/lib/settings';
import { SETTINGS_KEY, DEFAULT_SETTINGS } from '@/lib/settings';
import { useChatHistory } from '@/lib/chat-history';
import { CodeBlock } from '@/components/code-block';
import { Skeleton } from '@/components/ui/skeleton';

function ChatSkeleton() {
  return (
    <div className="flex h-screen flex-col">
      <AppHeader title="Chat" />
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-2xl space-y-6 lg:max-w-4xl">
          <div className="flex w-full items-start gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="w-full max-w-prose space-y-2 rounded-lg bg-card p-3 shadow-sm border">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
          <div className="flex w-full items-start gap-4 justify-end">
             <div className="w-full max-w-prose space-y-2 rounded-lg bg-primary p-3 shadow-sm">
                <Skeleton className="h-4 w-full" />
             </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
           <div className="flex w-full items-start gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="w-full max-w-prose space-y-2 rounded-lg bg-card p-3 shadow-sm border">
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </div>
       <div className="border-t bg-background">
        <div className="mx-auto w-full max-w-4xl p-4">
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
      </div>
    </div>
  );
}


export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params.conversationId as string;
  
  const { activeConversation, loadConversation, updateActiveConversation, isLoading: isHistoryLoading } = useChatHistory();
  const messages = activeConversation?.messages || [];

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<AgentSettings>(DEFAULT_SETTINGS);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [audioLoading, setAudioLoading] = useState<string | null>(null);

  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId);
    }
  }, [conversationId, loadConversation]);

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
      }
    } catch (error) {
      console.error('Failed to parse settings from localStorage', error);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleOpenInSandbox = (code: string) => {
    const encodedCode = encodeURIComponent(code);
    router.push(`/sandbox?code=${encodedCode}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
    };
    
    const newMessages = [...messages, userMessage];
    updateActiveConversation(newMessages);

    setInput('');
    setIsLoading(true);

    try {
      const historyForApi = newMessages.map((msg) => ({
        role: msg.role === 'user' ? ('user' as const) : ('model' as const),
        content: msg.content,
      }));

      const result = await chat({
        history: historyForApi.slice(0, -1),
        message: input,
        settings,
      });

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: result.message,
        code: result.code,
      };
      updateActiveConversation([...newMessages, assistantMessage]);
    } catch (error) {
      console.error('Error getting chat response:', error);
      toast({
        title: 'Error',
        description: 'Failed to get a response. Please try again.',
        variant: 'destructive',
      });
      updateActiveConversation(messages);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePlayAudio = async (
    messageId: string,
    text: string
  ) => {
    const existingAudio = activeConversation?.messages.find(m => m.id === messageId)?.audioSrc;
    if (existingAudio) {
      new Audio(existingAudio).play();
      return;
    }

    setAudioLoading(messageId);
    try {
      const result = await textToSpeech({ text });
      const updatedMessages = messages.map(m =>
        m.id === messageId ? { ...m, audioSrc: result.audioDataUri } : m
      );
      updateActiveConversation(updatedMessages);
      new Audio(result.audioDataUri).play();
    } catch (error) {
      console.error('Error generating audio:', error);
      toast({
        title: 'Audio Error',
        description: 'Failed to generate audio for this message.',
        variant: 'destructive',
      });
    } finally {
      setAudioLoading(null);
    }
  };

  if (isHistoryLoading) {
     return <ChatSkeleton />;
  }

  return (
    <div className="flex h-screen flex-col">
      <AppHeader title={activeConversation?.title || "Chat"} />
      <div className="flex-1 overflow-y-auto bg-background">
        <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8 md:px-6 lg:px-8 lg:py-12">
          {messages.length === 0 && !isLoading ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground pt-16">
             <img width="50" height="50" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAADoElEQVR4nO1ZSWtUQRBuL+bgrkSnerJAjAje9BoFd1CiB/0HejW56kVPinrVi968iRchqIEkZgbMVL0QhERQBIMH44bbJVE0HvykOu/F58ssPZNkJqMpKGb6ve7q+mrrnhpjlmkuPd2BlWJxRQhvhfCOLa72tqPB1AuJxWUmXBxOo0ksoKwgTL0QE94MEVoURARAPWHqCYBEiv/xwHtTTyEkCQCaE6bOkvhymMRvVfm6SuKIhlqwQdnUK7HFLw0fGKww9Ui8DKDGtCQA9LajQQhdTBhmi695yuOCMlt8E4sRJnTPu3JJE9JCGGNCT5DG3rEtWGUWmYY3Yi2nsV8I95nwRK8j87H8KBPO6TiwOM6EbJW88Eks+oSQUQNW5IkwbHqKnKxVYyZ0lw1AY17DRi1fS+VlBsBw+R6wmMxtwhoNm9iNsqNsQeXuS+jIA2KqohKo5U8XR4LcWDcg3FtwSxNYLI5Feyffl12KIwBxYdWq5/xfAghiZTJSvBgATqGVCQM6332m0OqtYAqtQnhYaG0hABrOYU66UEv+hp3IpXBSEzcSUhQAYSBRKQZ8AajyxdZyAQCP27AuSOEEE16wxaW45SekCRulCe1CuO3jASH8SCgx7RtiOrfYWi4AQJ8z4bPzHmGaLTpVWFYt75S3+KiTgzS2lfTAPBItXxVCCdk5i+1znhMyKmwqrPd3CqFeCgAkP086ABpbkfV9AZRSohoA2OKTxnLGJcbMBcrfAyXieKFzQPJzn07uZMJ4sqp4AKi4CpVay54AcoTDkcCLSauUBKDngEW/q80W/dqJ8wZQYi17AGCL838LtegUwmDy7rNUTmKJcUA45CVkKQFATBcvPf5JADnCnsVWPiDsLlRmywKgh0S2FevLKGmLyZN62EbfvSyhP+PE4qBYfKg1AJ5p6ewMx8+9AAjhjBAeuO5ArT1A6BKLC+H4ZrltlWyNlR99lEJjdFNgiwNeAGKNrdFaKj9i0cwWd8NxxlT0Z8VMOEn8kCsSrz+1Gabg44bQZ/rOQ/EpIQS6Z2h5pzwTvuiV31SDcmkcTfxP9tLr9DTGZBuxWgi7NOZnw4bwpRolfJaY8DreQyrQ6/ENo8GqWT4OwHX0KusfTbLFMybcyKWxz9SCghSOiMWrWF6M65lSE2WWaZkqpKHNaGOLU0w4yxbXmHDLddFCdtWBMKYlMs6ux0T4nqeafHfvEvOdDEImLtvtZXFd9xbC6VwzthZS9DfLEwcct7w1dgAAAABJRU5ErkJggg==" alt="chatbot"/>
              <h2 className="mt-4 text-2xl font-semibold text-foreground">
                Chat with {settings.agentName}
              </h2>
              <p className="mt-2 text-sm">
                Start a conversation by typing a message below. Your agent's persona can be changed in Settings.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex w-full items-end gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-9 w-9 border border-border flex-shrink-0 mt-auto">
                    <AvatarFallback className="bg-accent/10">
                      <Bot className="h-5 w-5 text-accent" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'flex flex-col gap-2 max-w-2xl',
                    message.role === 'user' ? 'items-end' : 'items-start'
                  )}
                >
                  <div
                    className={cn(
                      'rounded-xl px-4 py-3 shadow-sm border transition-all',
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-primary to-primary/85 text-primary-foreground rounded-br-none'
                        : 'bg-card border-border/60 text-foreground rounded-bl-none'
                    )}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                      {message.content}
                    </p>
                  </div>
                  {message.code && (
                    <div className={cn('w-full space-y-2.5', message.role === 'user' ? 'pr-2' : 'pl-2')}>
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Generated Code
                        </div>
                        <CodeBlock code={message.code} language="jsx" />
                      </div>
                      <Button
                        onClick={() => handleOpenInSandbox(message.code!)}
                        variant="outline"
                        size="sm"
                        className={cn(
                          'text-xs font-medium',
                          message.role === 'user' ? 'ml-auto' : ''
                        )}
                      >
                        <ExternalLink className="mr-2 h-3.5 w-3.5" />
                        Open in Sandbox
                      </Button>
                    </div>
                  )}
                </div>
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 flex items-end gap-1.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePlayAudio(message.id, message.content)}
                      disabled={!!audioLoading}
                      aria-label="Play audio"
                      className="h-9 w-9 hover:bg-accent/10"
                    >
                      {audioLoading === message.id ? (
                        <Loader2 className="h-4.5 w-4.5 animate-spin text-accent" />
                      ) : (
                        <Volume2 className="h-4.5 w-4.5 text-muted-foreground hover:text-accent transition-colors" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex w-full items-start justify-start gap-4">
              <Avatar className="h-8 w-8 border">
                <AvatarFallback>
                  <Bot className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="w-full max-w-prose space-y-2 rounded-lg bg-card p-3 shadow-sm border">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-border/50 bg-background/50">
        <div className="mx-auto w-full max-w-3xl px-4 py-4 md:px-6">
          <form onSubmit={handleSubmit} className="flex gap-2.5 items-end">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Message ${settings.agentName}...`}
              disabled={isLoading}
              className="text-base min-h-11 px-4 py-2 rounded-lg"
              autoFocus
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              size="lg"
              className="h-11 px-6"
              aria-label="Send message"
            >
              <Send className="h-4.5 w-4.5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
