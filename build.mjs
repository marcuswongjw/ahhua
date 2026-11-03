import { mkdir, copyFile, cp, rm, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { spawnSync } from 'node:child_process';

const GZ_SHA = '71dd2da308ac19d632312c436288f57bfa711cf2e2a60d9ff43093e63440c952';
const PATCH_SHA = 'b37a0c2a72679b285aa4be3874a9c1f8c3afb30a9f6f7ee6ef393f2b8ef7171f';
const SOURCE_INCLUDES = ['src/app.js', 'src/domain.js', 'tests/domain.test.js'];

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
  const gz = Buffer.from((await readFile(patchFile, 'utf8')).replace(/\s+/g, ''), 'base64');
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
await copyFile('index.html', 'dist/index.html');
await cp('src', 'dist/src', { recursive: true });
console.log('Built Ah Hua demo → dist (no runtime dependencies)');
