const fs = require('fs');
const ts = require(process.cwd() + '/node_modules/typescript');
const assert = require('node:assert/strict');
let authenticated = true;
const code = ts.transpileModule(fs.readFileSync('app/api/medications/extract/route.ts','utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const mod = {exports:{}};
new Function('require','exports','module',code)((id)=>id==='next/server'?{NextResponse:{json:(data,init)=>Response.json(data,init)}}:{createClient:()=>({auth:{getUser:async()=>({data:{user:authenticated?{id:'test'}:null},error:null})}})},mod.exports,mod);
const {POST} = mod.exports;
process.env.NEXT_PUBLIC_SUPABASE_URL='https://example.test';process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY='test';process.env.OPENAI_API_KEY='test';
function request(file, auth=true){const form=new FormData();form.append('file',file);return new Request('http://localhost/api/medications/extract',{method:'POST',headers:auth?{authorization:'Bearer test'}:{},body:form});}
const pdf=new File(['%PDF-test'],'rx.pdf',{type:'application/pdf'});
(async()=>{
assert.equal((await POST(request(pdf,false))).status,401);
authenticated=false;assert.equal((await POST(request(pdf))).status,401);authenticated=true;
assert.equal((await POST(request(new File(['bad'],'bad.png',{type:'image/png'})))).status,400);
assert.equal((await POST(request(new File([new Uint8Array(3*1024*1024+1)],'large.pdf',{type:'application/pdf'})))).status,400);
global.fetch=async(_url,options)=>{const body=JSON.parse(options.body);assert.equal(body.store,false);assert.equal(body.input[0].content[1].type,'input_file');return Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify({medications:[{name:'테스트약',ingredient:'',doseAmount:'',doseUnit:'',schedule:'',instructions:''}],warnings:['용량 판독 불가']})}]}]});};
const ok=await POST(request(pdf));assert.equal(ok.status,200);assert.equal((await ok.json()).medications[0].doseAmount,'');
global.fetch=async()=>Response.json({status:'incomplete'});assert.equal((await POST(request(pdf))).status,422);
global.fetch=async()=>Response.json({status:'completed',output:[{content:[{type:'output_text',text:'{"medications":[{}],"warnings":[]}'}]}]});assert.equal((await POST(request(pdf))).status,422);
global.fetch=async()=>new Response('',{status:429});assert.equal((await POST(request(pdf))).status,502);
delete process.env.OPENAI_API_KEY;assert.equal((await POST(request(pdf))).status,503);
console.log('9 OCR route checks passed (mocked auth and provider).');
})().catch(e=>{console.error(e);process.exit(1)});
