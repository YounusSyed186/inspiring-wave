import { MutableRefObject, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { makePrintedSculpture } from './printed-sculpture';

export interface ProcessSceneMetrics {
  rendering: boolean;
  camera: string;
  target: string;
  rotation: string;
  deformation: number;
  signal: number;
  drawCalls: number;
  triangles: number;
  quality: string;
  assetStatus: string;
  error: string;
}

export interface ProcessSceneRuntime {
  applyProgress: (progress: number) => void;
  applyPointer: (x: number, y: number) => void;
}

interface Props {
  runtimeRef: MutableRefObject<ProcessSceneRuntime | null>;
  onReady: () => void;
  onVisualProgress: (progress:number)=>void;
  onFailure: (message: string) => void;
  onMetrics?: (metrics: ProcessSceneMetrics) => void;
}

export function ProcessThreeScene({runtimeRef,onReady,onFailure,onMetrics,onVisualProgress}:Props) {
  const mountRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const mount=mountRef.current;
    if(!mount) return;
    let renderer:THREE.WebGLRenderer;
    try {renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});}
    catch {onFailure('WebGL unavailable');return;}
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
    const canvas=renderer.domElement;
    canvas.dataset.processCanvas='';
    canvas.className='ip-three-canvas';
    canvas.setAttribute('aria-hidden','true');
    mount.appendChild(canvas);
    const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera();
    scene.add(new THREE.HemisphereLight(0xfff3dc,0x203355,2));
    const light=new THREE.DirectionalLight(0xffffff,2);
    light.position.set(-3,5,8);scene.add(light);
    let sculpture:ReturnType<typeof makePrintedSculpture>|undefined,disposed=false,frame=0,progress=0,goal=0,x=0,y=0;
    let last=0, px=0, py=0;
    const target=new THREE.Vector3();
    function render(now:number){
      frame=0;
      if(!sculpture||disposed)return;
      const dt=Math.min(.05,Math.max(.001,(now-last)/1000));last=now;
      const blend=1-Math.exp(-dt*13);
      progress+=(goal-progress)*blend;
      if(Math.abs(goal-progress)<.00012)progress=goal;
      px+=(x-px)*blend;py+=(y-py)*blend;
      const p=progress, offset=sculpture.advance(p);
      camera.position.set(px*.065,py*.035,17);
      target.set(0,0,0);
      camera.lookAt(target);
      renderer.render(scene,camera);
      onVisualProgress(p);
      const info=renderer.info.render;
      const vector=(v:{x:number;y:number;z:number})=>[v.x,v.y,v.z].map(n=>n.toFixed(3)).join(',');
      const metrics={rendering:true,camera:vector(camera.position),target:vector(target),rotation:vector(sculpture.root.rotation),
        deformation:THREE.MathUtils.smoothstep(p,.59,.66)*(1-THREE.MathUtils.smoothstep(p,.69,.76)),signal:offset,drawCalls:info.calls,triangles:info.triangles,quality:'printed-mesh',assetStatus:'ready',error:''};
      Object.assign(canvas.dataset,{rendering:'true',progress:p.toFixed(4),camera:metrics.camera,cameraTarget:metrics.target,ribbonRotation:metrics.rotation,signal:p,deformation:0,drawCalls:info.calls,triangles:info.triangles,quality:metrics.quality,assetStatus:'ready'});
      onMetrics?.(metrics);
      canvas.dataset.beltOffset=offset.toFixed(5);
      canvas.dataset.deformation=String(metrics.deformation);
      if(progress!==goal||Math.abs(px-x)+Math.abs(py-y)>.001)invalidate();
    }
    const invalidate=()=>{if(!disposed&&!frame)frame=requestAnimationFrame(render);};
    function resize(){
      const w=mount!.clientWidth,h=mount!.clientHeight;
      if(!w||!h)return;
      const half=Math.max(291/108,640/108*h/w);
      camera.left=-half*w/h;camera.right=-camera.left;camera.top=half;camera.bottom=-half;
      camera.near=.1;camera.far=60;camera.updateProjectionMatrix();
      renderer.setSize(w,h,false);invalidate();
    }
    const observer=new ResizeObserver(resize);observer.observe(mount);resize();
    const lost=(e:Event)=>{e.preventDefault();onFailure('WebGL context lost');};
    canvas.addEventListener('webglcontextlost',lost);
    const texture=new THREE.TextureLoader().load('/assets/process/ribbon-reference.webp',map=>{
      if(disposed)return;
      map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
      sculpture=makePrintedSculpture(map);scene.add(sculpture.root);
      runtimeRef.current={applyProgress(v){goal=THREE.MathUtils.clamp(v,0,1);invalidate();},applyPointer(a,b){x=a;y=b;invalidate();}};
      onReady();progress=goal;invalidate();
    },undefined,()=>{if(!disposed)onFailure('Ribbon artwork unavailable');});
    return ()=>{
      disposed=true;cancelAnimationFrame(frame);observer.disconnect();runtimeRef.current=null;
      canvas.removeEventListener('webglcontextlost',lost);
      const materials=new Set<THREE.Material>();
      sculpture?.root.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();for(const m of [o.material].flat())materials.add(m);}});
      sculpture?.table.dispose();
      materials.forEach(m=>m.dispose());texture.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();
    };
  },[runtimeRef,onReady,onFailure,onMetrics,onVisualProgress]);
  return <div ref={mountRef} className="ip-canvas-mount" aria-hidden="true"/>;
}
