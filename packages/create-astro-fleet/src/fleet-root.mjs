import { access, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

async function readJson(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    return null;
  }
}

async function pathExists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

export async function findFleetRoot(startDir = process.cwd()) {
  let current = resolve(startDir);
  while (true) {
    const pkg = await readJson(join(current, 'package.json'));
    const looksLikeFleet =
      pkg?.name === 'astro-fleet' ||
      (pkg?.workspaces && (await pathExists(join(current, 'sites', 'starter'))));
    if (looksLikeFleet) return current;
    const parent = dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}
