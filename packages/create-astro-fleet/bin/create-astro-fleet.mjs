#!/usr/bin/env node
import { init } from '../src/init.mjs';
import { add } from '../src/add.mjs';
import { printHelp } from '../src/help.mjs';

const argv = process.argv.slice(2);
const first = argv[0];

let command = 'init';
let rest = argv;
if (first === 'init' || first === 'add' || first === 'help') {
  command = first;
  rest = argv.slice(1);
} else if (first === '--help' || first === '-h') {
  command = 'help';
  rest = [];
} else if (first === '--version' || first === '-v') {
  command = 'version';
  rest = [];
}

try {
  if (command === 'init') {
    await init(rest);
  } else if (command === 'add') {
    await add(rest);
  } else if (command === 'help') {
    printHelp();
  } else if (command === 'version') {
    const { readFile } = await import('node:fs/promises');
    const { fileURLToPath } = await import('node:url');
    const { dirname, join } = await import('node:path');
    const here = dirname(fileURLToPath(import.meta.url));
    const pkg = JSON.parse(await readFile(join(here, '..', 'package.json'), 'utf8'));
    console.log(pkg.version);
  } else {
    console.error(`Unknown command: ${command}`);
    printHelp();
    process.exit(1);
  }
} catch (err) {
  if (err?.name === 'ExitPromptError' || err?.message === 'User cancelled.') {
    process.exit(0);
  }
  console.error(err?.message || err);
  process.exit(1);
}
