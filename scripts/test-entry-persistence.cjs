const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const code = ts.transpileModule(fs.readFileSync('lib/entry-persistence.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const mod = { exports: {} };
new Function('exports', code)(mod.exports);
const { writeEntry } = mod.exports;
(async () => {
  const payload = { text: 'test', user_id: 'test-user', reminder_sent_at: null };
  let calls = [];
  const result = await writeEntry(payload, async values => {
    calls.push({ ...values });
    return 'reminder_sent_at' in values ? { data: null, error: { code: '42703', message: 'column entries.reminder_sent_at does not exist' } } : { data: { id: 'saved' }, error: null };
  });
  assert.equal(result.data.id, 'saved'); assert.equal(calls.length, 2);
  assert.deepEqual(calls[1], { text: 'test', user_id: 'test-user' }); assert.ok('reminder_sent_at' in payload);
  calls = [];
  await writeEntry(payload, async values => { calls.push({ ...values }); return 'reminder_sent_at' in values ? { data: null, error: { code: 'PGRST204', message: "Could not find the 'reminder_sent_at' column of 'entries' in the schema cache" } } : { data: { id: 'saved' }, error: null }; });
  assert.equal(calls.length, 2);
  for (const error of [{ code: '42501', message: 'permission denied' }, { code: '42703', message: 'column entries.text does not exist' }, { code: '42703', message: 'unknown schema error' }]) {
    let count = 0; const failure = await writeEntry(payload, async () => { count++; return { data: null, error }; }); assert.equal(count, 1); assert.equal(failure.error, error);
  }
  let count = 0;
  await writeEntry({ priority: 'normal', due_date: null, reminder_sent_at: null, text: 'keep' }, async values => {
    count++; const missing = ['priority', 'due_date', 'reminder_sent_at'].find(key => key in values);
    return missing ? { data: null, error: { code: '42703', message: `column entries.${missing} does not exist` } } : { data: { id: 'saved' }, error: null };
  }); assert.equal(count, 4);
  await assert.rejects(() => writeEntry(payload, async () => { throw new Error('offline'); }), /offline/);
  console.log('Entry persistence checks passed: old/current schema, immutable retry, multi-column fallback, auth/network failures.');
})().catch(error => { console.error(error); process.exit(1); });
