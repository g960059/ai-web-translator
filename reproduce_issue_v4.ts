
const content = `["<span data-tm=\\"0\\"><span data-tm=\\"1\\"><math data-tm=\\"2\\">\\n <semantics>\\n <mrow data-tm=\\"3\\">\\n <mstyle data-tm=\\"4\\">\\n <msub>\\n <mrow data-tm=\\"5\\">\\n <mrow data-tm=\\"6\\">\\n <mi data-tm=\\"7\\">L</mi>\\n </mrow>\\n </mrow>\\n <mrow data-tm=\\"8\\">\\n <mi>Y</mi>\\n </mrow>\\n </msub>\\n <mi>f</mi>\\n <mo>=</mo>\\n <mi>Y</mi>\\n <mo data-tm=\\"9\\">(</mo>\\n <mi>f</mi>\\n <mo data-tm=\\"10\\">)</mo>\\n </mstyle>\\n </mrow>\\n <annotation data-tm=\\"11\\">{\\\\displaystyle {\\\\mathcal {L}}_{Y}f=Y(f)}</annotation>\\n </semantics>\\n</math></span><img data-tm=\\"12\\"></span>", "<span data-tm=\\"0\\"><span data-tm=\\"1\\"><math data-tm=\\"2\\">\\n <semantics>\\n <mrow data-tm=\\"3\\">\\n <mstyle data-tm=\\"4\\">\\n <msub>\\n <mrow data-tm=\\"5\\">\\n <mrow data-tm=\\"6\\">\\n <mi data-tm=\\"7\\">L</mi>\\n </mrow>\\n </mrow>\\n <mrow data-tm=\\"8\\">\\n <mi>Y</mi>\\n </mrow>\\n </msub>\\n <mo data-tm=\\"9\\">(</mo>\\n <mi>S</mi>\\n <mo>⊗<!-- ⊗ --></mo>\\n <mi>T</mi>\\n <mo data-tm=\\"10\\">)</mo>\\n <mo>=</mo>\\n <mo data-tm=\\"11\\">(</mo>\\n <msub>\\n <mrow data-tm=\\"12\\">\\n <mrow data-tm=\\"13\\">\\n <mi data-tm=\\"14\\">L</mi>\\n </mrow>\\n </mrow>\\n <mrow data-tm=\\"15\\">\\n <mi>Y</mi>\\n </mrow>\\n </msub>\\n <mi>S</mi>\\n <mo data-tm=\\"16\\">)</mo>\\n <mo>⊗<!-- ⊗ --></mo>\\n <mi>T</mi>\\n <mo>+</mo>\\n <mi>S</mi>\\n <mo>⊗<!-- ⊗ --></mo>\\n <mo data-tm=\\"17\\">(</mo>\\n <msub>\\n <mrow data-tm=\\"18\\">\\n <mrow data-tm=\\"19\\">\\n <mi data-tm=\\"20\\">L</mi>\\n </mrow>\\n </mrow>\\n <mrow data-tm=\\"21\\">\\n <mi>Y</mi>\\n </mrow>\\n </msub>\\n <mi>T</mi>\\n <mo data-tm=\\"22\\">)</mo>\\n <mo>.</mo>\\n </mstyle>\\n </mrow>\\n <annotation data-tm=\\"23\\">{\\\\displaystyle {\\\\mathcal {L}}_{Y}(S\\\\otimes T)=({\\\\mathcal {L}}_{Y}S)\\\\otimes T+S\\\\otimes ({\\\\mathcal {L}}_{Y}T).}</annotation>\\n </semantics>\\n</math></span><img data-tm=\\"24\\"></span>"] </span>"]`;

console.log("Content length:", content.length);

// Current Logic Simulation
try {
    const start = content.indexOf('[');
    const end = content.lastIndexOf(']'); // captures the LAST bracket, including garbage
    console.log(`Start: ${start}, End: ${end}`);
    if (start !== -1 && end !== -1 && end > start) {
        const sub = content.substring(start, end + 1);
        console.log("Substring to parse:");
        console.log(sub.substring(sub.length - 20)); // Show tail
        JSON.parse(sub);
        console.log("Parsed successfully!");
    } else {
        console.log("No brackets found");
    }
} catch (e: any) {
    console.error("Parse failed as expected:", e.message);
}

// Proposed Fix: Recursive Bracket Matcher
function extractFirstJsonArray(str: string) {
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
            } else if (char === '\\\\') { // Backslash in string -> \\ in JS code
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

console.log("--- Testing Fix ---");
const extracted = extractFirstJsonArray(content);
if (extracted) {
    try {
        console.log("Extracted candidate length:", extracted.length);
        const parsed = JSON.parse(extracted);
        console.log("Parsed successfully with fix!");
        console.log("Array length:", parsed.length);
    } catch (e: any) {
        console.error("Fix extracted invalid JSON:", e.message);
    }
} else {
    console.log("Fix failed to extract.");
}
