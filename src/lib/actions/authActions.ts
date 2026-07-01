"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isDisposableEmail } from "@/lib/security/disposable";
import { rateLimit } from "@/lib/security/rateLimit";

const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Za-z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  name: z.string().optional(),
});

import { headers } from 'next/headers';

export async function registerUser(formData: FormData) {
  try {
    const ip = headers().get('x-forwarded-for') || '127.0.0.1';
    const { success } = await rateLimit(`register_${ip}`, 3, 24 * 60 * 60 * 1000); // 3 per 24h
    if (!success) {
      return { error: "Demasiados intentos. Inténtalo más tarde." };
    }

    const rawEmail = formData.get("email") as string;
    const rawPassword = formData.get("password") as string;
    const rawName = formData.get("name") as string;

    const email = rawEmail?.toLowerCase().trim();
    const name = rawName?.trim();

    const parsed = registerSchema.safeParse({ email, password: rawPassword, name });

    if (!parsed.success) {
      return { error: "Datos inválidos. Comprueba el formato de la contraseña o del email." };
    }

    if (isDisposableEmail(email)) {
      return { error: "No se permiten dominios de correo temporales." };
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, 12);

    await prisma.user.create({
      data: {
        email: parsed.data.email,
        name: parsed.data.name,
        hashedPassword,
      },
    });

    return { success: true };
  } catch (error) {
    // Catch unique constraint (Prisma P2002) or any other
    return { error: "No se pudo registrar la cuenta. Inténtalo de nuevo." };
  }
}
