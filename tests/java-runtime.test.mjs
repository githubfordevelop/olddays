import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
test('imported Java save namespaces follow file contents rather than generic class or filename',()=>{
 const source=readFileSync('dist/javame/wrapper.js','utf8');
 const start=source.indexOf('function jarStorageKey(buffer)');
 const ctx=vm.createContext({Uint8Array,Math});vm.runInContext(source.slice(start),ctx);
 const first=new Uint8Array([1,2,3]).buffer,copy=new Uint8Array([1,2,3]).buffer,other=new Uint8Array([1,2,4]).buffer;
 assert.equal(ctx.jarStorageKey(first),ctx.jarStorageKey(copy));assert.notEqual(ctx.jarStorageKey(first),ctx.jarStorageKey(other));
 assert.match(ctx.jarStorageKey(first),/^jar-[a-f0-9]+-[a-f0-9]+-3$/);
});


test('MeBoy imports rebuild split cartridges without running its unsupported Java UI',()=>{
 const source=readFileSync('dist/javame/wrapper.js','utf8');
 const a=source.indexOf('function extractMeBoyRom('),b=source.indexOf('function restartCurrent',a);
 const ctx=vm.createContext({Uint8Array});vm.runInContext(source.slice(a,b),ctx);
 const parts={CARTBYTE0:new Uint8Array(32768).fill(1),CARTBYTE1:new Uint8Array(32768).fill(2)};
 const zip={directory:parts,read:n=>parts[n]};
 const rom=ctx.extractMeBoyRom(zip,'MeBoy');assert.equal(rom.length,65536);assert.equal(rom[32767],1);assert.equal(rom[32768],2);
 assert.equal(ctx.extractMeBoyRom(zip,'OtherMIDlet'),null);
 assert.equal(ctx.extractMeBoyRom({directory:{},read(){}},'MeBoy'),null);
 assert.throws(()=>ctx.extractMeBoyRom({directory:{XBYTE0:1},read:()=>new Uint8Array(9*1024*1024)},'MeBoy'),/large/);
});

test('historical game assets match the recorded archive checksums',()=>{
 const entries=JSON.parse(readFileSync('dist/javame/classic-games/catalog.json','utf8'));
 for(const item of entries){
  const path='dist/javame/classic-games/'+item.id+(item.format==='GBC'?'.gbc':'.jar');
  assert.equal(createHash('sha256').update(readFileSync(path)).digest('hex'),item.sha256);
 }
});


test('short taps have a minimum hold and repeated taps do not get swallowed',()=>{
 const source=readFileSync('dist/javame/wrapper.js','utf8');
 const a=source.indexOf('function setJavaKey('),b=source.indexOf('function fitEmbeddedScreen',a);
 const events=[],timers=new Map();let timer=0,now=1000;
 const ctx=vm.createContext({heldJavaKeys:new Set(),javaPressTimes:new Map(),javaReleaseTimers:new Map(),Date:{now:()=>now},Math,key:(...v)=>events.push(v),setTimeout:(f,ms)=>{timers.set(++timer,{f,ms});return timer;},clearTimeout:id=>timers.delete(id)});
 vm.runInContext(source.slice(a,b),ctx);
 ctx.setJavaKey(53,true);now+=20;ctx.setJavaKey(53,false);
 assert.equal([...timers.values()][0].ms,100);assert.equal(events.length,1);
 ctx.setJavaKey(53,true);assert.deepEqual(events,[[53,true],[53,false],[53,true]]);
 ctx.releaseJavaKeys();assert.deepEqual(events.at(-1),[53,false]);assert.equal(timers.size,0);
});
