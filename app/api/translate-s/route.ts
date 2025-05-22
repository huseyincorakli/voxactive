import { isBlocked } from "@/app/action";
import { translateSentences } from "@/lib/langchain/sentence_translator";
import { translateSentence } from "@/lib/langchain/translate_sentence";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const blocked = await isBlocked();
  if (blocked) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        redirect: "limit-reached",
        error: {
          message: "Your usage limit has been reached",
          code: "TALKAI_ERROR",
        },
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  const { sentences, userlang } = (await request.json()) as {
    sentences: string[];
    userlang: string;
  };

  const response = await translateSentences(sentences, userlang);

  return new NextResponse(JSON.stringify(response), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
