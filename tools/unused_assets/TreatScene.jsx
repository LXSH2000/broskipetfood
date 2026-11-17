import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import './scene.css';

const palettes = {
  peanut: ['#b64922', 'NON-VEG'],
  pumpkin: ['#7b8051', 'MIX']
};

function makeLabel(flavor) {
  const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 1024;
  const c = canvas.getContext('2d'); const [color, name] = palettes[flavor] || palettes.peanut;
  c.fillStyle = color; c.fillRect(0, 0, 768, 1024);
  // A subtle printed paper grain, generated locally.
  for (let i = 0; i < 7000; i++) { c.fillStyle = i % 2 ? 'rgba(255,255,255,.025)' : 'rgba(35,20,10,.025)'; c.fillRect((i * 127.7) % 768, (i * 83.3) % 1024, 2, 2); }
  c.fillStyle = '#f8edcf'; c.beginPath(); c.roundRect(44, 151, 680, 710, 14); c.fill();
  c.textAlign = 'center'; c.fillStyle = '#522b1d'; c.font = 'bold 22px Arial'; c.fillText('HEY, GOOD DOG.', 384, 210);
  c.font = '900 135px Georgia'; c.fillText('BROSKI', 384, 373); c.font = 'bold 23px Arial'; c.fillText('TREATS FOR YOUR BEST BRO', 384, 433);
  c.save(); c.translate(384, 548); c.rotate(-.12); c.fillStyle = color;
  c.beginPath(); c.roundRect(-107, -30, 214, 60, 25); c.fill();
  for (const x of [-104, 104]) for (const y of [-26, 26]) { c.beginPath(); c.arc(x, y, 37, 0, Math.PI * 2); c.fill(); } c.restore();
  c.fillStyle = '#522b1d'; c.font = 'bold 31px Arial'; c.fillText(name, 384, 680);
  c.font = '23px Georgia'; c.fillText('For the little moments together.', 384, 731);
  c.font = 'bold 18px Arial'; c.fillText('NET QTY 400 g / NANGLOI', 384, 804);
  c.fillStyle = '#f8edcf'; c.font = '19px Arial'; c.fillText('BEST BROS. BIG LOVE', 384, 924);
  c.font = '16px Arial'; c.fillText('WEST DELHI · 110041', 384, 965);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4; return texture;
}

function boneGeometry() {
  const s = new THREE.Shape(); s.moveTo(-.42, .13);
  s.bezierCurveTo(-.8,.58,-1.04,.02,-.7,-.1); s.bezierCurveTo(-1.04,-.45,-.53,-.65,-.4,-.23);
  s.lineTo(.4,-.23); s.bezierCurveTo(.53,-.65,1.04,-.45,.7,-.1); s.bezierCurveTo(1.04,.02,.8,.58,.42,.13); s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: .16, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: .045, bevelThickness: .035, curveSegments: 12 }); geo.center(); return geo;
}

export default function TreatScene({ flavor = 'peanut', paused = false }) {
  const host = useRef(null), state = useRef(null), pausedRef = useRef(paused); const [failed, setFailed] = useState(false);
  useEffect(() => { pausedRef.current = paused; state.current?.wake?.(); }, [paused]);
  useEffect(() => {
    const el = host.current; let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' }); } catch { setFailed(true); return; }
    const mobile = window.matchMedia('(max-width: 767px), (pointer: coarse)');
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile.matches ? 1.25 : 1.75)); renderer.setClearColor(0x000000, 0); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.35;
    renderer.domElement.setAttribute('aria-hidden', 'true'); el.appendChild(renderer.domElement);
    const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(35, 1, .1, 40); camera.position.set(0, .15, 9.3);
    scene.add(new THREE.HemisphereLight(0xfff6df, 0x98735b, 3));
    const key = new THREE.DirectionalLight(0xfff5dd, 4.2); key.position.set(-4, 6, 7); scene.add(key);
    const rim = new THREE.DirectionalLight(0xffffff, 2); rim.position.set(4, 3, -2); scene.add(rim);
    const product = new THREE.Group(); scene.add(product); product.rotation.set(-.055, -.24, -.115);
    const label = makeLabel(flavor); const paper = new THREE.MeshStandardMaterial({ color: palettes[flavor]?.[0] || palettes.peanut[0], roughness: .9 });
    const bag = new THREE.Mesh(new RoundedBoxGeometry(2.3, 3.25, .65, 5, .16), paper); product.add(bag);
    const frontMaterial = new THREE.MeshStandardMaterial({ map: label, roughness: .95 });
    const front = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 3.12), frontMaterial); front.position.z = .334; product.add(front);
    const seamMaterial = new THREE.MeshStandardMaterial({ color: '#8d361b', roughness: .9 });
    for (const y of [-1.56, 1.58]) { const seam = new THREE.Mesh(new RoundedBoxGeometry(2.26,.11,.67,2,.04), seamMaterial); seam.position.y=y; product.add(seam); }
    for (let i=0;i<3;i++) { const zip = new THREE.Mesh(new THREE.BoxGeometry(2.15,.015,.018), seamMaterial); zip.position.set(0,1.39+i*.04,.341); product.add(zip); }
    const biscuits = []; const boneGeo = boneGeometry(); const biscuitMat = new THREE.MeshStandardMaterial({ color: '#cf8d40', roughness: 1 });
    const seedsGeo = new THREE.SphereGeometry(.016, 4, 3); const seedsMat = new THREE.MeshStandardMaterial({ color: '#885327', roughness: 1 });
    [[-1.82,1.17,.2,.65], [1.75,.62,.5,-.5], [-1.72,-1.1,.6,-.3], [1.44,-1.62,1,.65]].forEach(([x,y,z,r], i) => {
      const g = new THREE.Group(); g.add(new THREE.Mesh(boneGeo,biscuitMat)); g.position.set(x,y,z); g.rotation.set(.3,-.3,r); g.scale.setScalar(i===3?.64:.58); scene.add(g);
      const seeds = new THREE.InstancedMesh(seedsGeo, seedsMat, 22);
      const matrix = new THREE.Matrix4();
      for(let j=0;j<22;j++) { matrix.makeTranslation(((j*37)%100)/100*.95-.475,((j*23)%100)/100*.19-.095,.112); seeds.setMatrixAt(j,matrix); }
      g.add(seeds);
      biscuits.push({g,y,r});
    });

    const moteCount = 60;
    const moteGeo = new THREE.BufferGeometry();
    const motePos = new Float32Array(moteCount * 3);
    const moteSeeds = new Float32Array(moteCount * 3);
    for (let i = 0; i < moteCount; i++) {
      motePos[i * 3] = (Math.random() - 0.5) * 6.5;
      motePos[i * 3 + 1] = (Math.random() - 0.5) * 5.2;
      motePos[i * 3 + 2] = (Math.random() - 0.5) * 3.5;
      moteSeeds[i * 3] = Math.random() * Math.PI * 2;
      moteSeeds[i * 3 + 1] = 0.5 + Math.random() * 0.9;
      moteSeeds[i * 3 + 2] = 0.4 + Math.random() * 0.6;
    }
    moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
    const moteMat = new THREE.PointsMaterial({
      color: 0xf5dfbe,
      size: 0.065,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const motes = new THREE.Points(moteGeo, moteMat);
    scene.add(motes);

    state.current = { frontMaterial, paper, seamMaterial, moteGeo, moteMat };
    let frame=0, t=0, last=0, visible=false, lost=false, drag=false, startX=0, rotation=0, tiltX=0, tiltY=0;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const wake = () => { if (!frame && visible && !document.hidden && !lost) { last=performance.now(); frame=requestAnimationFrame(animate); } };
    state.current.wake = wake;
    const resize = () => { const w=el.clientWidth, h=el.clientHeight; if(!w||!h)return; renderer.setPixelRatio(Math.min(window.devicePixelRatio,mobile.matches?1.25:1.75)); renderer.setSize(w,h); camera.aspect=w/h; camera.position.z=camera.aspect<.95?10.9:9.3; camera.updateProjectionMatrix(); wake(); };
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    if(observer) observer.observe(el); else window.addEventListener('resize',resize,{passive:true});
    resize();
    const suspend = () => { cancelAnimationFrame(frame); frame=0; };
    const intersection = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(([entry]) => {visible=entry.isIntersecting;if(visible)wake();else suspend();}) : null; if(intersection)intersection.observe(el);else{visible=true;wake();}
    const visibility = () => { if(document.hidden)suspend();else wake(); };
    document.addEventListener('visibilitychange',visibility);
    const motionChanged=()=>{tiltX=tiltY=0;wake();};
    motion.addEventListener('change',motionChanged);
    const down=e=>{drag=true;startX=e.clientX;};
    const up=()=>{drag=false;};
    const move=e=>{ const b=el.getBoundingClientRect(); if(drag){rotation+=(e.clientX-startX)*.006;startX=e.clientX;} if(e.pointerType!=='touch'&&!motion.matches){tiltX=(e.clientX-b.left)/b.width-.5;tiltY=(e.clientY-b.top)/b.height-.5;} wake(); };
    const leave=()=>{drag=false;tiltX=tiltY=0;wake();};
    const keydown=e=>{if(!['ArrowLeft','ArrowRight','Home'].includes(e.key))return;e.preventDefault();rotation=e.key==='Home'?0:rotation+(e.key==='ArrowLeft'?-.2:.2);wake();};
    el.addEventListener('keydown',keydown);
    el.addEventListener('pointerdown',down); window.addEventListener('pointerup',up); el.addEventListener('pointermove',move); el.addEventListener('pointerleave',leave); el.addEventListener('pointercancel',up);
    const contextLost=e=>{e.preventDefault();lost=true;suspend();setFailed(true);}; renderer.domElement.addEventListener('webglcontextlost',contextLost);
    function animate(now){frame=0;const dt=Math.min((now-last)/1000,.05);last=now;if(!visible||document.hidden||lost)return;
      if(!pausedRef.current&&!motion.matches)t+=dt;
      const targetY=-.24+rotation+tiltX*.22, targetX=-.055+tiltY*.12;
      const blend=motion.matches?1:1-Math.exp(-8*dt);
      product.position.y=Math.sin(t*1.1)*.065; product.rotation.y+=(targetY-product.rotation.y)*blend; product.rotation.x+=(targetX-product.rotation.x)*blend;
      biscuits.forEach(({g,y,r},i)=>{g.position.y=y+Math.sin(t*1.05+i)*.085;g.rotation.z=r+Math.sin(t*.7+i)*.05;});
      if (moteGeo) {
        const pArr = moteGeo.attributes.position.array;
        for (let i = 0; i < moteCount; i++) {
          const ph = moteSeeds[i * 3], sp = moteSeeds[i * 3 + 1];
          pArr[i * 3 + 1] += Math.sin(t * sp + ph) * 0.003;
          pArr[i * 3] += Math.cos(t * sp * 0.7 + ph) * 0.002;
        }
        moteGeo.attributes.position.needsUpdate = true;
      }
      renderer.render(scene,camera);
      const settling=Math.abs(targetY-product.rotation.y)+Math.abs(targetX-product.rotation.x)>.001;
      if((!pausedRef.current&&!motion.matches)||settling)frame=requestAnimationFrame(animate);
    }
    return()=>{cancelAnimationFrame(frame); observer?.disconnect();window.removeEventListener('resize',resize);intersection?.disconnect();el.removeEventListener('pointerdown',down);window.removeEventListener('pointerup',up);el.removeEventListener('pointermove',move);el.removeEventListener('pointerleave',leave);el.removeEventListener('pointercancel',up);renderer.domElement.removeEventListener('webglcontextlost',contextLost);
      document.removeEventListener('visibilitychange',visibility);motion.removeEventListener('change',motionChanged);el.removeEventListener('keydown',keydown);
      moteGeo.dispose(); moteMat.dispose();
      const geometries=new Set(),materials=new Set(),textures=new Set();scene.traverse(o=>{if(o.isInstancedMesh)o.dispose();if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);}); materials.forEach(m=>{if(m.map)textures.add(m.map);m.dispose();});textures.forEach(x=>x.dispose());geometries.forEach(g=>g.dispose());renderer.dispose();renderer.domElement.remove();state.current=null;};
  }, []);
  useEffect(()=>{if(!state.current)return;const {frontMaterial,paper,seamMaterial}=state.current;frontMaterial.map?.dispose();frontMaterial.map=makeLabel(flavor);frontMaterial.needsUpdate=true;paper.color.set((palettes[flavor]||palettes.peanut)[0]);seamMaterial.color.set((palettes[flavor]||palettes.peanut)[0]).multiplyScalar(.72);state.current.wake?.();},[flavor]);
  return <div className="treat-scene" ref={host} tabIndex={failed ? undefined : 0} role="group" aria-label={`Interactive Broski ${palettes[flavor]?.[1] || 'Non-Veg'} treat pouch. Drag or use left and right arrow keys to rotate. Home resets the view.`}>
    <div className="treat-scene-shadow" />
    {failed && <div className="treat-fallback" style={{background:(palettes[flavor]||palettes.peanut)[0]}}><span>HEY, GOOD DOG.</span><strong>BROSKI</strong><b>🦴</b><span>{(palettes[flavor]||palettes.peanut)[1]}</span><small>TREATS FOR YOUR BEST BRO</small></div>}
  </div>;
}
