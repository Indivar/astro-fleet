import * as p from '@clack/prompts';
import pc from 'picocolors';
import { downloadTemplate } from 'giget';
import { resolve, join, basename } from 'node:path';
import { access, rm, readFile, writeFile, readdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { parseArgs, validateDomain, validatePreset, PRESETS } from './args.mjs';
import { scaffoldSite } from './scaffold.mjs';

// The fleet template release this CLI ships with.
// Bump to match the latest https://github.com/indivar/astro-fleet/releases tag
// when you cut a new template release.
const TEMPLATE_VERSION = 'v2.2.0';
const DEFAULT_TEMPLATE = `github:indivar/astro-fleet#${TEMPLATE_VERSION}`;

const DEMO_SITES = ['flux-analytics.com', 'meridian-advisory.com', 'olive-and-vine.com'];
const SUPPORTED_PMS = ['bun', 'pnpm', 'yarn', 'npm'];

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

function detectPackageManager() {
  const ua = process.env.npm_config_user_agent || '';
  const name = ua.split(' ')[0]?.split('/')[0];
  if (SUPPORTED_PMS.includes(name)) return name;
  return 'bun';
}

function devCommand(pm) {
  return pm === 'npm' ? 'npm run dev' : `${pm} dev`;
}

function runInstall(pm, cwd) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(pm, ['install'], { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('error', rejectPromise);
    child.on('close', (code) => {
      if (code === 0) return resolvePromise();
      const err = new Error(`${pm} install exited with code ${code}`);
      err.stderr = stderr;
      rejectPromise(err);
    });
  });
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

  const pm = detectPackageManager();

  let doInstall;
  if (flags['no-install']) {
    doInstall = false;
  } else if (flags.install) {
    doInstall = true;
  } else {
    const choice = await p.confirm({
      message: `Install dependencies with ${pm} now?`,
      initialValue: true,
    });
    if (p.isCancel(choice)) throw new Error('User cancelled.');
    doInstall = choice;
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

  let installed = false;
  if (doInstall) {
    const installSpin = p.spinner();
    installSpin.start(`Installing dependencies with ${pm}`);
    try {
      await runInstall(pm, targetDir);
      installSpin.stop('Installed dependencies');
      installed = true;
    } catch (err) {
      installSpin.stop(pc.red(`${pm} install failed`));
      if (err.stderr) {
        const tail = err.stderr.trim().split('\n').slice(-10).join('\n');
        p.log.error(tail);
      }
      p.log.warn(`Run \`cd ${targetArg} && ${pm} install\` manually once the error above is resolved.`);
    }
  }

  const nextSteps = [
    `  ${pc.cyan(`cd ${targetArg}`)}`,
    installed ? null : `  ${pc.cyan(`${pm} install`)}`,
    `  ${pc.cyan(`${devCommand(pm)} --filter=${domain}`)}`,
  ]
    .filter(Boolean)
    .join('\n');

  p.outro(`${pc.green('✓')} Fleet ready. Next:\n${nextSteps}`);
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
