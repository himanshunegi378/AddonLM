import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { addPluginToChatbot, createChatbot } from "@/services/chatbot.service";
import { createPlugin } from "@/services/plugin.service";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if user with email already exists
    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    const user = await prisma.$transaction(async (tx) => {
      // Create user
      // In a real app, you would hash the password with bcrypt
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password, // In production, this should be hashed!
          // Create developer profile for the user
          developer: {
            create: {},
          },
        },
        include: {
          developer: true,
        },
      });

      // create a chatbot
      const chatbot = await createChatbot({
        name: "Arithmetic",
        userId: user.id,
        description: "A chatbot for arithmetic operations",
        options: {
          tx,
        },
      });

      // create a plugin
      const plugin = await createPlugin({
        name: "Arithmetic",
        code: `return tool(
    async ({ num1, num2 }) => {
      return num1 + num2;
    },
    {
      name: "add",
      description: "Add two numbers",
      schema: z.object({
        num1: z.number(),
        num2: z.number(),
      }),
    }
  );`,
        userId: user.id,
        options: {
          tx,
        },
      });

      // add a plugin to chatbot
      await addPluginToChatbot({
        chatbotId: chatbot.id,
        pluginId: plugin.id,
        enabled: true,
        options: {
          tx,
        },
      });

      return user;
    });

    // Set auth cookie
    const cookieStore = await cookies();
    cookieStore.set(
      "auth-token",
      JSON.stringify({ id: user.id, name: user.name }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      }
    );

    // Return user data (exclude password)
    return NextResponse.json({
      message: "Registration successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
