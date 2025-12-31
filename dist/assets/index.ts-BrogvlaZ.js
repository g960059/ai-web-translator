async function g(s,n,u="openai/gpt-3.5-turbo",i){var p;const d=i?`
Context:
- Title: ${i.title||"N/A"}
- Description: ${i.description||"N/A"}`:"";try{const r=await fetch("https://openrouter.ai/api/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${n}`,"Content-Type":"application/json"},body:JSON.stringify({model:u,messages:[{role:"system",content:`You are a professional translator. Translate the following HTML snippets from English to Japanese.
${d}

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
   - Do not add explanations. ONLY return the JSON array.`},{role:"user",content:JSON.stringify(s)}],temperature:.3,response_format:{type:"json_object"}})});if(!r.ok)return{success:!1,error:((p=(await r.json()).error)==null?void 0:p.message)||"API request failed"};let t=(await r.json()).choices[0].message.content,a=[];try{const l=t.indexOf("["),o=t.lastIndexOf("]");if(l!==-1&&o!==-1&&o>l){const e=t.substring(l,o+1);a=JSON.parse(e)}else a=JSON.parse(t);if(!Array.isArray(a))if(s.length===1&&typeof a=="string")a=[a];else throw new Error("Response is not an array")}catch{if(s.length===1){const o=t.match(/^\s*\[\s*"((?:[^"\\]|\\.)*)"/s);if(o)try{a=JSON.parse(`["${o[1]}"]`),console.warn("JSON parse failed, recovered via Regex extraction.")}catch{}if(!a||a.length===0){let e=t.trim();e=e.replace(/"]\s*"]\s*$/g,'"]'),e=e.replace(/"]\s*"$/g,'"]'),e=e.replace(/\]\s*\]\s*$/g,"]"),e.startsWith("[")&&e.endsWith("]")&&(e=e.substring(1,e.length-1).trim(),(e.startsWith('"')&&e.endsWith('"')||e.startsWith("'")&&e.endsWith("'"))&&(e=e.substring(1,e.length-1),e=e.replace(/\\"/g,'"'))),a=[e],console.warn("JSON parse failed, performing fallback repair on single item.")}}else return console.error("Failed to parse batch translation response",t),{success:!1,error:"Failed to parse translation response"}}return{success:!0,data:a}}catch(r){return{success:!1,error:r.message}}}chrome.runtime.onMessage.addListener((s,n,u)=>{if(s.action==="translate_api"){console.log("Background: Received translate_api request",s.requestId);const{apiKey:i,text:d,model:p,context:r,requestId:c}=s;u({status:"accepted"}),n.tab&&n.tab.id&&g(d,i,p,r).then(t=>{console.log("Background: Translation success",c),chrome.tabs.sendMessage(n.tab.id,{action:"translate_api_result",requestId:c,success:t.success,data:t.data,error:t.error})}).catch(t=>{console.error("Background: Translation error",c,t),chrome.tabs.sendMessage(n.tab.id,{action:"translate_api_result",requestId:c,success:!1,error:t.message})})}});
