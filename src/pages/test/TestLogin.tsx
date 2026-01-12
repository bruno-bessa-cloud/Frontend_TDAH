import { LoginForm } from '@/components/login-form';
import { ModeToggle } from '@/components/mode-toggle';
import { GalleryVerticalEnd, Heart, MessageCircle, Repeat2, Share2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MicroExpander } from '@/components/micro-expander';

export default function TestLogin() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full min-h-[200px] flex items-center justify-center p-4 bg-muted/30 rounded-lg">
        <div className="flex flex-wrap items-center justify-center gap-3 p-3 bg-background border rounded-full shadow-sm">
          <MicroExpander
            text="Like"
            variant="ghost"
            icon={<Heart className="w-5 h-5" />}
            className="hover:text-red-500 hover:bg-red-50"
          />
          <MicroExpander
            text="Reply"
            variant="ghost"
            icon={<MessageCircle className="w-5 h-5" />}
            className="hover:text-blue-500 hover:bg-blue-50"
          />
          <MicroExpander
            text="Repost"
            variant="ghost"
            icon={<Repeat2 className="w-5 h-5" />}
            className="hover:text-green-500 hover:bg-green-50"
          />
          <MicroExpander text="Share" variant="ghost" icon={<Share2 className="w-5 h-5" />} />
        </div>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Acme Inc.
          <div className="flex items-center space-x-2">
            <Switch id="airplane-mode" />
            <Label htmlFor="airplane-mode">Airplane Mode</Label>
          </div>
          <ModeToggle />
        </a>
        <LoginForm />
      </div>
    </div>
  );
}
