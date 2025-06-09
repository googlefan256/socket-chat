import z from "zod";

export const ClientMessageSchema = z.object({
    message: z
        .string()
        .min(1, "メッセージは必須です")
        .max(500, "メッセージは500文字以内で入力してください"),
    type: z.literal("chat"),
    username: z
        .string()
        .min(1, "ユーザー名は必須です")
        .max(50, "ユーザー名は50文字以内で入力してください"),
});
export const ClientJoinSchema = z.object({
    username: z
        .string()
        .min(1, "ユーザー名は必須です")
        .max(50, "ユーザー名は50文字以内で入力してください"),
    type: z.literal("join"),
});
export type ClientMessage = z.infer<typeof ClientMessageSchema>;

export const ServerMessageSchema = z.object({
    username: z
        .string()
        .min(1, "ユーザー名は必須です")
        .max(50, "ユーザー名は50文字以内で入力してください"),
    message: z
        .string()
        .min(1, "メッセージは必須です")
        .max(500, "メッセージは500文字以内で入力してください"),
    timestamp: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
        message: "無効な日付形式です",
    }),
    type: z.literal("chat"),
});
export type ServerMessage = z.infer<typeof ServerMessageSchema>;

export function safeParse<T>(schema: z.ZodType<T>, data: unknown): T | null {
    const result = schema.safeParse(data);
    if (result.success) {
        return result.data;
    }
    return null;
}

export function safeSerialize<T>(_schema: z.ZodType<T>, data: T): string {
    return JSON.stringify(data);
}
