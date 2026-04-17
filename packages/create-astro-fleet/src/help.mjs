import pc from 'picocolors';

export function printHelp() {
  console.log(`
${pc.bold('create-astro-fleet')} — scaffold an Astro Fleet monorepo or add a site.

${pc.bold('Usage:')}
  ${pc.cyan('npm create astro-fleet')}                         Bootstrap a new fleet (interactive)
  ${pc.cyan('npm create astro-fleet my-fleet')}                Bootstrap into ./my-fleet
  ${pc.cyan('bunx create-astro-fleet add acme.com saas')}      Add a site to the current fleet

${pc.bold('Commands:')}
  init [dir]                Bootstrap a new fleet (default command)
  add  <domain> [preset]    Add a new site to an existing fleet
  help                      Show this help

${pc.bold('Options (init):')}
  --template <source>       giget template source (default: github:indivar/astro-fleet)
  --preset <name>           corporate | saas | warm (skips prompt)
  --domain <name>           first site domain (skips prompt)
  --keep-demos              keep the three demo sites as reference
  --no-install              skip dependency install

${pc.bold('Options (add):')}
  --preset <name>           corporate | saas | warm (default: corporate)

${pc.bold('Presets:')}
  corporate   Navy + gold. Consulting, finance, law.
  saas        Dark + neon. Developer tools, B2B SaaS.
  warm        Cream + amber. Restaurants, wellness, retail.
`);
}
