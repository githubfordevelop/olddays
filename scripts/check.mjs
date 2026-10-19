import { readFileSync, existsSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import vm from "node:vm";
for (const name of readdirSync("dist").filter((x) => x.endsWith(".js")))
  execFileSync(process.execPath, ["--check", `dist/${name}`], {
    stdio: "inherit",
  });
const html = readFileSync("dist/index.html", "utf8");
for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  const file = match[1].split("?")[0];
  if (/^(https?:|data:|archaeo:)/.test(file)) continue;
  if (!existsSync(`dist/${file}`)) throw Error(`Missing local asset: ${file}`);
}
const context = vm.createContext({ document: { addEventListener() {} } });
vm.runInContext(readFileSync("dist/annual-news.js", "utf8"), context);
vm.runInContext(readFileSync("dist/annual-news-extra.js", "utf8"), context);
vm.runInContext(readFileSync("dist/news-articles.js", "utf8"), context);
const editorial = JSON.parse(readFileSync("data/news-articles.json", "utf8"));
if (
  JSON.stringify(editorial) !==
  JSON.stringify(vm.runInContext("researchedArticles", context))
)
  throw Error("Reading data changed; run node scripts/build-news.mjs");
const data = vm.runInContext("yearEvents", context);
for (let y = 1996; y <= 2025; y++) {
  if ((data[y]?.length || 0) < 10)
    throw Error(`Year ${y} must have at least 10 news items`);
  if (new Set(data[y].map((x) => x[1])).size !== data[y].length)
    throw Error(`Duplicate news titles: ${y}`);
  for (const e of data[y]) {
    if (!e[0] || !e[1]) throw Error(`Incomplete event: ${y}`);
    if (e[2] && !e[2].startsWith("https://")) throw Error("Invalid source URL");
  }
}
const yearbookContext=vm.createContext({});
vm.runInContext(readFileSync("dist/yearbook.js","utf8"),yearbookContext);
if(JSON.stringify(JSON.parse(readFileSync("data/yearbook.json","utf8")))!==JSON.stringify(Object.fromEntries(Array.from({length:30},(_,i)=>{const y=String(1996+i);return [y,JSON.parse(readFileSync(`dist/yearbook/${y}.json`,"utf8"))]})))) throw Error("Yearbook runtime differs from editorial data");
const manifest = JSON.parse(readFileSync("dist/manifest.webmanifest", "utf8"));
if (manifest.display !== "standalone")
  throw Error("Mobile manifest missing standalone display");
console.log(
  "JavaScript, asset references, mobile manifest, and 1996–2025 year coverage checked.",
);

execFileSync(process.execPath, ["--test", "tests/behavior.test.mjs", "tests/java-runtime.test.mjs", "tests/content-library.test.mjs"], {
  stdio: "inherit",
});

execFileSync(
  "python3",
  ["-m", "unittest", "discover", "-s", "tests", "-p", "test_*.py"],
  { stdio: "inherit" },
);

execFileSync("python3",["scripts/check-pocket-data.py"],{stdio:"inherit"});
for(const name of ["wrapper.js","bld/j2me.js","bld/main-all.js"])execFileSync(process.execPath,["--check",`dist/javame/${name}`],{stdio:"inherit"});
