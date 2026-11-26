import { chromium } from 'playwright';
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const dir='qa/infinite-process/sculpture';
await mkdir(dir,{recursive:true});
const browser=await chromium.launch();
try {
  const page=await browser.newPage({viewport:{width:1897,height:935}});
  await page.goto(process.env.BASE_URL || 'http://127.0.0.1:4173/?nopreload',{waitUntil:'networkidle'});
  const seek = async p => {
    await page.locator('[data-process-track]').evaluate((el,v)=>scrollTo(0,scrollY+el.getBoundingClientRect().top+(el.offsetHeight-innerHeight)*v),p);
    await page.waitForFunction(v=>Math.abs(Number(document.querySelector('[data-process-canvas]')?.dataset.progress)-v)<.002,p);
  };
  await seek(.18);
  await page.screenshot({path:dir+'/discover.png'});
  if(await page.locator('.ip-fallback').isVisible())throw Error('Image covers the mesh');
  const canvas=page.locator('[data-process-canvas]');
  const style=await page.addStyleTag({content:'.ip-stage,.ip-background{background:#050a14!important}.ip-stage>:not(.ip-canvas-mount){visibility:hidden!important}.ip-canvas-mount{mask-image:none!important}'});
  const shot=await canvas.screenshot();
  const {width,height}=await sharp(shot).metadata();
  const w=Math.min(width,Math.round(height*640/291)),h=Math.round(w*291/640);
  const live=await sharp(shot).extract({left:Math.round((width-w)/2),top:Math.round((height-h)/2),width:w,height:h}).resize(640,291).png().toBuffer();
  const ref=await sharp('public/assets/process/ribbon-reference.webp').resize(640,291).png().toBuffer();
  await sharp({create:{width:1280,height:291,channels:3,background:'#050a14'}}).composite([{input:ref,left:0,top:0},{input:live,left:640,top:0}]).png().toFile(dir+'/comparison.png');
  const masks=await Promise.all([ref,live].map(input=>sharp(input).removeAlpha().raw().toBuffer()));
  const overlay=Buffer.alloc(640*291*3);
  for(let i=0;i<overlay.length;i+=3){
    const [a,b]=masks.map(buf=>Math.max(...buf.subarray(i,i+3))>72);
    overlay.set(a&&b?[179,180,186]:a?[255,89,70]:b?[61,210,250]:[5,10,20],i);
  }
  await sharp(overlay,{raw:{width:640,height:291,channels:3}}).png().toFile(dir+'/silhouette.png');
  await style.evaluate(el=>el.remove());
  await seek(.5);await page.screenshot({path:dir+'/angled.png'});
  console.log(await canvas.evaluate(el=>({...el.dataset})));
} finally {await browser.close();}
