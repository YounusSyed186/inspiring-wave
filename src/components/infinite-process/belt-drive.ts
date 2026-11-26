import * as THREE from 'three';

// Rest coordinates are assigned once. One periodic distance lookup transports
// the vertices and their local offsets; the printed UV stays on its vertex.
export function createBeltDrive(rails: THREE.CatmullRomCurve3[]) {
  const count = 1024;
  const center = (t: number) => rails[0].getPoint(t).lerp(rails[1].getPoint(t), .5);
  const distances = [0];
  let previous = center(0);
  for (let i = 1; i <= count; i++) {
    const next = center(i/count);
    distances.push(distances[i-1] + previous.distanceTo(next));
    previous = next;
  }
  const circumference = distances[count];
  const data = new Float32Array(count*2*4);
  let index = 0;
  for (let i=0; i<count; i++) {
    const d = circumference*i/count;
    while (index < count-1 && distances[index+1] < d) index++;
    const t = (index+(d-distances[index])/(distances[index+1]-distances[index]))/count;
    rails.forEach((rail,row)=>data.set(rail.getPoint(t).toArray(),(row*count+i)*4));
  }
  const table = new THREE.DataTexture(data,count,2,THREE.RGBAFormat,THREE.FloatType);
  table.needsUpdate = true;
  const progress = {value:0};
  const visual = {value:0};
  const vertex = `
    uniform sampler2D beltRails;
    uniform float beltProgress;
    uniform float visualProgress;
    attribute vec4 beltBind;
    attribute float beltPly;
    varying vec2 vCloth;
    vec3 rail(float s,int row){
      float k=fract(s)*1024.;
      int a=int(floor(k));
      return mix(texelFetch(beltRails,ivec2(a,row),0).xyz,
                 texelFetch(beltRails,ivec2((a+1)%1024,row),0).xyz,fract(k));
    }
    mat3 frameAt(float s){
      vec3 a=rail(s,0), b=rail(s,1);
      vec3 t=normalize(rail(s+.001,0)+rail(s+.001,1)-rail(s-.001,0)-rail(s-.001,1));
      vec3 n=normalize(cross(t,b-a));
      return mat3(t,normalize(cross(n,t)),n);
    }
    vec3 beltPoint(float s,float across){return mix(rail(s,0),rail(s,1),across);}
  `;
  function bind(geometry: THREE.BufferGeometry, material: THREE.MeshBasicMaterial|THREE.MeshStandardMaterial, rowSize=0, ply=0, foldRange:[number,number]=[0,1]) {
    const pos=geometry.attributes.position, attributes=[], plies=[];
    for(let i=0;i<pos.count;i++){
      let station=0, across=0;
      if(rowSize){
        const t=(Math.floor(i/rowSize)%361)/360, k=t*count;
        const j=Math.min(count-1,Math.floor(k));
        station=THREE.MathUtils.lerp(distances[j],distances[j+1],k-j)/circumference;
        across=(i%rowSize)/(rowSize-1);
      }else{
        // Bind whole cross-sections in order, including where both loops overlap.
        const t=THREE.MathUtils.lerp(foldRange[0],foldRange[1],(i%65)/64);
        station=distances[Math.round(t*count)]/circumference;
        across=1;
      }
      attributes.push(station,across,rowSize?0:1,0);plies.push(ply);
    }
    geometry.setAttribute('beltBind',new THREE.Float32BufferAttribute(attributes,4));
    geometry.setAttribute('beltPly',new THREE.Float32BufferAttribute(plies,1));
    material.onBeforeCompile=shader=>{
      shader.uniforms.beltRails={value:table};shader.uniforms.beltProgress=progress;shader.uniforms.visualProgress=visual;
      shader.vertexShader=vertex+shader.vertexShader.replace('#include <begin_vertex>',`
        float origin=beltBind.x;
        vCloth=beltBind.xy;
        float dest=fract(origin-fract(beltProgress));
        mat3 transport=frameAt(dest)*transpose(frameAt(origin));
        float open=smoothstep(.59,.66,visualProgress)*(1.-smoothstep(.69,.76,visualProgress));
        vec3 residual=position-beltPoint(origin,beltBind.y);
        vec3 transformed=beltPoint(dest,beltBind.y)+residual;
        if(beltBind.z>.5){
          float tucked=smoothstep(0.,.14,min(fract(beltProgress),1.-fract(beltProgress)));
          transformed=beltPoint(dest,beltBind.y)+mix(residual,transport*residual*.19,tucked);
          transformed.z-=tucked*.14;
        }
        transformed.y-=beltPly*open;
        transformed.z-=beltPly*open;
      `).replace('#include <beginnormal_vertex>',`
        vec3 objectNormal=frameAt(fract(beltBind.x-fract(beltProgress)))*transpose(frameAt(beltBind.x))*normal;
      `);
      if (material.name==='continuous-print') {
        // The source is a front photograph. Reconstruct the hidden stock under
        // the chrome assembly so its baked reflection cannot ride on the belt.
        shader.fragmentShader='uniform float beltProgress; varying vec2 vCloth;\n'+shader.fragmentShader.replace('#include <map_fragment>',`
          vec2 pixel=vMapUv*vec2(640.,-291.)+vec2(0.,291.);
          vec4 ink=texture2D(map,vMapUv);
          bool leftVoid=length((pixel-vec2(181.,145.))/vec2(80.,34.))<1.;
          bool rightVoid=length((pixel-vec2(436.,125.))/vec2(76.,35.))<1.;
          bool hub=length((pixel-vec2(279.,159.))/vec2(35.,30.))<1.;
          bool darkField=max(max(ink.r,ink.g),ink.b)<.012;
          bool title=(pixel.x>132.&&pixel.x<270.&&pixel.y<68.) ||
                     (pixel.x>121.&&pixel.x<268.&&pixel.y>194.&&pixel.y<236.) ||
                     (pixel.x>525.&&pixel.y>104.&&pixel.y<166.);
          if(hub||leftVoid||rightVoid||(darkField&&!title)){
            bool blue=(vCloth.x>.20&&vCloth.x<.40)||(vCloth.x>.49&&vCloth.x<.68);
            vec2 samplePx=blue ? vec2(452.+vCloth.y*30.,250.+sin(vCloth.x*34.)*6.)
                               : vec2(159.+vCloth.y*47.,238.+sin(vCloth.x*34.)*6.);
            vec4 stock=texture2D(map,vec2(samplePx.x/640.,1.-samplePx.y/291.));
            ink=mix(ink,stock,smoothstep(0.,.07,min(beltProgress,1.-beltProgress)));
          }
          diffuseColor*=ink;
        `);
      }
    };
    material.needsUpdate=true;
    material.customProgramCacheKey=()=>material.name==='continuous-print'?'kinetic-print':'kinetic-stock';
  }
  return {progress,visual,bind,table, distanceAt(t:number){return distances[Math.round(t*count)]/circumference;}};
}
