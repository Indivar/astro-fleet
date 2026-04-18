const BOOLEAN_FLAGS = new Set(['keep-demos', 'install', 'no-install', 'help', 'version']);

export function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token.startsWith('--')) {
      const key = token.slice(2);
      const isBoolean = BOOLEAN_FLAGS.has(key) || key.startsWith('no-');
      const next = argv[i + 1];
      if (isBoolean || next === undefined || next.startsWith('--')) {
        flags[key] = true;
      } else {
        flags[key] = next;
        i++;
      }
    } else {
      positional.push(token);
    }
  }
  return { positional, flags };
}

const DOMAIN_RE = /^[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?$/;

export function validateDomain(domain) {
  if (!domain) return 'Domain is required.';
  if (!DOMAIN_RE.test(domain) || domain.includes('..')) {
    return 'Use only letters, numbers, hyphens, and dots (e.g. acme.com).';
  }
  return null;
}

const PRESETS = ['corporate', 'saas', 'warm'];

export function validatePreset(preset) {
  if (!PRESETS.includes(preset)) {
    return `Preset must be one of: ${PRESETS.join(', ')}.`;
  }
  return null;
}

export { PRESETS };
