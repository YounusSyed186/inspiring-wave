import * as THREE from 'three';
import { createBeltDrive } from './belt-drive';

// Survey of the two cut edges in the approved 640 × 291 composition.
// Z is authored independently so the two passages at the crossing stay apart.
type Station = [number, number, number, number, number, number];
const cut: Station[] = [
  [18,154,-.30, 68,91,-.65], [43,84,.06, 101,72,-.23],
  [103,25,.42, 154,73,.12], [167,10,.72, 216,95,.42],
  [236,27,.92, 276,125,.72], [298,72,1.05, 331,160,.89],
  [361,130,1.1, 282,216,.85], [428,174,.94, 345,249,.52],
  [498,149,.58, 430,277,.26], [562,99,.24, 515,268,-.02],
  [586,55,-.16, 587,224,.12], [574,34,-.44, 623,167,-.06],
  [535,10,-.56, 624,112,-.27], [478,5,-.62, 604,69,-.56],
  [423,16,-.68, 562,69,-.8], [367,44,-.72, 489,62,-.94],
  [305,83,-.76, 414,83,-.90], [251,130,-.7, 352,121,-.84],
  [194,162,-.54, 302,189,-.58], [137,177,-.21, 250,245,-.19],
  [84,189,.12, 181,273,.16], [49,206,.26, 113,273,.36],
  [28,205,.13, 59,249,.24], [16,175,-.09, 39,224,-.17],
];
const world = (x:number,y:number,z:number) => new THREE.Vector3((x-320)/54,(145.5-y)/54,z);
const uv = (p:THREE.Vector3) => [(p.x*54+320)/640, (.5+p.y*54/291)];
const point = new THREE.Vector3();

export function makePrintedSculpture(print:THREE.Texture) {
  const root = new THREE.Group();
  const printed = new THREE.MeshBasicMaterial({map:print,side:THREE.DoubleSide,toneMapped:false});
  const edge = new THREE.MeshStandardMaterial({color:0xb4aa97,roughness:.77,side:THREE.DoubleSide});
  const reverse = new THREE.MeshStandardMaterial({color:0x193b96,roughness:.65,side:THREE.DoubleSide});
  // Thread the right return around its outer bend from Define to Develop.
  // The two transfers meet in elevation but run at separate depths.
  const stations = [...cut.slice(0,6), ...cut.slice(7,17).reverse(), cut[6], ...cut.slice(17)];
  const rails = [0,3].map(i=>new THREE.CatmullRomCurve3(stations.map(s=>world(s[i],s[i+1],s[i+2])),true,'centripetal'));
  const drive=createBeltDrive(rails);
  const length=360, width=12, row=width+1;
  const positions:number[]=[], coords:number[]=[], faces:number[][]=[[],[],[]];
  for(let side=0;side<2;side++) for(let i=0;i<=length;i++){
    const a=rails[0].getPoint(i/length), b=rails[1].getPoint(i/length);
    for(let j=0;j<=width;j++){
      const v=j/width;point.lerpVectors(a,b,v);
      point.z+=.11*Math.sin(Math.PI*v)-side*.045;
      positions.push(...point.toArray());coords.push(...uv(point));
    }
  }
  const layer=(length+1)*row;
  for(let i=0;i<length;i++){
    for(let j=0;j<width;j++){
      const a=i*row+j,b=a+row;
      faces[0].push(a,b,a+1,b,b+1,a+1);
      faces[1].push(a+layer,a+1+layer,b+layer,b+layer,a+1+layer,b+1+layer);
    }
    for(const j of [0,width]){
      const a=i*row+j,b=a+row;faces[2].push(a,a+layer,b,b,a+layer,b+layer);
    }
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(coords,2));
  geo.setIndex(faces.flat()); let start=0;
  faces.forEach((f,i)=>{geo.addGroup(start,f.length,i);start+=f.length;});
  geo.computeVertexNormals();
  const ink=printed.clone(),rim=edge.clone();
  ink.name='continuous-print';
  for(const material of [ink,reverse,rim])drive.bind(geo,material,row);
  root.add(new THREE.Mesh(geo,[ink,reverse,rim]));
  // Two inset laminations share the Develop panel's physical address.
  for(const gap of [.065,.135]){
    const ply=geo.clone();
    ply.clearGroups();
    ply.setIndex(faces[0].slice(13*15*width*6,15*15*width*6));
    const stock=new THREE.MeshStandardMaterial({color:gap>.1?0x283c88:0xc5ccdb,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:1});
    drive.bind(ply,stock,row,gap);
    const layerMesh=new THREE.Mesh(ply,stock);layerMesh.name='develop-ply';root.add(layerMesh);
  }

  // Recessed inner folds: their print is registered in the same front elevation.
  function fold(top:number[][],bottom:number[][],depth:number,range:[number,number]){
    const curves=[top,bottom].map(points=>new THREE.CatmullRomCurve3(points.map(([x,y])=>world(x,y,depth))));
    const g=new THREE.PlaneGeometry(1,1,64,6), pos=g.attributes.position, tex=g.attributes.uv;
    for(let i=0;i<pos.count;i++){
      const u=tex.getX(i), v=tex.getY(i);
      point.lerpVectors(curves[1].getPoint(u),curves[0].getPoint(u),v);
      point.z-=.24*Math.sin(Math.PI*v);
      pos.setXYZ(i,point.x,point.y,point.z);const [x,y]=uv(point);tex.setXY(i,x,y);
    }
    const foldInk=printed.clone();drive.bind(g,foldInk,0,0,range);
    root.add(new THREE.Mesh(g,foldInk));
  }
  fold([[29,132],[74,84],[130,69],[200,81],[265,113]],[[99,152],[119,131],[170,109],[217,105],[265,113]],-.95,[0,4/24]);
  fold([[16,149],[45,108],[71,88]],[[39,223],[78,193],[153,178]],-1.15,[0,2/24]);
  fold([[352,120],[421,80],[505,57],[580,70]],[[352,120],[422,87],[485,91],[539,117]],-1.2,[6/24,10/24]);
  fold([[578,33],[594,46],[607,68]],[[579,75],[604,94],[618,107]],-.92,[10/24,12/24]);
  function sphere(x:number,y:number,r:number,z:number){
    const g=new THREE.SphereGeometry(r/54,48,32),center=world(x,y,z);
    for(let i=0;i<g.attributes.position.count;i++){
      point.fromBufferAttribute(g.attributes.position,i).add(center);
      const [u,v]=uv(point);g.attributes.uv.setXY(i,u,v);
    }
    const mesh=new THREE.Mesh(g,printed);mesh.position.copy(center);root.add(mesh);
  }
  sphere(281,160,32,.36);sphere(319,45,11,-.45);sphere(417,117,9,-.32);
  const bail=new THREE.CatmullRomCurve3([[293,69,-.88],[309,44,-.70],[327,31,-.65],[348,28,-.66],[363,41,-.88]].map(([x,y,z])=>world(x,y,z)));
  root.add(new THREE.Mesh(new THREE.TubeGeometry(bail,40,.018,6,false),edge));
  function orbit(points:number[][],radius:number,color:number){
    const c=new THREE.CatmullRomCurve3(points.map(([x,y,z])=>world(x,y,z)),true);
    const mesh=new THREE.Mesh(new THREE.TubeGeometry(c,150,radius,6,true),new THREE.MeshBasicMaterial({color}));
    root.add(mesh);
  }
  orbit([[212,166,.32],[244,139,.12],[313,109,-.44],[404,103,-.43],[421,113,-.3],[381,146,.16],[295,175,1.05],[234,182,.91]],.018,0xb6c9ea);
  orbit([[244,181,.98],[306,177,1.15],[395,150,1.19],[447,120,.7],[421,117,-.4],[378,128,-.62],[296,155,-.57]],.012,0xd8f43b);
  const home=drive.distanceAt(3/stations.length);
  const stops=[3,8,12,14,20].map(i=>drive.distanceAt(i/stations.length)-home);
  function advance(p:number){
    drive.visual.value=p;
    const times=[0,.33,.5,.67,.86,1], offsets=[...stops,1];
    const i=Math.min(4,times.findIndex((_,j)=>j<5&&p<=times[j+1]));
    const local=(p-times[i])/(times[i+1]-times[i]);
    drive.progress.value=THREE.MathUtils.lerp(offsets[i],offsets[i+1],local);
    root.children.forEach(child=>{if(child.name==='develop-ply')child.visible=p>.59&&p<.76;});
    return drive.progress.value;
  }
  return {root,advance,table:drive.table};
}
