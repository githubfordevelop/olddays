import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const full=readFileSync('dist/experience-zones.js','utf8');
const source=full.slice(full.indexOf('function pocketModelId()'));
function setup(){let removed=0,disposed=0;const shell={remove(){removed++}};const c=vm.createContext({phoneState:{model:'n95'},experienceZone:'phone',deskEntered:true,blenderWorld:{inline:true,device:'n95'},blenderWorldDispose(){disposed++},document:{querySelector(){return shell}}});vm.runInContext(source,c);return {c,shell,counts:()=>[removed,disposed]};}
test('ordinary home redraw retains the live model rather than rebooting it',()=>{const {c,shell,counts}=setup();assert.equal(c.retainPocketModel({type:'home'}),shell);assert.deepEqual(counts(),[1,0]);});
test('changing model or leaving home disposes the former inline renderer',()=>{for(const change of ['model','page','zone']){const {c,counts}=setup();if(change==='model')c.phoneState.model='n73';if(change==='zone')c.experienceZone='story';assert.equal(c.retainPocketModel({type:change==='page'?'news':'home'}),null);assert.deepEqual(counts(),[0,1]);}});
test('modal viewer is not detached by the ordinary home lifecycle',()=>{const {c,counts}=setup();c.blenderWorld.inline=false;assert.equal(c.retainPocketModel({type:'home'}),null);assert.deepEqual(counts(),[0,0]);});
