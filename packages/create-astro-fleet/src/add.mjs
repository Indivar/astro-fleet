import * as p from '@clack/prompts';
import pc from 'picocolors';
import { parseArgs, validateDomain, validatePreset, PRESETS } from './args.mjs';
import { findFleetRoot } from './fleet-root.mjs';
import { scaffoldSite } from './scaffold.mjs';

export async function add(argv) {
  const { positional, flags } = parseArgs(argv);

  const root = await findFleetRoot();
  if (!root) {
    console.error(pc.red('Error: could not find an Astro Fleet root (looked for package.json with name "astro-fleet").'));
    console.error('Run this command from inside a fleet, or run `create-astro-fleet init` to start a new one.');
    process.exit(1);
  }

  p.intro(pc.bgCyan(pc.black(' add site ')));
  p.log.info(`Fleet: ${pc.dim(root)}`);

  let domain = positional[0] || flags.domain;
  if (!domain) {
    domain = await p.text({
      message: 'Domain for the new site (e.g. acme.com)',
      validate: (v) => validateDomain(v) ?? undefined,
    });
    if (p.isCancel(domain)) throw new Error('User cancelled.');
  } else {
    const err = validateDomain(domain);
    if (err) {
      p.log.error(err);
      process.exit(1);
    }
  }

  let preset = positional[1] || flags.preset || 'corporate';
  if (!flags.preset && !positional[1]) {
    const chosen = await p.select({
      message: 'Design preset',
      options: PRESETS.map((name) => ({ value: name, label: name })),
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

  const spin = p.spinner();
  spin.start(`Scaffolding sites/${domain}`);
  try {
    await scaffoldSite({ rootDir: root, domain, preset });
    spin.stop(`Created sites/${domain}`);
  } catch (err) {
    spin.stop(pc.red('Failed'));
    throw err;
  }

  p.outro(`${pc.green('✓')} Site ready. Next:\n  ${pc.cyan('bun install')}\n  ${pc.cyan(`bun run dev --filter=${domain}`)}`);
}
