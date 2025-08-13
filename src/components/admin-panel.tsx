'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import {
  loginAction,
  updatePriceAction,
  changePasswordAction,
} from '@/app/actions';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, LogIn, KeyRound, RefreshCcw, LogOut, UserCog } from 'lucide-react';
import { ForgotPasswordDialog } from './forgot-password-dialog';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required.'),
  password: z.string().min(1, 'Password is required.'),
});

const updatePriceSchema = z.object({
  price: z.coerce.number().positive('Price must be a positive number.'),
});

const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Old password is required.'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { toast } = useToast();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const updatePriceForm = useForm<z.infer<typeof updatePriceSchema>>({
    resolver: zodResolver(updatePriceSchema),
    defaultValues: { price: '' as any },
  });

  const changePasswordForm = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  });

  const handleLogin = (values: z.infer<typeof loginSchema>) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('username', values.username);
      formData.append('password', values.password);
      const result = await loginAction(formData);
      if (result.success) {
        toast({ title: 'Success!', description: result.message });
        setIsLoggedIn(true);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
        loginForm.setValue('password', '');
      }
    });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    loginForm.reset();
    updatePriceForm.reset();
    changePasswordForm.reset();
    toast({ title: 'Logged Out', description: 'You have been logged out successfully.' });
  };

  const handleUpdatePrice = (values: z.infer<typeof updatePriceSchema>) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('price', values.price.toString());
      const result = await updatePriceAction(formData);
      if (result.success) {
        toast({ title: 'Success!', description: result.message });
        updatePriceForm.reset({ price: '' as any });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
    });
  };

  const handleChangePassword = (values: z.infer<typeof changePasswordSchema>) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('oldPassword', values.oldPassword);
      formData.append('newPassword', values.newPassword);
      const result = await changePasswordAction(formData);
      if (result.success) {
        toast({ title: 'Success!', description: result.message });
        changePasswordForm.reset();
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
    });
  };

  if (isLoggedIn) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><UserCog/>Admin Panel</CardTitle>
            <CardDescription>Update price or change password.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="update-price">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="update-price">Update Price</TabsTrigger>
              <TabsTrigger value="change-password">Change Password</TabsTrigger>
            </TabsList>
            <TabsContent value="update-price" className="pt-4">
              <Form {...updatePriceForm}>
                <form onSubmit={updatePriceForm.handleSubmit(handleUpdatePrice)} className="space-y-4">
                  <FormField control={updatePriceForm.control} name="price" render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Gold Price (per 10g)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 72500" {...field} disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
                    Update Price
                  </Button>
                </form>
              </Form>
            </TabsContent>
            <TabsContent value="change-password" className="pt-4">
              <Form {...changePasswordForm}>
                <form onSubmit={changePasswordForm.handleSubmit(handleChangePassword)} className="space-y-4">
                  <FormField control={changePasswordForm.control} name="oldPassword" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Old Password</FormLabel>
                        <FormControl><Input type="password" {...field} disabled={isPending} placeholder="Enter your current password"/></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={changePasswordForm.control} name="newPassword" render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl><Input type="password" {...field} disabled={isPending} placeholder="Enter a new password"/></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={changePasswordForm.control} name="confirmPassword" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl><Input type="password" {...field} disabled={isPending} placeholder="Confirm your new password" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                    Change Password
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>Login to update the gold price.</CardDescription>
        </CardHeader>
        <Form {...loginForm}>
          <form onSubmit={loginForm.handleSubmit(handleLogin)}>
            <CardContent className="space-y-4">
              <FormField control={loginForm.control} name="username" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl><Input placeholder="admin" {...field} disabled={isPending} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={loginForm.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl><Input type="password" placeholder="••••••••" {...field} disabled={isPending} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                Login
              </Button>
              <Button variant="link" size="sm" type="button" className="text-muted-foreground" onClick={() => setShowForgotPassword(true)}>
                Forgot Password?
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      <ForgotPasswordDialog open={showForgotPassword} onOpenChange={setShowForgotPassword} />
    </>
  );
}
