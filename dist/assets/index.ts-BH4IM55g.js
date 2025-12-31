async function m(a,n,d="openai/gpt-3.5-turbo",i){var u;const g=i?`
Context:
- Title: ${i.title||"N/A"}
- Description: ${i.description||"N/A"}`:"";try{const r=await fetch("https://openrouter.ai/api/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${n}`,"Content-Type":"application/json"},body:JSON.stringify({model:d,messages:[{role:"system",content:`You are a professional translator. Translate the following HTML snippets from English to Japanese.
${g}

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
   - Do not add explanations. ONLY return the JSON array.`},{role:"user",content:JSON.stringify(a)}],temperature:.3,response_format:{type:"json_object"}})});if(!r.ok)return{success:!1,error:((u=(await r.json()).error)==null?void 0:u.message)||"API request failed"};let s=(await r.json()).choices[0].message.content,t=[];try{const l=s.indexOf("["),o=s.lastIndexOf("]");if(l!==-1&&o!==-1&&o>l){const e=s.substring(l,o+1);t=JSON.parse(e)}else t=JSON.parse(s);if(!Array.isArray(t)){const e=Object.values(t);if(e.length===1&&Array.isArray(e[0]))t=e[0];else{const f=Object.keys(t);if(f.length>0&&f.every(p=>!isNaN(parseInt(p))))t=Object.entries(t).sort((p,h)=>parseInt(p[0])-parseInt(h[0])).map(p=>p[1]);else if(a.length===1&&typeof t=="string")t=[t];else throw new Error("Response is not an array")}}}catch{if(a.length===1){const o=s.match(/^\s*\[\s*"((?:[^"\\]|\\.)*)"/s);if(o)try{t=JSON.parse(`["${o[1]}"]`),console.warn("JSON parse failed, recovered via Regex extraction.")}catch{}if(!t||t.length===0){let e=s.trim();e=e.replace(/"]\s*"]\s*$/g,'"]'),e=e.replace(/"]\s*"$/g,'"]'),e=e.replace(/\]\s*\]\s*$/g,"]"),e.startsWith("[")&&e.endsWith("]")&&(e=e.substring(1,e.length-1).trim(),(e.startsWith('"')&&e.endsWith('"')||e.startsWith("'")&&e.endsWith("'"))&&(e=e.substring(1,e.length-1),e=e.replace(/\\"/g,'"'))),t=[e],console.warn("JSON parse failed, performing fallback repair on single item.")}}else return console.error("Failed to parse batch translation response",s),{success:!1,error:"Failed to parse translation response"}}return{success:!0,data:t}}catch(r){return{success:!1,error:r.message}}}chrome.runtime.onMessage.addListener((a,n,d)=>{if(a.action==="translate_api"){console.log("Background: Received translate_api request",a.requestId);const{apiKey:i,text:g,model:u,context:r,requestId:c}=a;d({status:"accepted"}),n.tab&&n.tab.id&&m(g,i,u,r).then(s=>{console.log("Background: Translation success",c),chrome.tabs.sendMessage(n.tab.id,{action:"translate_api_result",requestId:c,success:s.success,data:s.data,error:s.error})}).catch(s=>{console.error("Background: Translation error",c,s),chrome.tabs.sendMessage(n.tab.id,{action:"translate_api_result",requestId:c,success:!1,error:s.message})})}});
