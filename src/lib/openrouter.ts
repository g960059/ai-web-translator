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
5. **Structure & Math**:
   - **Headers**: If a snippet starts with a bold label followed by a period and then a sentence (e.g., "**Definition.** Let X be..."), separate them.
     - Output: "**定義** Xを...とする。" (Do NOT say "定義。Xを...").
   - **Math Punctuation**: 
     - If a MathML/math string implies a pause or end of sentence (comma/period inside), respect it but do NOT add redundant Japanese punctuation like "。, " or "., ".
     - **CRITICAL**: If a math tag ends with a period (e.g. "<math>G.</math>"), **MOVE the period OUTSIDE** the tag and use Japanese punctuation.
       - Input: "...group <math>G.</math>"
       - Output: "...群<math>G</math>。" (Period moved out and localized).
     - **Images**:
       - **Simple Math (Convert to Text)**: If an image represents a simple symbol ending in a period (e.g., "alt='G.'"), replace it with italicized text.
         - Input: "<img alt='G.'>" -> Output: "<i>G</i>。" (Remove image, use text + Japanese period).
       - **Complex Math (Suppress Period)**: If a complex image must be kept and includes a period, **DO NOT** add a Japanese period after it.
         - Input: "...<img alt='Complex eq.'>" -> Output: "...<img alt='Complex eq.'>" (No "。" added).
   - **Academic Phrasing**: Use natural academic phrasing for definitions and theorems.
     - "Let X be Y" -> "XをYとする" (Not "XがYであるようにさせる").
     - "uniquely determined" -> "一意に定まる".
6. **Punctuation (Strict)**:
   - **Do NOT** add a period (。) at the end of headers, titles, or short phrases/labels.
     - Good: "定義（類関数）", "マッキーの既約判定法"
     - Bad: "定義（類関数）。", "マッキーの既約判定法。"
7. **Coverage**:
   - **Translate EVERY header**, even if it is a single word (e.g. "Properties", "Lemma", "Proof").
     - Input: "**Properties**" -> Output: "**性質**" (Do NOT skip!).
8. **Robustness**:
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
        let parsedData: any = null;

        try {
            // Strategy A: Try parsing the whole content first.
            parsedData = JSON.parse(content);
        } catch (e) {
            // Strategy B: Substring extraction. (Original logic)
            try {
                const start = content.indexOf('[');
                const end = content.lastIndexOf(']');

                // Only try if simple substring looks valid
                if (start !== -1 && end !== -1 && end > start) {
                    parsedData = JSON.parse(content.substring(start, end + 1));
                }
            } catch (e2) {
                // Strategy C: Smart Recursive Extraction (New fix for trailing garbage)
                const extracted = extractValidJsonArray(content);
                if (extracted) {
                    try {
                        parsedData = JSON.parse(extracted);
                    } catch (e3) {
                        // Fallthrough
                    }
                }

                if (!parsedData) {
                    // Strategy D: JSON Object Wrapper check
                    try {
                        const startObj = content.indexOf('{');
                        const endObj = content.lastIndexOf('}');
                        if (startObj !== -1 && endObj !== -1 && endObj > startObj) {
                            parsedData = JSON.parse(content.substring(startObj, endObj + 1));
                        }
                    } catch (e4) {
                        // Fallthrough
                    }
                }
            }
        }

        if (parsedData) {
            if (Array.isArray(parsedData)) {
                translatedTexts = parsedData;
            } else if (typeof parsedData === 'object') {
                // It is an object. We need to find the data.

                // Check 1: Look for specific known keys first (Prioritized)
                const knownKeys = ['output', 'result', 'translation', 'translations', 'data', 'response', 'translated', 'translated_text'];
                let targetArray: string[] | undefined;

                for (const key of knownKeys) {
                    // Case-insensitive lookup (e.g. "Output" vs "output")
                    const foundKey = Object.keys(parsedData).find(k => k.toLowerCase() === key);
                    if (foundKey) {
                        const value = parsedData[foundKey];
                        if (Array.isArray(value) && value.every((i: any) => typeof i === 'string')) {
                            targetArray = value;
                            break;
                        }
                    }
                }

                if (targetArray) {
                    translatedTexts = targetArray;
                }
                else {
                    // Check 2: Fallback - find ANY array of strings, but exclude "input"-like keys
                    const excludeKeys = ['input', 'source', 'original', 'query', 'prompt'];
                    const potentialEntry = Object.entries(parsedData).find(([k, v]) =>
                        !excludeKeys.includes(k.toLowerCase()) &&
                        Array.isArray(v) &&
                        v.every((i: any) => typeof i === 'string')
                    );

                    if (potentialEntry) {
                        translatedTexts = potentialEntry[1] as string[];
                    }
                    // Check 3: Key-Value Map (Existing logic for "Input" -> "Output")
                    else {
                        const keys = Object.keys(parsedData);
                        // Case: Numeric Indexed Object (e.g. {"0": "...", "1": "..."})
                        if (keys.length > 0 && keys.every(k => !isNaN(parseInt(k)))) {
                            translatedTexts = Object.entries(parsedData)
                                .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
                                .map(entry => entry[1] as string);
                        }
                        // Case: Input Text -> Output Text Map
                        else if (keys.length > 0) {
                            const mappedTexts: string[] = [];
                            let matchCount = 0;

                            for (const text of texts) {
                                const key = keys.find(k => k === text || k.trim() === text.trim());
                                if (key !== undefined) {
                                    mappedTexts.push((parsedData as any)[key]);
                                    matchCount++;
                                } else {
                                    mappedTexts.push("");
                                }
                            }

                            if (matchCount > 0 && matchCount >= texts.length * 0.5) {
                                translatedTexts = mappedTexts;
                            } else {
                                // Handle single string response for single input (Edge case)
                                if (texts.length === 1 && typeof parsedData === 'string') { // Unlikely 'typeof object' check above prevents this but strictly speaking...
                                    translatedTexts = [parsedData as unknown as string];
                                }
                                // We don't throw immediately, we might fall through to regex if this logic fails to produce meaningful translatedTexts? 
                                // Actually we should probably error here if we found JSON but couldn't make sense of it.
                                if (translatedTexts.length === 0) {
                                    // One last check: maybe the model returned {"translation": "single string"} for single input
                                    const potentialString = Object.values(parsedData).find(v => typeof v === 'string');
                                    if (texts.length === 1 && potentialString) {
                                        translatedTexts = [potentialString as string];
                                    } else {
                                        // If it was a valid object but we couldn't extract, we might want to try regex just in case the JSON was "analysis" and the REAL array was text outside?
                                        // But 'Strategy A' parses whole content. 
                                        // If 'Strategy A' succeeded, then we trust the object structure.
                                        // If 'Strategy B' succeeded, same.
                                        throw new Error("Parsed JSON object but could not interpret as translation array or map");
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        try {
            if (translatedTexts.length === 0 && !parsedData) {
                // Proceed to fallback regex logic (wrapping it in the try block as before for the structure)
                throw new Error("JSON parse failed");
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

                if (!translatedTexts || translatedTexts.length === 0) {
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

function extractValidJsonArray(str: string): string | null {
    const start = str.indexOf('[');
    if (start === -1) return null;

    let depth = 0;
    let inString = false;
    let escape = false;

    for (let i = start; i < str.length; i++) {
        const char = str[i];

        if (inString) {
            if (escape) {
                escape = false;
            } else if (char === '\\') { // Backslash in string -> \\ in JS code
                escape = true;
            } else if (char === '"') {
                inString = false;
            }
        } else {
            if (char === '[') {
                depth++;
            } else if (char === ']') {
                depth--;
                if (depth === 0) {
                    return str.substring(start, i + 1);
                }
            } else if (char === '"') {
                inString = true;
            }
        }
    }
    return null;
}
