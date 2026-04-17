import * as p from '@clack/prompts';
import pc from 'picocolors';
import { downloadTemplate } from 'giget';
import { resolve, join, basename } from 'node:path';
import { access, rm, readFile, writeFile, readdir } from 'node:fs/promises';
import { parseArgs, validateDomain, validatePreset, PRESETS } from './args.mjs';
import { scaffoldSite } from './scaffold.mjs';

const DEFAULT_TEMPLATE = 'github:indivar/astro-fleet';
const DEMO_SITES = ['flux-analytics.com', 'meridian-advisory.com', 'olive-and-vine.com'];

async function pathExists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function isEmpty(dir) {
  try {
    const entries = await readdir(dir);
    return entries.length === 0;
  } catch {
    return true;
  }
}

export async function init(argv) {
  const { positional, flags } = parseArgs(argv);

  p.intro(pc.bgCyan(pc.black(' create-astro-fleet ')));

  let targetArg = positional[0];
  if (!targetArg) {
    const answer = await p.text({
      message: 'Directory for the new fleet',
      placeholder: './my-astro-fleet',
      defaultValue: './my-astro-fleet',
    });
    if (p.isCancel(answer)) throw new Error('User cancelled.');
    targetArg = answer;
  }
  const targetDir = resolve(process.cwd(), targetArg);

  if (await pathExists(targetDir)) {
    if (!(await isEmpty(targetDir))) {
      const overwrite = await p.confirm({
        message: `${pc.yellow(targetDir)} is not empty. Continue anyway?`,
        initialValue: false,
      });
      if (p.isCancel(overwrite) || !overwrite) throw new Error('User cancelled.');
    }
  }

  let domain = flags.domain;
  if (!domain) {
    const answer = await p.text({
      message: 'Domain for your first site',
      placeholder: 'acme.com',
      validate: (v) => validateDomain(v) ?? undefined,
    });
    if (p.isCancel(answer)) throw new Error('User cancelled.');
    domain = answer;
  } else {
    const err = validateDomain(domain);
    if (err) {
      p.log.error(err);
      process.exit(1);
    }
  }

  let preset = flags.preset || 'corporate';
  if (!flags.preset) {
    const chosen = await p.select({
      message: 'Design preset for the first site',
      options: [
        { value: 'corporate', label: 'corporate', hint: 'navy + gold, consulting' },
        { value: 'saas', label: 'saas', hint: 'dark + neon, developer tools' },
        { value: 'warm', label: 'warm', hint: 'cream + amber, hospitality' },
      ],
      initialValue: 'corporate',
    });
    if (p.isCancel(chosen)) throw new Error('User cancelled.');
    preset = chosen;
  } else {
    const err = validatePreset(preset);
    if (err) {
      p.log.error(err);
      process.exit(1);
    }
  }

  let keepDemos = Boolean(flags['keep-demos']);
  if (flags['keep-demos'] === undefined) {
    const choice = await p.confirm({
      message: 'Keep the three demo sites as reference?',
      initialValue: false,
    });
    if (p.isCancel(choice)) throw new Error('User cancelled.');
    keepDemos = choice;
  }

  const template = flags.template || DEFAULT_TEMPLATE;

  const spin = p.spinner();
  spin.start(`Downloading template from ${template}`);
  try {
    await downloadTemplate(template, {
      dir: targetDir,
      force: true,
      provider: template.startsWith('github:') ? undefined : 'github',
    });
    spin.stop(`Downloaded to ${pc.dim(targetDir)}`);
  } catch (err) {
    spin.stop(pc.red('Download failed'));
    throw err;
  }

  if (!keepDemos) {
    const trimSpin = p.spinner();
    trimSpin.start('Removing demo sites');
    for (const demo of DEMO_SITES) {
      const demoPath = join(targetDir, 'sites', demo);
      if (await pathExists(demoPath)) {
        await rm(demoPath, { recursive: true, force: true });
      }
    }
    trimSpin.stop('Removed demo sites');
  }

  await renameRootPackage(targetDir, basename(targetDir));

  const scaffoldSpin = p.spinner();
  scaffoldSpin.start(`Scaffolding sites/${domain}`);
  try {
    await scaffoldSite({ rootDir: targetDir, domain, preset });
    scaffoldSpin.stop(`Created sites/${domain}`);
  } catch (err) {
    scaffoldSpin.stop(pc.red('Scaffold failed'));
    throw err;
  }

  p.outro(
    `${pc.green('✓')} Fleet ready. Next:\n` +
      `  ${pc.cyan(`cd ${targetArg}`)}\n` +
      `  ${pc.cyan('bun install')}\n` +
      `  ${pc.cyan(`bun run dev --filter=${domain}`)}`
  );
}

async function renameRootPackage(targetDir, newName) {
  const pkgPath = join(targetDir, 'package.json');
  if (!(await pathExists(pkgPath))) return;
  const pkg = JSON.parse(await readFile(pkgPath, 'utf8'));
  pkg.name = sanitizePackageName(newName);
  delete pkg.repository;
  delete pkg.homepage;
  delete pkg.bugs;
  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

function sanitizePackageName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 214) || 'astro-fleet';
}
