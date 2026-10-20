import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
function boot(initial={}){
 const values=new Map(Object.entries(initial));let fail=false;
 const context=vm.createContext({Date,Object,JSON,Error,Number,Array,localStorage:{getItem:k=>values.get(k)??null,setItem(k,v){if(fail){fail=false;throw Error('quota');}values.set(k,v);},removeItem:k=>values.delete(k)},document:{addEventListener(){}},renderPhoneEntrance:()=>'',renderWorkbench:()=>''});
 vm.runInContext(readFileSync('dist/save-box.js','utf8'),context);
 return {values,run:s=>vm.runInContext(s,context),fail:()=>{fail=true;}};
}
const entry={'olddays-experience-states':JSON.stringify({phone:{phone:{model:'n73',app:'music'},date:'2008-10-19'}}),'olddays-game-library':JSON.stringify({favorites:['ancient-empires-2'],recent:['pocket-saga']}),'olddays-dreamnet-game':JSON.stringify({balance:7700,subscriptions:{'杂志01':{active:false}}}),'olddays-campus-case-02':JSON.stringify({started:true,evidence:['sms'],solved:false}),'olddays-tide-v1':JSON.stringify({active:true,device:'black',seen:['gate'],notebooks:{black:'记得退潮'}})};
test('portable save round trip keeps billing, independent stories, and leaves unrelated storage untouched',()=>{
 const b=boot({...entry,unrelated:'private'});b.run('const exported=saveBoxExport()');
 b.values.set('olddays-dreamnet-game','{}');b.values.set('olddays-discoveries','["support"]');
 b.run('saveBoxRestore(saveBoxValidate(exported))');
 for(const[k,v]of Object.entries(entry))assert.equal(b.values.get(k),v);
 assert.equal(b.values.get('unrelated'),'private');assert.equal(b.values.has('olddays-discoveries'),false);
});
test('invalid files and unsafe or unknown entries are rejected before writing',()=>{
 const b=boot(entry);
 for(const input of ['{','x'.repeat(1000001),JSON.stringify({format:'olddays-save',version:9,entries:entry}),JSON.stringify({format:'olddays-save',version:1,entries:{unrelated:'1'}}),JSON.stringify({format:'olddays-save',version:1,entries:{'olddays-tide-v1':'[]'}}),JSON.stringify({format:'olddays-save',version:1,entries:{'olddays-tide-v1':'{"__proto__":{"active":true}}'}})]){
  assert.throws(()=>b.run(`saveBoxRestore(saveBoxValidate(${JSON.stringify(input)}))`));
  assert.deepEqual(Object.fromEntries(b.values),entry);
 }
});
test('storage failure rolls back existing save without changing unrelated data',()=>{
 const b=boot({...entry,unrelated:'untouched'});b.fail();
 assert.throws(()=>b.run(`saveBoxRestore({format:'olddays-save',version:1,entries:{'olddays-discoveries':'[]'}})`));
 assert.deepEqual(Object.fromEntries(b.values),{...entry,unrelated:'untouched'});
});
test('save dates round trip and reject impossible or future calendar values',()=>{
 const b=boot({'olddays-selected-date':'2010-06-05'});assert.match(b.run('saveBoxSummary(saveBoxValidate(saveBoxExport()))'),/2010-06-05/);
 for(const date of ['2010-02-30','2026-01-01','2010-1-1','<script>'])assert.throws(()=>b.run(`saveBoxValidate(JSON.stringify({format:'olddays-save',version:1,entries:{'olddays-selected-date':${JSON.stringify(date)}}}))`));
 b.run("saveBoxRestore(saveBoxValidate(saveBoxExport()))");assert.equal(b.values.get('olddays-selected-date'),'2010-06-05');
});
