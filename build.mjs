import { mkdir, cp, rm, readFile, writeFile } from 'node:fs/promises';
import { marketingDocument } from './src/marketing.js';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { spawnSync } from 'node:child_process';

const GZ_SHA = 'dcc1b642f7d3c0195e5b8f3301a8324ff67cda6fb07e6181b7d70f3c65244bfa';
const PATCH_SHA = 'c77e734dac26cf8131928e3e0940d58c4e04ba55e835a27195dcde4035518790';
const SOURCE_INCLUDES = ['src/app.js', 'src/domain.js', 'src/styles.css', 'tests/domain.test.js'];

function gitApply(patchPath, checkOnly, includes) {
  const args = ['apply'];
  if (checkOnly) args.push('--check');
  for (const include of includes || []) args.push(`--include=${include}`);
  args.push(patchPath);
  return spawnSync('git', args, { encoding: 'utf8' });
}

async function applyOrderPatch() {
  const patchFile = 'fixes/order-sync.gz.b64';
  if (!existsSync(patchFile)) return;
  // The published payload has one transposed pair. Repair it before the checksum.
  let encoded = (await readFile(patchFile, 'utf8')).replace(/\s+/g, '');
  encoded = encoded.replace('0vWQnflF2eXrE', '0vWQpnlF2eXrE');
  const gz = Buffer.from(encoded, 'base64');
  const gzSha = createHash('sha256').update(gz).digest('hex');
  if (gzSha !== GZ_SHA) throw new Error(`order patch gzip checksum mismatch: ${gzSha}`);
  const raw = gunzipSync(gz);
  const patchSha = createHash('sha256').update(raw).digest('hex');
  if (patchSha !== PATCH_SHA) throw new Error(`order patch checksum mismatch: ${patchSha}`);
  const patchPath = '/tmp/ahhua-order-sync.patch';
  await writeFile(patchPath, raw);

  const full = gitApply(patchPath, true);
  if (full.status === 0) {
    const applied = gitApply(patchPath, false);
    if (applied.status !== 0) throw new Error(applied.stderr || applied.stdout || 'git apply failed');
    console.log('Applied order and blank-page patch');
    return;
  }

  const partial = gitApply(patchPath, true, SOURCE_INCLUDES);
  if (partial.status === 0) {
    const applied = gitApply(patchPath, false, SOURCE_INCLUDES);
    if (applied.status !== 0) throw new Error(applied.stderr || applied.stdout || 'git apply failed');
    console.log('Applied order and blank-page patch to source files');
    return;
  }

  const app = await readFile('src/app.js', 'utf8');
  if (app.includes('Added ${d.name} to shared cart.')) {
    throw new Error(partial.stderr || full.stderr || 'Blank-page patch did not apply and src/app.js is still invalid');
  }
  console.log('Order patch already present in the source');
}

await applyOrderPatch();
await rm('dist', { recursive: true, force: true });
await mkdir('dist');
const homepage = marketingDocument();
await writeFile('dist/index.html', homepage);
await writeFile('index.html', homepage);
await cp('demo', 'dist/demo', { recursive: true });
await cp('src', 'dist/src', { recursive: true });
await cp('assets', 'dist/assets', { recursive: true });
console.log('Built TableHua → dist (owner site at /, concept demo at /demo)');
