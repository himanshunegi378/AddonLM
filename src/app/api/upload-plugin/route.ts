import prisma from "@/services/prismaClient";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  const data = { message: "Hello from the API!" };
  return NextResponse.json(data);
}

const uploadPluginSchema = z.object({
  code: z.string(),
  name: z.string(),
});

export async function POST(req: Request) {
  const unsanitizedJson = await req.json();
  const sanitizedJson = uploadPluginSchema.parse(unsanitizedJson);
  const { code, name } = sanitizedJson
  await prisma.plugin.create({
    data: {
      code,
      name
    }
  });
  return NextResponse.json({ message: "Plugin uploaded successfully!" });
}