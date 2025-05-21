"use server";
// pronunciationScore.ts
export const getPronunciationScore = async (
  text: string,
  base64Audio: string,
  lang: string = "en"
): Promise<any> => {
  const apiUrl = process.env.NEXT_PUBLIC_PRONOUNCE_API_URL;

  try {
    const response = await fetch(`${apiUrl}/score`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: text,
        base64Audio: base64Audio,
        language: lang,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    // JSON yanıtı al
    const data = await response.json();
    console.log(data);

    return data;

    // Veya eğer API plain text döndürüyorsa:
    // const text = await response.text();
    // return text;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};
