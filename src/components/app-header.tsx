'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';

export function AppHeader({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4 md:px-6">
        <SidebarTrigger className="md:hidden" />
        <Separator orientation="vertical" className="mx-2 h-6 md:hidden" />
        <div className="flex flex-col gap-0.5">
          <h1 className="text-lg font-semibold leading-tight">{title}</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">Chat • Powered by AI + Genkit</p>
        </div>
      </div>
    </header>
  );
}
