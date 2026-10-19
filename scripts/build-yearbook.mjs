import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const data=JSON.parse(readFileSync('data/yearbook.json','utf8'));
mkdirSync('dist/yearbook',{recursive:true});
for(const [year,rows] of Object.entries(data))writeFileSync(`dist/yearbook/${year}.json`,JSON.stringify(rows)+'\n');
writeFileSync('dist/yearbook.js','/* Wikipedia yearbook excerpts: CC BY-SA 4.0; data loaded only for the requested year. */\nconst yearbook = {};\nconst yearbookCounts = '+JSON.stringify(Object.fromEntries(Object.entries(data).map(([y,r])=>[y,r.length])))+';\n');
