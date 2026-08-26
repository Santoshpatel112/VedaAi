import { cookies } from "next/headers";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "teacher" | "admin";
  school?: string;
  department?: string;
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("veda_session")?.value;

  if (!token) {
    return null; // No session cookie — unauthenticated
  }

  try {
    const parsed = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    if (!parsed?.id || !parsed?.email) return null;
    return parsed as UserSession;
  } catch {
    return null;
  }
}

export async function setSession(user: UserSession): Promise<void> {
  const cookieStore = await cookies();
  const token = Buffer.from(JSON.stringify(user)).toString("base64");
  cookieStore.set("veda_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("veda_session");
}
