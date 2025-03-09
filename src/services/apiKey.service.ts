"use server";

import prisma from "./prismaClient";

export async function getUserApiKey(userId: number): Promise<string | null> {
  const apiKey = await prisma.apiKey.findUnique({
    where: { userId },
    select: { key: true },
  });

  return apiKey?.key || null;
}

export async function setUserApiKey(
  userId: number,
  apiKey: string
): Promise<void> {
  await prisma.apiKey.upsert({
    where: { userId },
    update: { key: apiKey },
    create: { userId, key: apiKey },
  });
}
