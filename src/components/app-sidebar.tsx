
'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { MessageSquare, Settings, Code, Plus, Trash2, Moon, Sun, Search, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useChatHistory } from '@/lib/chat-history';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useEffect, useState } from 'react';
import type { UserProfile } from '@/lib/settings';
import { USER_PROFILE_KEY, DEFAULT_USER_PROFILE } from '@/lib/settings';

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { conversations, deleteConversation, isLoading } = useChatHistory();
  const { setTheme, theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setIsMounted(true);

    const loadProfile = () => {
       try {
        const savedProfile = localStorage.getItem(USER_PROFILE_KEY);
        if (savedProfile) {
          setProfile({ ...DEFAULT_USER_PROFILE, ...JSON.parse(savedProfile) });
        } else {
          setProfile(DEFAULT_USER_PROFILE);
        }
      } catch (error) {
        console.error('Failed to parse profile from localStorage', error);
        setProfile(DEFAULT_USER_PROFILE);
      }
    }
    
    loadProfile();

    window.addEventListener('storage', loadProfile);
    return () => window.removeEventListener('storage', loadProfile);

  }, []);
  
  const conversationId = pathname.startsWith('/chat/') ? pathname.split('/').pop() : null;

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    deleteConversation(id);
    if (pathname === `/chat/${id}`) {
      router.replace('/');
    }
  };

  const renderThemeToggle = () => {
    if (!isMounted) {
      return (
        <div className="flex w-full justify-center p-2 group-data-[collapsible=icon]:hidden">
          <Skeleton className="h-9 w-[76px] rounded-md" />
        </div>
      );
    }
    return (
      <>
        <div className="flex w-full justify-center p-2 group-data-[collapsible=icon]:hidden">
          <div className="rounded-md border p-1 flex items-center">
            <Button
              variant={theme === 'light' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setTheme('light')}
              className="h-7 w-7"
            >
              <Sun className="h-5 w-5" />
            </Button>
            <Button
              variant={theme === 'dark' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setTheme('dark')}
              className="h-7 w-7"
            >
              <Moon className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="hidden justify-center p-2 group-data-[collapsible=icon]:flex">
          {theme === 'light' ? (
            <Button variant="ghost" size="icon" onClick={() => setTheme('dark')} className="h-8 w-8">
              <Moon className="h-5 w-5" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setTheme('light')} className="h-8 w-8">
              <Sun className="h-5 w-5" />
            </Button>
          )}
        </div>
      </>
    );
  };
  
  const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
      return (names[0][0] || '') + (names[names.length - 1][0] || '');
    }
    return name.substring(0, 2);
  }

  return (
    <Sidebar className="border-r" collapsible="icon">
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2">
        <img width="48" height="48" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAADoElEQVR4nO1ZSWtUQRBuL+bgrkSnerJAjAje9BoFd1CiB/0HejW56kVPinrVi968iRchqIEkZgbMVL0QhERQBIMH44bbJVE0HvykOu/F58ssPZNkJqMpKGb6ve7q+mrrnhpjlmkuPd2BlWJxRQhvhfCOLa72tqPB1AuJxWUmXBxOo0ksoKwgTL0QE94MEVoURARAPWHqCYBEiv/xwHtTTyEkCQCaE6bOkvhymMRvVfm6SuKIhlqwQdnUK7HFLw0fGKww9Ui8DKDGtCQA9LajQQhdTBhmi695yuOCMlt8E4sRJnTPu3JJE9JCGGNCT5DG3rEtWGUWmYY3Yi2nsV8I95nwRK8j87H8KBPO6TiwOM6EbJW88Eks+oSQUQNW5IkwbHqKnKxVYyZ0lw1AY17DRi1fS+VlBsBw+R6wmMxtwhoNm9iNsqNsQeXuS+jIA2KqohKo5U8XR4LcWDcg3FtwSxNYLI5Feyffl12KIwBxYdWq5/xfAghiZTJSvBgATqGVCQM6332m0OqtYAqtQnhYaG0hABrOYU66UEv+hp3IpXBSEzcSUhQAYSBRKQZ8AajyxdZyAQCP27AuSOEEE16wxaW45SekCRulCe1CuO3jASH8SCgx7RtiOrfYWi4AQJ8z4bPzHmGaLTpVWFYt75S3+KiTgzS2lfTAPBItXxVCCdk5i+1znhMyKmwqrPd3CqFeCgAkP086ABpbkfV9AZRSohoA2OKTxnLGJcbMBcrfAyXieKFzQPJzn07uZMJ4sqp4AKi4CpVay54AcoTDkcCLSauUBKDngEW/q80W/dqJ8wZQYi17AGCL838LtegUwmDy7rNUTmKJcUA45CVkKQFATBcvPf5JADnCnsVWPiDsLlRmywKgh0S2FevLKGmLyZN62EbfvSyhP+PE4qBYfKg1AJ5p6ewMx8+9AAjhjBAeuO5ArT1A6BKLC+H4ZrltlWyNlR99lEJjdFNgiwNeAGKNrdFaKj9i0cwWd8NxxlT0Z8VMOEn8kCsSrz+1Gabg44bQZ/rOQ/EpIQS6Z2h5pzwTvuiV31SDcmkcTfxP9tLr9DTGZBuxWgi7NOZnw4bwpRolfJaY8DreQyrQ6/ENo8GqWT4OwHX0KusfTbLFMybcyKWxz9SCghSOiMWrWF6M65lSE2WWaZkqpKHNaGOLU0w4yxbXmHDLddFCdtWBMKYlMs6ux0T4nqeafHfvEvOdDEImLtvtZXFd9xbC6VwzthZS9DfLEwcct7w1dgAAAABJRU5ErkJggg==" alt="chatbot"/>
          <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">
            AgentVerse
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex flex-col p-2">
        <SidebarMenu>
          <SidebarMenuItem>
             <SidebarMenuButton asChild tooltip="New Chat">
               <Link href="/">
                 <Plus />
                 <span>New Chat</span>
               </Link>
             </SidebarMenuButton>
           </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator />
        
        {/* Search Box */}
        <div className="mb-2 px-1 group-data-[collapsible=icon]:hidden">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-8 h-8 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <SidebarMenu>
            {isLoading ? (
               <div className="space-y-2 px-1">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
               </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const isActive = conversationId === conv.id;
                return (
                  <SidebarMenuItem key={conv.id} className="group/item relative">
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="transition-all duration-200"
                    >
                      <Link 
                        href={`/chat/${conv.id}`}
                        className={isActive ? 'bg-gradient-to-r from-primary/20 to-primary/10' : ''}
                      >
                        <MessageSquare className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className="truncate pr-6 text-sm">{conv.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    <button
                      onClick={(e) => handleDelete(e, conv.id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground opacity-0 transition-all group-hover/item:opacity-100 hover:bg-destructive/10 hover:text-destructive group-data-[collapsible=icon]:hidden"
                      aria-label="Delete chat"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </SidebarMenuItem>
                );
              })
            ) : conversations.length > 0 && searchQuery ? (
              <div className="px-2 py-6 text-center text-xs text-muted-foreground">
                <p>No conversations match</p>
                <p className="mt-1">&quot;{searchQuery}&quot;</p>
              </div>
            ) : (
              <div className="px-2 py-6 text-center text-xs text-muted-foreground">
                <p>No conversations yet</p>
                <p className="mt-1">Start a new chat to begin</p>
              </div>
            )}
          </SidebarMenu>
        </div>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === '/sandbox'}
              tooltip="Sandbox"
            >
              <Link href="/sandbox">
                <Code />
                <span>Sandbox</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === '/settings'}
              tooltip="Settings"
            >
              <Link href="/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        {renderThemeToggle()}
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Profile">
              <Avatar className="h-8 w-8">
                 <AvatarImage src="https://i.pinimg.com/736x/83/4f/e6/834fe637588ed7ccca41c0ebd659e855.jpg " alt="@user" data-ai-hint="user avatar" />
                 <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
              </Avatar>
              <span className="group-data-[collapsible=icon]:hidden text-sm">{profile.name}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
