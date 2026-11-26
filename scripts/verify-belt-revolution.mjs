import { chromium } from 'playwright';
import sharp from 'sharp';
import { strict as assert } from 'node:assert';
import { mkdir } from 'node:fs/promises';

const out='qa/infinite-process';
await mkdir(out,{recursive:true});
const browser=await chromium.launch();
try {
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text());});
  await page.goto(process.env.BASE_URL||'http://127.0.0.1:4173/?nopreload',{waitUntil:'networkidle'});
  const canvas=page.locator('[data-process-canvas]');
  const images=[];
  // Isolate the WebGL output from the pinned heading, scroll bar and background.
  await page.addStyleTag({content:'.ip-stage>:not(.ip-canvas-mount){visibility:hidden!important}.ip-stage{background:#080b12!important}'});
  for(const p of [0,.33,.5,.67,.86,1,.33]){
    await page.locator('[data-process-track]').evaluate((t,p)=>window.scrollTo(0,scrollY+t.getBoundingClientRect().top+(t.offsetHeight-innerHeight)*p),p);
    await page.waitForFunction(p=>Number(document.querySelector('[data-process-canvas]')?.getAttribute('data-progress'))===p && document.querySelector('[data-process-canvas]')?.dataset.rendering==='true',p);
    if(p===0) await page.locator('.ip-stage.is-canvas-ready').waitFor();
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    const info=await canvas.evaluate(el=>({...el.dataset}));
    assert.equal(info.camera,'0.000,0.000,17.000');
    assert.equal(Number(info.deformation)>0,p===.67);
    if(p===0||p===1)assert.equal(Number(info.beltOffset),p);
    images.push(await sharp(await canvas.screenshot({animations:'disabled'})).resize(480,250,{fit:'contain'}).png().toBuffer());
  }
  // Allow subpixel compositor rounding between scroll positions.
  async function sameFrame(a,b){
    const [first,second]=await Promise.all([a,b].map(image=>sharp(image).raw().toBuffer()));
    let difference=0;
    for(let i=0;i<first.length;i++)difference+=Math.abs(first[i]-second[i]);
    return difference/first.length<.1;
  }
  assert.ok(await sameFrame(images[0],images[5]),'One revolution must close on the opening frame');
  assert.ok(await sameFrame(images[1],images[6]),'Reverse must reconstruct Define');
  assert.equal(images[1].equals(images[2]),false);
  await page.locator('[data-process-track]').evaluate(async track=>{
    const top=scrollY+track.getBoundingClientRect().top;
    for(const fraction of [.9,.15,.8,.33]){
      window.scrollTo({top:top+(track.offsetHeight-innerHeight)*fraction,behavior:'instant'});
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    }
  });
  await page.waitForFunction(()=>document.querySelector('[data-process-canvas]')?.dataset.progress==='0.3300');
  const settled=await sharp(await canvas.screenshot({animations:'disabled'})).resize(480,250,{fit:'contain'}).png().toBuffer();
  assert.ok(await sameFrame(images[1],settled),'Rapid direction changes must settle at Define');
  assert.deepEqual(errors,[]);
  await sharp({create:{width:960,height:750,channels:3,background:'#050910'}}).composite(images.slice(0,6).map((input,i)=>({input,left:i%2*480,top:Math.floor(i/2)*250}))).png().toFile(out+'/belt-revolution.png');
  console.log('Verified full revolution, reverse pose, fixed camera, Develop separation, and GPU rendering.');
}finally{await browser.close();}
