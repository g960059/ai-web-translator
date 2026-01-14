async function N(e,r,f="openai/gpt-3.5-turbo",c){var p;const m=c?`
Context:
- Title: ${c.title||"N/A"}
- Description: ${c.description||"N/A"}`:"";try{const l=await fetch("https://openrouter.ai/api/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${r}`,"Content-Type":"application/json"},body:JSON.stringify({model:f,messages:[{role:"system",content:`You are a professional translator. Translate the following HTML snippets from English to Japanese.
${m}

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
   - Do not add explanations. ONLY return the JSON array.`},{role:"user",content:JSON.stringify(e)}],temperature:.3,response_format:{type:"json_object"}})});if(!l.ok)return{success:!1,error:((p=(await l.json()).error)==null?void 0:p.message)||"API request failed"};let s=(await l.json()).choices[0].message.content,o=[],a=null;try{a=JSON.parse(s)}catch{try{const u=s.indexOf("["),t=s.lastIndexOf("]");u!==-1&&t!==-1&&t>u&&(a=JSON.parse(s.substring(u,t+1)))}catch{const t=S(s);if(t)try{a=JSON.parse(t)}catch{}if(!a)try{const d=s.indexOf("{"),n=s.lastIndexOf("}");d!==-1&&n!==-1&&n>d&&(a=JSON.parse(s.substring(d,n+1)))}catch{}}}if(a){if(Array.isArray(a))o=a;else if(typeof a=="object"){const b=["output","result","translation","translations","data","response","translated","translated_text"];let u;for(const t of b){const d=Object.keys(a).find(n=>n.toLowerCase()===t);if(d){const n=a[d];if(Array.isArray(n)&&n.every(i=>typeof i=="string")){u=n;break}}}if(u)o=u;else{const t=["input","source","original","query","prompt"],d=Object.entries(a).find(([n,i])=>!t.includes(n.toLowerCase())&&Array.isArray(i)&&i.every(g=>typeof g=="string"));if(d)o=d[1];else{const n=Object.keys(a);if(n.length>0&&n.every(i=>!isNaN(parseInt(i))))o=Object.entries(a).sort((i,g)=>parseInt(i[0])-parseInt(g[0])).map(i=>i[1]);else if(n.length>0){const i=[];let g=0;for(const y of e){const O=n.find(M=>M===y||M.trim()===y.trim());O!==void 0?(i.push(a[O]),g++):i.push("")}if(g>0&&g>=e.length*.5)o=i;else if(e.length===1&&typeof a=="string"&&(o=[a]),o.length===0){const y=Object.values(a).find(O=>typeof O=="string");if(e.length===1&&y)o=[y];else throw new Error("Parsed JSON object but could not interpret as translation array or map")}}}}}}try{if(o.length===0&&!a)throw new Error("JSON parse failed")}catch{if(e.length===1){const u=s.match(/^\s*\[\s*"((?:[^"\\]|\\.)*)"/s);if(u)try{o=JSON.parse(`["${u[1]}"]`),console.warn("JSON parse failed, recovered via Regex extraction.")}catch{}if(!o||o.length===0){let t=s.trim();t=t.replace(/"]\s*"]\s*$/g,'"]'),t=t.replace(/"]\s*"$/g,'"]'),t=t.replace(/\]\s*\]\s*$/g,"]"),t.startsWith("[")&&t.endsWith("]")&&(t=t.substring(1,t.length-1).trim(),(t.startsWith('"')&&t.endsWith('"')||t.startsWith("'")&&t.endsWith("'"))&&(t=t.substring(1,t.length-1),t=t.replace(/\\"/g,'"'))),o=[t],console.warn("JSON parse failed, performing fallback repair on single item.")}}else return console.error("Failed to parse batch translation response",s),{success:!1,error:"Failed to parse translation response"}}return{success:!0,data:o}}catch(l){return{success:!1,error:l.message}}}function S(e){const r=e.indexOf("[");if(r===-1)return null;let f=0,c=!1,m=!1;for(let p=r;p<e.length;p++){const l=e[p];if(c)m?m=!1:l==="\\"?m=!0:l==='"'&&(c=!1);else if(l==="[")f++;else if(l==="]"){if(f--,f===0)return e.substring(r,p+1)}else l==='"'&&(c=!0)}return null}const T=new Map;let I=null;function x(e){I!==e&&(I=e,chrome.contextMenus.removeAll(()=>{chrome.runtime.lastError&&console.error("ContextMenus removeAll error:",chrome.runtime.lastError),e?(chrome.contextMenus.create({id:"toggle-selection",title:"Toggle Selection (Original/Translated)",contexts:["selection"]},()=>{chrome.runtime.lastError&&console.error("Menu create error (toggle-selection):",chrome.runtime.lastError)}),chrome.contextMenus.create({id:"toggle-translation",title:"Toggle Page Translation",contexts:["all"]},()=>{chrome.runtime.lastError&&console.error("Menu create error (toggle-translation):",chrome.runtime.lastError)}),chrome.contextMenus.create({id:"retranslate-selection",title:"Re-translate Selection (Force)",contexts:["selection"]},()=>{chrome.runtime.lastError&&console.error("Menu create error (retranslate-selection):",chrome.runtime.lastError)})):(chrome.contextMenus.create({id:"translate-selection",title:"Translate Selection",contexts:["selection"]},()=>{chrome.runtime.lastError&&console.error("Menu create error (translate-selection):",chrome.runtime.lastError)}),chrome.contextMenus.create({id:"toggle-translation",title:"Toggle Page Translation",contexts:["all"]},()=>{chrome.runtime.lastError&&console.error("Menu create error (toggle-translation):",chrome.runtime.lastError)}))}))}chrome.runtime.onInstalled.addListener(()=>{x(!1)});chrome.tabs.onActivated.addListener(e=>{const r=T.get(e.tabId)||!1;x(r)});chrome.tabs.onUpdated.addListener((e,r,f)=>{r.status==="loading"&&(T.set(e,!1),chrome.tabs.query({active:!0,currentWindow:!0},c=>{c[0]&&c[0].id===e&&x(!1)}))});chrome.contextMenus.onClicked.addListener((e,r)=>{r!=null&&r.id&&(e.menuItemId==="translate-selection"?chrome.tabs.sendMessage(r.id,{action:"translate_selection",selectionText:e.selectionText}):e.menuItemId==="retranslate-selection"?chrome.tabs.sendMessage(r.id,{action:"retranslate_selection",selectionText:e.selectionText}):e.menuItemId==="toggle-selection"?chrome.tabs.sendMessage(r.id,{action:"toggle_selection",selectionText:e.selectionText}):e.menuItemId==="toggle-translation"&&chrome.tabs.sendMessage(r.id,{action:"translate",translationScope:"page"}))});chrome.runtime.onMessage.addListener((e,r,f)=>{if(e.action==="state_update")r.tab&&r.tab.id&&(T.set(r.tab.id,e.isTranslated),r.tab.active&&x(e.isTranslated));else if(e.action==="translate_api"){console.log("Background: Received translate_api request",e.requestId);const{apiKey:c,text:m,model:p,context:l,requestId:h}=e;f({status:"accepted"}),r.tab&&r.tab.id&&N(m,c,p,l).then(s=>{console.log("Background: Translation success",h),chrome.tabs.sendMessage(r.tab.id,{action:"translate_api_result",requestId:h,success:s.success,data:s.data,error:s.error})}).catch(s=>{console.error("Background: Translation error",h,s),chrome.tabs.sendMessage(r.tab.id,{action:"translate_api_result",requestId:h,success:!1,error:s.message})})}});
