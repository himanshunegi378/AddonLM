"use server";

import prisma from "./prismaClient";

export const createUser = async ({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) => {
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password,
    },
  });
  return user;
};
