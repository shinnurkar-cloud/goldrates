'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import {
  loginAction,
  updatePriceAction,
  changePasswordAction,
  updateMessageAction,
  updateImagesAction,
  deleteImageAction
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
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, LogIn, KeyRound, RefreshCcw, LogOut, UserCog, MessageSquarePlus, Image as ImageIcon, Trash2 } from 'lucide-react';
import { ForgotPasswordDialog } from './forgot-password-dialog';
import { getCarouselImages } from '@/lib/data';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required.'),
  password: z.string().min(1, 'Password is required.'),
});

const updatePriceSchema = z.object({
  price: z.coerce.number().positive('Price must be a positive number.'),
});

const updateMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty.'),
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

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const isClient = typeof window !== 'undefined';

export function AdminPanel() {
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { toast } = useToast();
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  
  useEffect(() => {
    if (loggedInUser === 'admin2') {
      // In a real app, this would be an API call.
      // For this implementation, we can call a function that gets the initial state.
      // This is a bit of a workaround because we can't call server components directly.
      const fetchImages = async () => {
        const res = await fetch('/api/images'); // Let's assume we create this API route
        if (res.ok) {
            const data = await res.json();
            setCurrentImages(data.images);
        }
      }
      fetchImages();
    }
  }, [loggedInUser]);


  const updateImagesSchema = useMemo(() => {
    const baseSchema = z.object({
        image1: z.any(),
        image2: z.any(),
        image3: z.any(),
        image4: z.any(),
        image5: z.any(),
    });

    if (!isClient) {
        return baseSchema;
    }

    const imageFieldSchema = z.instanceof(FileList)
        .optional()
        .refine(
            (files) => !files || files.length === 0 || files[0].size <= MAX_FILE_SIZE,
            `Max file size is 5MB.`
        )
        .refine(
            (files) => !files || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files[0].type),
            "Only .jpg, .jpeg, .png and .webp formats are supported."
        );

    return z.object({
        image1: imageFieldSchema,
        image2: imageFieldSchema,
        image3: imageFieldSchema,
        image4: imageFieldSchema,
        image5: imageFieldSchema,
    });
  }, []);


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

  const updateMessageForm = useForm<z.infer<typeof updateMessageSchema>>({
    resolver: zodResolver(updateMessageSchema),
    defaultValues: { message: '' },
  });
  
  const updateImagesForm = useForm<z.infer<typeof updateImagesSchema>>({
    resolver: zodResolver(updateImagesSchema),
    defaultValues: {
      image1: undefined,
      image2: undefined,
      image3: undefined,
      image4: undefined,
      image5: undefined,
    },
  });

  const handleLogin = (values: z.infer<typeof loginSchema>) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('username', values.username);
      formData.append('password', values.password);
      const result = await loginAction(formData);
      if (result.success) {
        toast({ title: 'Success!', description: result.message });
        setLoggedInUser(result.user as string);
        if (result.user === 'admin2') {
            const res = await fetch('/api/images');
            if (res.ok) {
                const data = await res.json();
                setCurrentImages(data.images);
            }
        }
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
        loginForm.setValue('password', '');
      }
    });
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    loginForm.reset();
    updatePriceForm.reset();
    changePasswordForm.reset();
    updateMessageForm.reset();
    updateImagesForm.reset();
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
      formData.append('user', loggedInUser || '');
      const result = await changePasswordAction(formData);
      if (result.success) {
        toast({ title: 'Success!', description: result.message });
        changePasswordForm.reset();
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
    });
  };
  
  const handleUpdateMessage = (values: z.infer<typeof updateMessageSchema>) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('message', values.message);
      const result = await updateMessageAction(formData);
      if (result.success) {
        toast({ title: 'Success!', description: result.message });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
    });
  };
  
  const handleUpdateImages = async (values: z.infer<typeof updateImagesSchema>) => {
    startTransition(async () => {
        const formData = new FormData();

        const fileToDataUri = (file: File): Promise<string> => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        };

        try {
            const imagePromises = Object.entries(values).map(async ([key, fileList]) => {
                if (fileList && fileList.length > 0) {
                    const dataUri = await fileToDataUri(fileList[0]);
                    formData.append(key, dataUri);
                } else {
                    formData.append(key, '');
                }
            });
            await Promise.all(imagePromises);
            
            const result = await updateImagesAction(formData);

            if (result.success) {
                toast({ title: 'Success!', description: result.message });
                updateImagesForm.reset();
                // Refresh the images
                const res = await fetch('/api/images');
                if (res.ok) {
                    const data = await res.json();
                    setCurrentImages(data.images);
                }
            } else {
                toast({ variant: 'destructive', title: 'Error', description: result.message });
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to read files.' });
        }
    });
};

const handleDeleteImage = (index: number) => {
    startTransition(async () => {
        const formData = new FormData();
        formData.append('index', index.toString());
        const result = await deleteImageAction(formData);
        if (result.success) {
            toast({ title: 'Success!', description: result.message });
            const res = await fetch('/api/images');
            if (res.ok) {
                const data = await res.json();
                setCurrentImages(data.images);
            }
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.message });
        }
    });
}

  if (loggedInUser) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><UserCog/>Admin Panel ({loggedInUser})</CardTitle>
            <CardDescription>Manage application content.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </CardHeader>
        <CardContent>
          {loggedInUser === 'admin' && (
            <Tabs defaultValue="update-price">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="update-price">Update Price</TabsTrigger>
                <TabsTrigger value="update-message">Update Message</TabsTrigger>
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
              <TabsContent value="update-message" className="pt-4">
                <Form {...updateMessageForm}>
                  <form onSubmit={updateMessageForm.handleSubmit(handleUpdateMessage)} className="space-y-4">
                    <FormField control={updateMessageForm.control} name="message" render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Message</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter a message for your users" {...field} disabled={isPending} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isPending}>
                      {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquarePlus className="mr-2 h-4 w-4" />}
                      Update Message
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              <TabsContent value="change-password" className="pt-4">
                <Form {...changePasswordForm}>
                  <form onSubmit={changePasswordForm.handleSubmit(handleChangePassword)} className="space-y-4">
                    <FormField control={changePasswordForm.control} name="oldPassword" render={({ field }) => ( <FormItem><FormLabel>Old Password</FormLabel><FormControl><Input type="password" {...field} disabled={isPending} placeholder="Enter your current password"/></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={changePasswordForm.control} name="newPassword" render={({ field }) => ( <FormItem><FormLabel>New Password</FormLabel><FormControl><Input type="password" {...field} disabled={isPending} placeholder="Enter a new password"/></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={changePasswordForm.control} name="confirmPassword" render={({ field }) => ( <FormItem><FormLabel>Confirm New Password</FormLabel><FormControl><Input type="password" {...field} disabled={isPending} placeholder="Confirm your new password" /></FormControl><FormMessage /></FormItem>)} />
                    <Button type="submit" className="w-full" disabled={isPending}>
                      {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                      Change Password
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          )}
          {loggedInUser === 'admin2' && (
             <Tabs defaultValue="update-images">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="update-images">Update Images</TabsTrigger>
                <TabsTrigger value="change-password">Change Password</TabsTrigger>
              </TabsList>
              <TabsContent value="update-images" className="pt-4">
                 <div className="space-y-4">
                    <div>
                        <h4 className="text-sm font-medium mb-2">Current Images</h4>
                         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {currentImages.map((src, index) => (
                                <div key={index} className="relative group">
                                    <Image
                                        src={src}
                                        alt={`Current image ${index + 1}`}
                                        width={100}
                                        height={100}
                                        className="rounded-md object-cover w-full aspect-square"
                                    />
                                    { !src.includes('placehold.co') && (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="absolute top-1 right-1 h-7 w-7 p-0"
                                            onClick={() => handleDeleteImage(index)}
                                            disabled={isPending}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <Form {...updateImagesForm}>
                        <form onSubmit={updateImagesForm.handleSubmit(handleUpdateImages)} className="space-y-4 border-t pt-4">
                             <h4 className="text-sm font-medium">Upload New Images</h4>
                            {[1, 2, 3, 4, 5].map((i) => {
                                const fieldName = `image${i}` as const;
                                return (
                                    <FormField
                                        key={i}
                                        control={updateImagesForm.control}
                                        name={fieldName}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Replace Image {i}</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        disabled={isPending}
                                                        onChange={(e) => field.onChange(e.target.files)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                );
                            })}
                            <Button type="submit" className="w-full" disabled={isPending}>
                                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImageIcon className="mr-2 h-4 w-4" />}
                                Update Images
                            </Button>
                        </form>
                    </Form>
                </div>
              </TabsContent>
              <TabsContent value="change-password" className="pt-4">
                <Form {...changePasswordForm}>
                  <form onSubmit={changePasswordForm.handleSubmit(handleChangePassword)} className="space-y-4">
                    <FormField control={changePasswordForm.control} name="oldPassword" render={({ field }) => ( <FormItem><FormLabel>Old Password</FormLabel><FormControl><Input type="password" {...field} disabled={isPending} placeholder="Enter your current password"/></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={changePasswordForm.control} name="newPassword" render={({ field }) => ( <FormItem><FormLabel>New Password</FormLabel><FormControl><Input type="password" {...field} disabled={isPending} placeholder="Enter a new password"/></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={changePasswordForm.control} name="confirmPassword" render={({ field }) => ( <FormItem><FormLabel>Confirm New Password</FormLabel><FormControl><Input type="password" {...field} disabled={isPending} placeholder="Confirm your new password" /></FormControl><FormMessage /></FormItem>)} />
                    <Button type="submit" className="w-full" disabled={isPending}>
                      {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                      Change Password
                    </Button>
                  </form>
                </Form>
              </TabsContent>
             </Tabs>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>Login to manage application content.</CardDescription>
        </CardHeader>
        <Form {...loginForm}>
          <form onSubmit={loginForm.handleSubmit(handleLogin)}>
            <CardContent className="space-y-4">
              <FormField control={loginForm.control} name="username" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl><Input placeholder="admin or admin2" {...field} disabled={isPending} /></FormControl>
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