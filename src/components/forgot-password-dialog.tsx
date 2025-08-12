'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { runFlow } from '@genkit-ai/next/client';
import type { forgotPasswordFlow } from '@/ai/flows/forgotPassword';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, KeyRound, Sparkles } from 'lucide-react';
import { resetPasswordWithMasterKeyAction } from '@/app/actions';

const resetSchema = z.object({
  masterPassword: z.string().nonempty('Master password is required.'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters.'),
});

export function ForgotPasswordDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [isPending, startTransition] = useTransition();
  const [isAiPending, startAiTransition] = useTransition();
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [showMasterPasswordForm, setShowMasterPasswordForm] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: { masterPassword: '', newPassword: '' },
  });

  const handleQuerySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const userQuery = formData.get('userQuery') as string;

    if (!userQuery) return;

    startAiTransition(async () => {
      setAiResponse('Thinking...');
      const result = await runFlow(forgotPasswordFlow, { userQuery });
      setAiResponse(result.response);
      setShowMasterPasswordForm(result.shouldOfferMasterPassword);
      if (result.shouldOfferMasterPassword) {
        form.reset();
      }
    });
  };

  const handleResetSubmit = (values: z.infer<typeof resetSchema>) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('masterPassword', values.masterPassword);
      formData.append('newPassword', values.newPassword);
      const result = await resetPasswordWithMasterKeyAction(formData);
      if (result.success) {
        toast({
          title: 'Success!',
          description: result.message,
        });
        onOpenChange(false);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message,
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Forgot Password</DialogTitle>
          <DialogDescription>
            Describe your problem, and our assistant will help you.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleQuerySubmit} className="space-y-4">
          <Textarea name="userQuery" placeholder="e.g., I lost my password, please help!" required disabled={isAiPending} />
          <Button type="submit" className="w-full" disabled={isAiPending}>
            {isAiPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Ask Assistant
          </Button>
        </form>

        {aiResponse && (
          <div className="mt-4 p-3 bg-secondary rounded-md text-sm text-secondary-foreground">
            {aiResponse}
          </div>
        )}

        {showMasterPasswordForm && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleResetSubmit)} className="space-y-4 pt-4 border-t">
              <FormField
                control={form.control}
                name="masterPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Master Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} disabled={isPending} placeholder="Enter master password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} disabled={isPending} placeholder="Enter new password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                  Reset Password
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
