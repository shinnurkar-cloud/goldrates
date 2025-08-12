'use server';

import { z } from 'zod';
import { updateGoldPrice } from '@/lib/data';
import { revalidatePath } from 'next/cache';

// In a real app, these would be in a secure database and environment variables.
const ADMIN_USERNAME = 'admin';
let ADMIN_PASSWORD = 'password123';
const MASTER_PASSWORD = 'gold123';

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
      return { success: true, message: 'Login successful!' };
    } else {
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
});

export async function changePasswordAction(formData: FormData) {
  try {
    const parsed = changePasswordSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!parsed.success) {
      return { success: false, message: parsed.error.errors[0].message };
    }

    const { oldPassword, newPassword } = parsed.data;

    if (oldPassword === ADMIN_PASSWORD) {
      ADMIN_PASSWORD = newPassword;
      return { success: true, message: 'Password changed successfully.' };
    } else {
      return { success: false, message: 'Incorrect old password.' };
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
