'use server';

import { z } from 'zod';
import { updateGoldPrice, updateMessage, getCarouselImages, updateCarouselImages } from '@/lib/data';
import { revalidatePath } from 'next/cache';

// In a real app, these would be in a secure database and environment variables.
const ADMIN_USERNAME = 'admin';
let ADMIN_PASSWORD = 'password123';
const MASTER_PASSWORD = 'gold123';

const ADMIN2_USERNAME = 'admin2';
let ADMIN2_PASSWORD = 'password456';


const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export async function loginAction(formData: FormData) {
  try {
    const parsed = loginSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!parsed.success) {
      return { success: false, message: 'Invalid form data.' };
    }

    const { username, password } = parsed.data;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      return { success: true, message: 'Login successful!', user: 'admin' };
    } else if (username === ADMIN2_USERNAME && password === ADMIN2_PASSWORD) {
      return { success: true, message: 'Login successful!', user: 'admin2' };
    }
    else {
      return { success: false, message: 'Invalid username or password.' };
    }
  } catch (error) {
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

const updatePriceSchema = z.object({
  price: z.coerce.number().positive('Price must be a positive number.'),
});

export async function updatePriceAction(formData: FormData) {
  try {
    const parsed = updatePriceSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!parsed.success) {
      return { success: false, message: parsed.error.errors[0].message };
    }

    updateGoldPrice(parsed.data.price);
    revalidatePath('/'); // This will re-render the page with the new price
    return { success: true, message: `Gold price updated to ₹${parsed.data.price.toLocaleString('en-IN')}` };
  } catch (error) {
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

const changePasswordSchema = z.object({
  oldPassword: z.string(),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long.'),
  user: z.string(),
});

export async function changePasswordAction(formData: FormData) {
  try {
    const parsed = changePasswordSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!parsed.success) {
      return { success: false, message: parsed.error.errors[0].message };
    }

    const { oldPassword, newPassword, user } = parsed.data;
    
    if (user === 'admin') {
        if (oldPassword === ADMIN_PASSWORD) {
          ADMIN_PASSWORD = newPassword;
          return { success: true, message: 'Password changed successfully.' };
        } else {
          return { success: false, message: 'Incorrect old password.' };
        }
    } else if (user === 'admin2') {
        if (oldPassword === ADMIN2_PASSWORD) {
            ADMIN2_PASSWORD = newPassword;
            return { success: true, message: 'Password changed successfully.' };
        } else {
            return { success: false, message: 'Incorrect old password.' };
        }
    } else {
        return { success: false, message: 'Invalid user.' };
    }

  } catch (error) {
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

const resetPasswordSchema = z.object({
    masterPassword: z.string(),
    newPassword: z.string().min(8, 'New password must be at least 8 characters long.'),
});

export async function resetPasswordWithMasterKeyAction(formData: FormData) {
    try {
      const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData.entries()));

      if (!parsed.success) {
          return { success: false, message: parsed.error.errors[0].message };
      }

      const { masterPassword, newPassword } = parsed.data;

      if (masterPassword === MASTER_PASSWORD) {
          ADMIN_PASSWORD = newPassword;
          return { success: true, message: 'Password has been reset successfully.' };
      } else {
          return { success: false, message: 'Incorrect master password.' };
      }
    } catch (error) {
      return { success: false, message: 'An unexpected error occurred.' };
    }
}

const updateMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty.'),
});

export async function updateMessageAction(formData: FormData) {
  try {
    const parsed = updateMessageSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!parsed.success) {
      return { success: false, message: parsed.error.errors[0].message };
    }

    updateMessage(parsed.data.message);
    revalidatePath('/');
    return { success: true, message: 'Message updated successfully!' };
  } catch (error) {
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

const updateImagesSchema = z.object({
  image1: z.string().optional(),
  image2: z.string().optional(),
  image3: z.string().optional(),
  image4: z.string().optional(),
  image5: z.string().optional(),
});


export async function updateImagesAction(formData: FormData) {
    try {
        const parsed = updateImagesSchema.safeParse(Object.fromEntries(formData.entries()));

        if (!parsed.success) {
            return { success: false, message: "Invalid image data." };
        }
        
        const currentImages = getCarouselImages();
        const newImages = Object.values(parsed.data).map((dataUri, index) => {
            return (dataUri && dataUri.startsWith('data:image')) ? dataUri : currentImages[index];
        });

        updateCarouselImages(newImages.slice(0, 5));
        revalidatePath('/');
        return { success: true, message: 'Images updated successfully!' };
    } catch (error) {
        return { success: false, message: 'An unexpected error occurred.' };
    }
}

const deleteImageSchema = z.object({
  index: z.coerce.number().int().min(0).max(4),
});

export async function deleteImageAction(formData: FormData) {
  try {
    const parsed = deleteImageSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!parsed.success) {
      return { success: false, message: "Invalid image index." };
    }

    const { index } = parsed.data;
    const currentImages = getCarouselImages();
    currentImages[index] = "https://placehold.co/600x400.png";
    updateCarouselImages(currentImages);
    revalidatePath('/');
    return { success: true, message: `Image ${index + 1} deleted successfully.` };
  } catch (error) {
    return { success: false, message: 'An unexpected error occurred.' };
  }
}