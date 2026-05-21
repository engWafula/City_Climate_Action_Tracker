import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { isAdminAuthenticated } from "@/lib/auth";
import { parseActionFromText } from "@/lib/llm-import";
import { importActionSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });
    }

    const body: unknown = await request.json();
    const { text } = importActionSchema.parse(body);
    const action = await parseActionFromText(text);

    return NextResponse.json(action);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid import text.", issues: error.issues }, { status: 400 });
    }

    console.error("Action import failed", error);
    return NextResponse.json({ error: "Unable to import that action right now." }, { status: 502 });
  }
}
