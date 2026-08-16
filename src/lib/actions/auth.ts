"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";
import {
  SignupFormSchema,
  type SignupFormState,
  LoginFormSchema,
  type LoginFormState,
} from "@/lib/definitions";

export async function signup(
  _state: SignupFormState,
  formData: FormData,
): Promise<SignupFormState> {
  const validated = SignupFormSchema.safeParse({
    businessName: formData.get("businessName"),
    crNumber: formData.get("crNumber"),
    phone: formData.get("phone"),
    city: formData.get("city"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { businessName, crNumber, phone, city, password } = validated.data;

  const existing = await prisma.merchant.findFirst({
    where: { OR: [{ crNumber }, { phone }] },
  });
  if (existing) {
    return {
      message:
        existing.crNumber === crNumber
          ? "يوجد حساب مسجّل بهذا السجل التجاري بالفعل"
          : "يوجد حساب مسجّل بهذا الرقم بالفعل",
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const merchant = await prisma.merchant.create({
    data: { businessName, crNumber, phone, city, passwordHash },
  });

  await createSession(merchant.id);
  redirect("/campaigns/new");
}

export async function login(
  _state: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const validated = LoginFormSchema.safeParse({
    crNumber: formData.get("crNumber"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { crNumber, password } = validated.data;

  const merchant = await prisma.merchant.findUnique({ where: { crNumber } });
  if (!merchant) {
    return { message: "رقم السجل التجاري أو كلمة المرور غير صحيحة" };
  }

  const passwordsMatch = await bcrypt.compare(password, merchant.passwordHash);
  if (!passwordsMatch) {
    return { message: "رقم السجل التجاري أو كلمة المرور غير صحيحة" };
  }

  await createSession(merchant.id);
  redirect("/campaigns/new");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
