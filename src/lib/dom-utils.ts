export interface BlockNodeData {
    id: string;
    originalHTML: string;
    translatedHTML?: string;
    element: HTMLElement;
}

const BLOCK_TAGS = new Set([
    'ADDRESS', 'ARTICLE', 'ASIDE', 'BLOCKQUOTE', 'CANVAS', 'DD', 'DIV', 'DL', 'DT',
    'FIELDSET', 'FIGCAPTION', 'FIGURE', 'FOOTER', 'FORM', 'H1', 'H2', 'H3', 'H4',
    'H5', 'H6', 'HEADER', 'HR', 'LI', 'MAIN', 'NAV', 'NOSCRIPT', 'OL', 'P', 'PRE',
    'SECTION', 'TABLE', 'TFOOT', 'UL', 'VIDEO', 'TD', 'TH'
]);

const EXCLUDE_SELECTOR = 'script, style, noscript, meta, link, math, svg, code, textarea, [translate="no"]';

function isBlockElement(node: Node): boolean {
    return node.nodeType === Node.ELEMENT_NODE && BLOCK_TAGS.has((node as HTMLElement).tagName);
}

function hasBlockChildren(element: HTMLElement): boolean {
    for (let child = element.firstChild; child; child = child.nextSibling) {
        if (isBlockElement(child)) {
            return true;
        }
    }
    return false;
}

export function getTranslatableBlocks(root: HTMLElement): BlockNodeData[] {
    const blocks: BlockNodeData[] = [];
    let index = 0;

    // Helper to traverse and find leaf-ish blocks
    function traverse(element: HTMLElement) {
        if (element.matches && element.matches(EXCLUDE_SELECTOR)) return;

        // If it's a block element
        if (BLOCK_TAGS.has(element.tagName)) {
            // Check if it has block children. If NOT, it's a candidate (leaf block).
            // Exception: specific tags like P, H*, LI, TD, TH are usually good targets even if they have some block children (rare but possible),
            // but for safety, let's stick to "no block children" or "explicit text structure".
            // Actually, simply: If it has NO block children, it's a content block.
            if (!hasBlockChildren(element)) {
                // Ensure it has some text content
                if (element.textContent && element.textContent.trim().length > 0) {
                    blocks.push({
                        id: `block-${index++}`,
                        originalHTML: element.innerHTML,
                        element: element
                    });
                }
                // Do not traverse children of a selected block (we translate the whole innerHTML)
                return;
            }
        }

        // Continue traversing children
        for (let child = element.firstChild; child; child = child.nextSibling) {
            if (child.nodeType === Node.ELEMENT_NODE) {
                traverse(child as HTMLElement);
            }
        }
    }

    traverse(root);
    return blocks;
}

export function replaceBlockHTML(blockData: BlockNodeData, newHTML: string) {
    if (blockData.element) {
        blockData.element.innerHTML = newHTML;
    }
}


export function minifyHTML(html: string): { minified: string, map: Record<string, string> } {
    const map: Record<string, string> = {};
    let idCounter = 0;

    // Regex to match opening tags with attributes
    // <tagName (attributes) >
    // We strictly match tags that HAVE attributes (space followed by something)
    // We ignore self-closing slash for now to keep it simple, or handle it? innerHTML usually normalizes.
    const minified = html.replace(/<([a-z0-9]+)(\s+[^>]+)>/ig, (match, tagName, attributes) => {
        // If attributes matches nothing or just whitespace, skip (but regex requires space+something)
        if (!attributes || attributes.trim().length === 0) return match;

        // Skip if it's already a simple tag we don't want to touch?
        // But the point is to save tokens on attributes like class="...".

        const id = (idCounter++).toString();
        map[id] = attributes;

        // Replace with <div data-tm="0">
        // We use data-tm (Translation Minify)
        return `<${tagName} data-tm="${id}">`;
    });

    return { minified, map };
}

export function restoreHTML(minifiedHTML: string, map: Record<string, string>): string {
    // Match tags with data-tm="id"
    return minifiedHTML.replace(/<([a-z0-9]+)\s+data-tm="(\d+)"\s*\/?>/ig, (match, tagName, id) => {
        const originalAttrs = map[id];
        if (originalAttrs) {
            // Restore: <div + originalAttrs + >
            // Note: originalAttrs includes the leading space from the capture group
            return `<${tagName}${originalAttrs}>`;
        }
        return match; // Fallback
    });
}

