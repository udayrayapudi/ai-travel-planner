import { getAuth } from "@/lib/auth";

export async function getCurrentUser() {
  const session = await getAuth();
  return session?.user;
}

export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id || null;
}
