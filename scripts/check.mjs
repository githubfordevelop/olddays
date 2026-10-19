import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';
for (const name of readdirSync('dist').filter(x=>x.endsWith('.js'))) execFileSync(process.execPath,['--check',`dist/${name}`],{stdio:'inherit'});
const html=readFileSync('dist/index.html','utf8');
for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {const file=match[1];if(/^(https?:|data:|archaeo:)/.test(file))continue;if(!existsSync(`dist/${file}`))throw Error(`Missing local asset: ${file}`)}
const context=vm.createContext({document:{addEventListener(){}}});vm.runInContext(readFileSync('dist/annual-news.js','utf8'),context);const data=vm.runInContext('yearEvents',context);
for(let y=1996;y<=2025;y++){if(!data[y]?.length)throw Error(`Missing year: ${y}`);for(const e of data[y]){if(!e[0]||!e[1])throw Error(`Incomplete event: ${y}`);if(e[2]&&!e[2].startsWith('https://'))throw Error('Invalid source URL')}}
const manifest=JSON.parse(readFileSync('dist/manifest.webmanifest','utf8'));if(manifest.display!=='standalone')throw Error('Mobile manifest missing standalone display');
console.log('JavaScript, asset references, mobile manifest, and 1996–2025 year coverage checked.');
