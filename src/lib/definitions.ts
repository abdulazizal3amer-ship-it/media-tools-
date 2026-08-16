import * as z from "zod";

// Saudi CR numbers are 10 digits.
export const SignupFormSchema = z.object({
  businessName: z
    .string()
    .min(2, { error: "اسم المنشأة يجب أن يكون حرفين على الأقل" })
    .trim(),
  crNumber: z
    .string()
    .regex(/^\d{10}$/, { error: "رقم السجل التجاري يجب أن يتكون من 10 أرقام" })
    .trim(),
  phone: z
    .string()
    .regex(/^05\d{8}$/, { error: "رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام" })
    .trim(),
  city: z.string().min(2, { error: "الرجاء اختيار المدينة" }).trim(),
  password: z
    .string()
    .min(8, { error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" })
    .regex(/[a-zA-Z]/, { error: "يجب أن تحتوي على حرف واحد على الأقل" })
    .regex(/[0-9]/, { error: "يجب أن تحتوي على رقم واحد على الأقل" }),
});

export type SignupFormState =
  | {
      errors?: {
        businessName?: string[];
        crNumber?: string[];
        phone?: string[];
        city?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export const LoginFormSchema = z.object({
  crNumber: z.string().min(1, { error: "الرجاء إدخال رقم السجل التجاري" }).trim(),
  password: z.string().min(1, { error: "الرجاء إدخال كلمة المرور" }),
});

export type LoginFormState =
  | {
      errors?: {
        crNumber?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;
