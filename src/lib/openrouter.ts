
export interface TranslationResponse {
    success: boolean;
    data?: string[];
    error?: string;
}

export async function translateText(
    texts: string[],
    apiKey: string,
    model: string = 'openai/gpt-3.5-turbo',
    context?: { title?: string, description?: string }
): Promise<TranslationResponse> {
    const contextStr = context ? `
Context:
- Title: ${context.title || 'N/A'}
- Description: ${context.description || 'N/A'}` : '';

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                // 'HTTP-Referer': 'http://localhost:3000', // Optional
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: `You are a professional translator. Translate the following HTML snippets from English to Japanese.
${contextStr}

Rules:
1. **Output Format**: MUST be a valid JSON array of strings. 
   - Input: ["<p>Hello <b>World</b></p>", "Title"]
   - Output: ["<p>こんにちは<b>世界</b></p>", "タイトル"]
2. **Grammar & Tone**: Use "Da/Aru" style (常体) suitable for academic/encyclopedic content (like Wikipedia). Do NOT use "Desu/Masu".
   - Natural: "表現論は...研究するものである。" (Good)
   - Unnatural: "表現論は...研究します。" (Bad)
3. **HTML & Ambiguity**:
   - You will receive HTML fragments. Preserve all tags (a, b, i, span, etc.).
   - **IMPORTANT**: Rearrange tags to wrap the corresponding Japanese word.
     - English: "The study of <a href='...'>groups</a>."
     - Japanese: "<a href='...'>群</a>の研究。" (Link wraps 'Group', particle 'no' is outside).
     - WRONG: "の<a href='...'>群</a>研究" or "<a href='...'>群の研究</a>" (if original only linked 'groups').
4. **Cleanup**:
   - Remove English articles (a, an, the) effectively. Do not leave "A" or "The" as text artifacts.
   - Remove spaces between Japanese characters unless necessary.
5. **Robustness**:
   - If a snippet is just a number or symbol, return strict JSON string of it.
   - Do not add explanations. ONLY return the JSON array.`
                    },
                    {
                        role: 'user',
                        content: JSON.stringify(texts) // Send as JSON array to preserve structure
                    }
                ],
                temperature: 0.3,
                response_format: { type: "json_object" } // Try to force JSON mode if supported by provider
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            return { success: false, error: errorData.error?.message || 'API request failed' };
        }

        const data = await response.json();
        let content = data.choices[0].message.content;

        // The model might return a JSON array string as requested, or just text.
        // We should parse it back.
        let translatedTexts: string[] = [];
        try {
            // Find the first '[' and last ']' to extract the JSON array if there's noise
            const start = content.indexOf('[');
            const end = content.lastIndexOf(']');

            if (start !== -1 && end !== -1 && end > start) {
                const jsonStr = content.substring(start, end + 1);
                translatedTexts = JSON.parse(jsonStr);
            } else {
                // Fallback: try parsing the whole thing
                translatedTexts = JSON.parse(content);
            }

            // Validate it is an array
            if (!Array.isArray(translatedTexts)) {
                const values = Object.values(translatedTexts);

                // Case 1: Wrapped Array (e.g. {"0": [...]} or {"result": [...]})
                if (values.length === 1 && Array.isArray(values[0])) {
                    translatedTexts = values[0];
                }
                // Case 2: Indexed Object (e.g. {"0": "...", "1": "..."})
                else {
                    const keys = Object.keys(translatedTexts);
                    // Check if keys are all numeric strings
                    if (keys.length > 0 && keys.every(k => !isNaN(parseInt(k)))) {
                        // Convert to array by sorting keys numerically
                        translatedTexts = Object.entries(translatedTexts)
                            .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
                            .map(entry => entry[1] as string);
                    }
                    // Handle single string response for single input (Edge case)
                    else if (texts.length === 1 && typeof translatedTexts === 'string') {
                        translatedTexts = [translatedTexts];
                    } else {
                        throw new Error("Response is not an array");
                    }
                }
            }

        } catch (e) {
            // If parsing specific JSON fails, maybe valid JSON wasn't returned.
            // Fallback: If we sent 1 text, and response is just text, assume it's the translation
            if (texts.length === 1) {
                // Strategy 1: Smart Regex Extraction (Best for Single Item)
                // This ignores ANY trailing garbage (e.g. `"]\n"]`) by capturing correctly escaped string content.
                const match = content.match(/^\s*\[\s*"((?:[^"\\]|\\.)*)"/s);
                if (match) {
                    try {
                        // Reconstruct valid JSON to parse escaping correctly
                        const extracted = JSON.parse(`["${match[1]}"]`);
                        translatedTexts = extracted;
                        console.warn("JSON parse failed, recovered via Regex extraction.");
                    } catch (e) {
                        // Regex matched but inner parse failed, proceed to heuristic
                    }
                }

                if (!translatedTexts || translatedTexts.length === 0) { // Ensure it runs if translatedTexts is still empty
                    let cleanContent = content.trim();

                    // Aggressive cleanup for common LLM hallucinations at the end of the string
                    // Case: `["..."] "]` -> `["..."]`
                    cleanContent = cleanContent.replace(/"]\s*"]\s*$/g, '"]');
                    // Case: `["..."]"` -> `["..."]`
                    cleanContent = cleanContent.replace(/"]\s*"$/g, '"]');
                    // Case: `["..."]]` -> `["..."]`
                    cleanContent = cleanContent.replace(/\]\s*\]\s*$/g, ']');

                    // Attempt to "repair" if it looks like a JSON array wrap: ["..."]
                    // This happens often with HTML content where quotes inside attributes aren't escaped properly by the LLM.
                    if (cleanContent.startsWith('[') && cleanContent.endsWith(']')) {
                        // Remove outer brackets
                        cleanContent = cleanContent.substring(1, cleanContent.length - 1).trim();

                        // Remove outer quotes if they exist (both single and double)
                        // We only strip IF it starts AND ends with the same quote type
                        if ((cleanContent.startsWith('"') && cleanContent.endsWith('"')) ||
                            (cleanContent.startsWith("'") && cleanContent.endsWith("'"))) {
                            cleanContent = cleanContent.substring(1, cleanContent.length - 1);

                            // Extremely basic unescape for escaped quotes that might have been there
                            // If the LLM tried to escape but failed on some, we might have mixed state, 
                            // but generally we just want the raw HTML.
                            // Replacing \" with " is usually safe for HTML content context.
                            cleanContent = cleanContent.replace(/\\"/g, '"');
                        }
                    }

                    translatedTexts = [cleanContent];
                    console.warn("JSON parse failed, performing fallback repair on single item.");
                }
            } else {
                console.error("Failed to parse batch translation response", content);
                return { success: false, error: "Failed to parse translation response" };
            }
        }

        return { success: true, data: translatedTexts };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
