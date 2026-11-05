import React, {useState,useEffect,useRef} from 'react';
import {createRoot} from 'react-dom/client';
import './styles.css';
import './redesign.css';
import './broski.css';
import useStoreMotion from './motion.js';
import './launch.css';
import Modal from './Modal.jsx';
import './motion-ui.css';
import LiquidButton from './LiquidButton.jsx';
import BroskiDock from './BroskiDock.jsx';
import Intro from './Intro.jsx';
import './liquid-dock.css';
import { CONFIG, getWhatsAppOrderLink } from './config.js';
const money=n=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n/100);
const looks={
  peanut:{
    color:'#b95631',
    bg:'#efe0cc',
    label:'NON-VEG\nDOG BISCUITS',
    note:'Real crunchy bone biscuits in our yellow zip pouch. Sealed for your best bro.',
    ingredients:'Whole wheat flour, real poultry & bone meal, wholesome cereals, poultry fat, essential vitamins and minerals. Stamped and sealed by hand in Nangloi.',
    tag:'400g Pouch · ₹149',
    analysis: { protein: '≥ 20%', fat: '≥ 8%', fibre: '≤ 4%', moisture: '≤ 10%' },
    feedingGuide: 'Small (<10kg): 2–4/day · Medium (10–25kg): 4–8/day · Large (25kg+): 8–12/day'
  },
  pumpkin:{
    color:'#7b8051',
    bg:'#e7e8d6',
    label:'MIX DOG\nBISCUITS',
    note:'A flavourful crunch mix in our white zip pouch. Real bone biscuits visible right in the window.',
    ingredients:'Whole wheat flour, blend of chicken meal & vegetal extracts, poultry fat, natural minerals and vitamins. 100% crunchy baked texture.',
    tag:'400g Pouch · ₹149',
    analysis: { protein: '≥ 18%', fat: '≥ 7%', fibre: '≤ 4%', moisture: '≤ 10%' },
    feedingGuide: 'Small (<10kg): 2–4/day · Medium (10–25kg): 4–8/day · Large (25kg+): 8–12/day'
  }
};
function Icon({type,...props}){return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{type==='bag'?<><path d="M5 7h14l1 14H4L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/></>:type==='arrow'?<><path d="M4 12h16M14 6l6 6-6 6"/></>:type==='close'?<path d="m6 6 12 12M6 18 18 6"/>:type==='search'?<><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/></>:type==='paw'?<><ellipse cx="12" cy="16" rx="5" ry="4"/><ellipse cx="5" cy="10" rx="2" ry="3" transform="rotate(-25 5 10)"/><ellipse cx="10" cy="6" rx="2" ry="3"/><ellipse cx="16" cy="6" rx="2" ry="3"/><ellipse cx="20" cy="11" rx="2" ry="3" transform="rotate(25 20 11)"/></>:<><path d="M4 7h16M4 12h16M4 17h16"/></>}</svg>}
function Bone({className=''}){return <svg className={className} viewBox="0 0 100 48" fill="currentColor" aria-hidden="true"><path d="M27 10C15-9-7 9 7 23-7 40 17 57 28 37h43c12 20 35 2 22-14C108 8 84-9 73 10Z"/></svg>}
function Pack({id='peanut',small=false,className=''}){
  const isNonVeg = id === 'peanut';
  const src = isNonVeg ? '/broski-pouch-nonveg.jpg' : '/broski-pouch-mix.jpg';
  const alt = isNonVeg
    ? 'Broski Non-Veg 400g stand-up pouch with transparent window showing bone biscuits'
    : 'Broski Mix 400g stand-up pouch with transparent window showing bone biscuits';
  return (
    <div className={`broski-pouch-box ${small?'small':''} ${className}`}>
      <img src={src} alt={alt} className="broski-pouch-img" loading="lazy" decoding="async"/>
    </div>
  );
}
function shopScroll(){document.querySelector('#shop')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}

const LAUNCH_PRODUCTS = [
  { id: 'peanut', name: 'Non-Veg Dog Biscuits', price: 14900, weight: '400g', category: 'biscuits' },
  { id: 'pumpkin', name: 'Mix Dog Biscuits', price: 14900, weight: '400g', category: 'training' }
];

function App(){
  useStoreMotion();
  const [products,setProducts]=useState(LAUNCH_PRODUCTS);
  const [loading,setLoading]=useState(false);
  const [loadError,setLoadError]=useState('');
  const [category,setCategory]=useState('all');
  const [menu,setMenu]=useState(false);
  const [dialog,setDialog]=useState(null);
  const [detail,setDetail]=useState(null);
  const [toast,setToast]=useState('');
  const [order,setOrder]=useState(null);
  const [email,setEmail]=useState('');
  const [newsletterMsg,setNewsletterMsg]=useState('');
  const [cart,setCart]=useState(()=>{
    try{
      const stored=JSON.parse(localStorage.getItem('broski-cart')||'[]');
      return Array.isArray(stored)?stored.filter(i=>i&&typeof i.id==='string'&&Number.isInteger(i.quantity)&&i.quantity>0&&i.quantity<=20):[];
    }catch{return [];}
  });

  const load=()=>{
    fetch('/api/products')
      .then(r=>{if(!r.ok)throw Error();return r.json();})
      .then(d=>{
        if(d?.products?.length){
          setProducts(d.products);
          setCart(c=>c.filter(i=>d.products.some(p=>p.id===i.id)));
        }
      })
      .catch(()=>{/* fallback to default launch products */});
  };

  useEffect(load,[]);

  useEffect(()=>{
    const playMedia=()=>{
      document.querySelectorAll('video').forEach(v=>{
        v.muted=true;
        v.defaultMuted=true;
        v.playsInline=true;
        v.setAttribute('playsinline','');
        v.setAttribute('muted','');
        v.play().catch(()=>{});
      });
    };
    playMedia();
    window.addEventListener('touchstart',playMedia,{once:true,passive:true});
    window.addEventListener('click',playMedia,{once:true,passive:true});
    return()=>{
      window.removeEventListener('touchstart',playMedia);
      window.removeEventListener('click',playMedia);
    };
  },[]);
  useEffect(()=>{try{localStorage.setItem('broski-cart',JSON.stringify(cart));}catch{}},[cart]);
  useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(''),3500);return()=>clearTimeout(t);},[toast]);

  const rows=cart.map(i=>({...i,product:products.find(p=>p.id===i.id)})).filter(i=>i.product);
  const count=rows.reduce((s,i)=>s+i.quantity,0);
  const subtotal=rows.reduce((s,i)=>s+i.quantity*i.product.price,0);

  function add(id){
    if(count>=100){setToast("Your bag holds up to 100 packs.");return;}
    const existing=cart.find(i=>i.id===id);
    if((existing?.quantity||0)>=20){setToast('Maximum 20 packs per recipe.');return;}
    const prod=products.find(p=>p.id===id);
    setCart(c=>existing?c.map(i=>i.id===id?{...i,quantity:i.quantity+1}:i):[...c,{id,quantity:1}]);
    setToast(`Added ${prod?.name||'treat'} to your bag.`);
  }

  function change(id,delta){
    if(delta>0&&count>=100){setToast("Your bag holds up to 100 packs.");return;}
    setCart(c=>c.map(i=>i.id===id?{...i,quantity:Math.min(20,i.quantity+delta)}:i).filter(i=>i.quantity>0));
  }

  function open(type){setDialog(type);setMenu(false);}

  useEffect(()=>{
    if(!menu)return;
    const close=e=>{if(e.key==='Escape'){setMenu(false);document.querySelector('.mobile-menu')?.focus();}};
    document.addEventListener('keydown',close);
    return()=>document.removeEventListener('keydown',close);
  },[menu]);

  const shown=products.filter(p=>category==='all'||p.category===category);

  function submitOrderRequest(e){
    e.preventDefault();
    const formData=new FormData(e.currentTarget);
    const data=Object.fromEntries(formData);
    const now=new Date();
    const dateStr=now.toISOString().slice(0,10).replace(/-/g,'');
    const code=Math.random().toString(36).substring(2,6).toUpperCase();
    const orderRef=`BR-${dateStr}-${code}`;
    const itemsList=rows.map(r=>`- ${r.product.name} (400g) x ${r.quantity} = ${money(r.product.price*r.quantity)}`).join('\n');
    const bodyText=`Order request: ${orderRef}\n\nItems:\n${itemsList}\n\nEstimated Total: ${money(subtotal)}\nDelivery: Confirmed by email\n\nCustomer Details:\nName: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\nPincode: ${data.pincode}\nAddress: ${data.address}\nCity: ${data.city}`;
    const subject=encodeURIComponent(`Order request ${orderRef}`);
    const body=encodeURIComponent(bodyText);
    window.location.href=`mailto:support@broskipetfood.com?subject=${subject}&body=${body}`;
    setOrder({id:orderRef,total:subtotal,items:rows,customer:data});
    setCart([]);
    setDialog('success');
  }

  function newsletter(e){
    e.preventDefault();
    if(!email||!email.includes('@')){
      setNewsletterMsg('Please enter a valid email address.');
      return;
    }
    const subject=encodeURIComponent('Notify me when Broski launches');
    const body=encodeURIComponent(`Please notify me when Broski launches in West Delhi.\n\nEmail: ${email.trim()}`);
    window.location.href=`mailto:support@broskipetfood.com?subject=${subject}&body=${body}`;
    setNewsletterMsg('Your email app opened. Press send to join our launch list.');
    setEmail('');
  }

  return (
    <>
      <Intro/>
      <a href="#main" className="skip">Skip to content</a>
      <div className="announcement">
        <span className="concept-badge">LAUNCHING IN WEST DELHI · NOV 2026</span>
        <span>Packed by hand in Nangloi, West Delhi <Icon type="paw"/></span>
        <button onClick={()=>open('preview')}>Launch info ↗</button>
      </div>
      <header>
        <a href="#" className="logo" aria-label="Broski home"><Icon type="paw"/><span>Broski<span className="registered"></span></span></a>
        <span className="concept-watermark">Est. 2026 · West Delhi</span>
        <nav className={menu?'open':''} id="main-navigation" aria-label="Main navigation">
          <a href="#shop" onClick={()=>setMenu(false)}>The treat shop</a>
          <a href="#story" onClick={()=>setMenu(false)}>Our story</a>
          <a href="#faq" onClick={()=>setMenu(false)}>Good to know</a>
          <a href="/?intro=1" onClick={()=>{try{sessionStorage.removeItem('broski-intro-seen');}catch{}}}>Watch intro ↺</a>
        </nav>
        <div className="nav-actions">
          <button className="bag-button" onClick={()=>open('cart')} aria-label={`Open treat bag, ${count} items`}>
            <span>Your bag</span><Icon type="bag"/><b>{count}</b>
          </button>
          <button className="mobile-menu icon-btn" aria-label={menu?"Close navigation":"Open navigation"} aria-controls="main-navigation" aria-expanded={menu} onClick={()=>setMenu(!menu)}>
            <Icon type={menu?'close':'menu'}/>
          </button>
        </div>
      </header>

      <main id="main">
        <section className="hero hero-v2">
          <div className="hero-copy" style={{textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center'}}>
            <div className="eyebrow" style={{justifyContent:'center',textAlign:'center',marginInline:'auto'}}>FOR YOUR FAVOURITE KIND OF COMPANY</div>
            <h1 className="hero-title" aria-label="Broski — Crunchy dog biscuits packed in West Delhi" style={{textAlign:'center',marginInline:'auto'}}>
              {Array.from('Broski').map((c,i)=><span aria-hidden="true" key={i} style={{'--letter':i}}>{c===' '?' ':c}</span>)}
            </h1>
            <div className="hero-intro" style={{textAlign:'center',marginInline:'auto',maxWidth:'440px',display:'flex',flexDirection:'column',alignItems:'center'}}>
              <p className="hero-manifesto" style={{textAlign:'center',marginInline:'auto'}}>Treats for your<br/><em>best bro.</em></p>
              <div className="hero-price-chip" style={{display:'inline-flex',alignItems:'center',justifyContent:'center',gap:'8px',background:'#352016',color:'#fff8ed',padding:'5px 13px',borderRadius:'20px',fontSize:'11.5px',fontWeight:'600',margin:'0 auto 14px auto',letterSpacing:'.3px'}}>
                <span>400 g Pouch</span><span>·</span><span>MRP ₹149 incl. all taxes</span>
              </div>
              <p className="hero-description" style={{textAlign:'center',marginInline:'auto'}}>For the muddy paws. The happy hellos.<br/>And the friend who makes every day better.</p>
              <div className="hero-cta" style={{display:'flex',justifyContent:'center',alignItems:'center',gap:'12px',width:'100%',marginInline:'auto'}}>
                <LiquidButton href="#shop" icon={<Icon type="arrow"/>}>Shop the treats</LiquidButton>
                {CONFIG.WHATSAPP_NUMBER ? (
                  <a className="button light" href={getWhatsAppOrderLink([])} target="_blank" rel="noopener noreferrer" style={{display:'inline-flex',alignItems:'center',gap:'8px'}} aria-label="Order on WhatsApp">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#25d366" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.886 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    <span>Order on WhatsApp</span>
                  </a>
                ) : (
                  <a className="button light" href="#story">Meet Broski</a>
                )}
              </div>
            </div>
          </div>
          <div className="cinema-frame">
            <div className="cinema-window">
              <video className="cinema-image cinema-video" src="/broski-hero-desktop-720.mp4" poster="/broski-hero-desktop-poster.jpg" autoPlay loop muted playsInline preload="metadata" aria-label="A golden retriever enjoying crunchy Broski treats alongside the authentic 400g trial pouches">
                <source src="/broski-hero-desktop-720.mp4" type="video/mp4"/>
                <source src="/broski-hero-desktop.mp4" type="video/mp4"/>
              </video>
              <div className="video-live-pill" aria-label="Moments in motion"><span className="live-dot"/><span>Moments in Motion</span></div>
              <div className="cinema-caption"><span>AUTHENTIC TRIAL PACKS</span><p>Sealed for your<br/><em>best bro.</em></p></div>
            </div>
          </div>
          <div className="hero-end">
            <span>TREATS FOR YOUR BEST BRO</span>
            <a href="#shop">Explore our launch treats ↓</a>
            <span>SCROLL TO EXPLORE</span>
          </div>
        </section>

        <div className="ticker" aria-label="For happy dogs and everyday adventures">
          <span>SMALL BITES</span><Bone/><span>BIG FEELINGS</span><Bone/><span>HAPPY TAILS</span><Bone/><span>EVERYDAY ADVENTURES</span><Bone/><span>SMALL BITES</span>
        </div>

        <section id="shop" className="shop section">
          <div className="section-heading">
            <div>
              <div className="eyebrow">THE TREAT CUPBOARD</div>
              <h2>A cupboard full<br/><span className="serif">of good things.</span></h2>
            </div>
            <p>Crunchy dog biscuits packed by hand in Nangloi, West Delhi.<br/>400 g zip pouches made for daily adventures.</p>
          </div>
          <div className="shop-tools" style={{justifyContent:'center'}}>
            <div className="filters" aria-label="Filter treats">
              {[['all','All treats'],['biscuits','Non-Veg'],['training','Mix']].map(([id,label])=>(
                <button key={id} aria-pressed={category===id} className={category===id?'active':''} onClick={()=>setCategory(id)}>{label}</button>
              ))}
            </div>
          </div>

          {loading ? (
            <div role="status" aria-label="Loading the treat collection">
              <span className="sr-only">Opening the treat cupboard…</span>
              <div className="product-grid product-skeletons" aria-hidden="true">
                {Array.from({length:2},(_,i)=><div className="product-skeleton" key={i}><div/><span/><span/></div>)}
              </div>
            </div>
          ) : loadError ? (
            <div className="empty">{loadError}<button className="button" onClick={load}>Try again</button></div>
          ) : (
            <>
              <div className="shop-results">
                <span role="status">{shown.length} {shown.length===1?'treat':'treats'} to discover</span>
                <span>MRP incl. of all taxes · Prices in INR</span>
              </div>
              <div className="product-grid">
                {shown.map(p=>(
                  <article key={p.id} className="product-card">
                    <button className="product-visual" style={{background:looks[p.id]?.bg}} onClick={()=>{setDetail(p);open('product');}} aria-label={`View ${p.name}`}>
                      <span className="product-tag">{looks[p.id]?.tag}</span>
                      <Pack id={p.id}/>
                      <Bone className="loose-bone"/>
                      <span className="view-product">Take a closer look ↗</span>
                    </button>
                    <div className="product-meta">
                      <span>400g · Crunchy biscuits</span>
                      <span>{money(p.price)}</span>
                    </div>
                    <h3><button onClick={()=>{setDetail(p);open('product');}}>{p.name}</button></h3>
                    <div className="product-bottom">
                      <p>{looks[p.id]?.note}</p>
                      <button className="add-button" onClick={()=>add(p.id)} aria-label={`Add ${p.name} to bag`}>Add to bag <span>+</span></button>
                    </div>
                  </article>
                ))}
              </div>
              {shown.length===0&&<div className="empty">No treats found. <button className="text-link" onClick={()=>{setSearch('');setCategory('all');}}>Show all treats</button></div>}
            </>
          )}
        </section>

        <section id="story" className="story section">
          <div className="story-photo">
            <img src="/broski-hero-duo-studio.jpg" alt="Broski dog biscuits authentic trial packaging studio duo" loading="lazy" onError={e=>{e.currentTarget.src='/broski-hero-desktop-poster.jpg';}}/>
            <div className="photo-note">the best part of<br/><em>every day.</em><Icon type="paw"/></div>
          </div>
          <div className="story-copy">
            <div className="eyebrow">BEST FRIENDS. BETTER RITUALS.</div>
            <h2>They make life<br/>better. Let’s return<br/><span className="serif">the favour.</span></h2>
            <p>The morning walk. The welcome-home dance. That hopeful look when a cupboard opens. We’re here for the little rituals that make a life with dogs so good.</p>
            <p>Broski is for the friend who is always up for a walk, always happy to see you, and always convinced the next biscuit is theirs. Treats for your best bro. It’s that simple.</p>
            <a className="button light" href="#shop">A treat for your best friend <Icon type="arrow"/></a>
          </div>
        </section>

        <section className="ritual section">
          <div className="eyebrow">THERE’S ALWAYS A REASON</div>
          <h2>Good moments.<br/><span className="serif">Great company.</span></h2>
          <div className="ritual-grid">
            <article>
              <span className="ritual-icon">01 <Bone/></span>
              <h3>The little victories</h3>
              <p>For learning a new trick, taking a brave step, or finally getting that “stay”.</p>
              <button className="text-link" onClick={()=>{setCategory('training');shopScroll();}}>Explore Mix biscuits ↗</button>
            </article>
            <article>
              <span className="ritual-icon">02 <Icon type="paw"/></span>
              <h3>The everyday adventures</h3>
              <p>A pocket-sized companion for familiar paths and brand-new sniffing spots.</p>
              <a className="text-link" href="#shop">Pack a little happy ↗</a>
            </article>
            <article>
              <span className="ritual-icon">03 <span>♡</span></span>
              <h3>The just-because days</h3>
              <p>No tricks required. Sometimes being your favourite dog is more than enough.</p>
              <button className="text-link" onClick={()=>{setCategory('biscuits');shopScroll();}}>Explore Non-Veg biscuits ↗</button>
            </article>
          </div>
        </section>

        <section className="everyday-editorial">
          <video className="everyday-video" src="/broski-commercial-ad-720.mp4" poster="/broski-hero-desktop-poster.jpg" autoPlay loop muted playsInline preload="metadata" aria-label="Official Broski commercial ad featuring authentic 400g Yellow Non-Veg and White Mix pouches">
            <source src="/broski-commercial-ad-720.mp4" type="video/mp4"/>
            <source src="/Broski_Hero_Ad_16x9_1080p.mp4" type="video/mp4"/>
          </video>
          <div>
            <span className="video-pill-badge"><Icon type="paw"/> Official Commercial</span>
            <span className="eyebrow">SEALED FOR MY BRO</span>
            <h2>Life tastes<br/><em>better together.</em></h2>
            <p>Real crunchy bone biscuits.<br/>Packed by hand in Nangloi, West Delhi.</p>
            <div className="video-story-actions">
              <a className="button light" href="#shop">Explore our treats <Icon type="arrow"/></a>
              <button type="button" className="video-toggle-btn" onClick={()=>{const v=document.querySelector('.everyday-video');if(v){v.paused?v.play():v.pause();}}}>Pause / Play Ⅱ</button>
              <button type="button" className="video-toggle-btn" onClick={(e)=>{const v=document.querySelector('.everyday-video');if(v){v.muted=!v.muted;e.currentTarget.textContent=v.muted?'Sound On 🔊':'Mute 🔇';}}}>Sound On 🔊</button>
            </div>
          </div>
        </section>

        <section className="bro-notes section" aria-labelledby="bro-notes-title">
          <div className="section-heading">
            <div>
              <span className="eyebrow">THE BROSKI PROMISE</span>
              <h2 id="bro-notes-title">Honest treats.<br/><span className="serif">No shortcuts.</span></h2>
            </div>
            <p className="sample-reviews-label">
              <strong>Be one of our first 100 bros:</strong> Share a photo of your dog enjoying Broski with us at <a href="mailto:support@broskipetfood.com" style={{color:'inherit',textDecoration:'underline'}}>support@broskipetfood.com</a> and receive a special treat on us!
            </p>
          </div>
          <div className="bro-notes-grid">
            {[
              ['01',"Exactly what's inside.",'The full ingredient list is printed on every pack and detailed in our treat cupboard below.','Promise 01 · Honest label'],
              ['02','A full 400 g, every time.','Every pouch is weighed, sealed and stamped by hand in Nangloi, with a batch number and best-before date.','Promise 02 · Packed by us'],
              ['03','Something wrong? Tell us.',"Email us at support@broskipetfood.com with the batch number and a photo of the pack. We'll make it right.",'Promise 03 · We listen']
            ].map(([number,title,quote,story])=>(
              <article className="bro-note" key={number}>
                <div className="bro-note-top"><span>PROMISE {number}</span><Icon type="paw"/></div>
                <h3>{title}</h3>
                <blockquote>“{quote}”</blockquote>
                <div className="bro-note-person">
                  <span aria-hidden="true">{number}</span>
                  <div><strong>{story.split(' · ')[1]}</strong><small>{story.split(' · ')[0]}</small></div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="faq" className="faq section">
          <div>
            <div className="eyebrow">GOOD TO KNOW</div>
            <h2>A few things<br/><span className="serif">to chew on.</span></h2>
            <p>Little questions, straight answers.</p>
          </div>
          <div className="questions">
            {[
              ['When can I buy Broski?',"We plan to launch in West Delhi pet shops in November 2026. You can send a pre-launch order request on this site and we'll confirm delivery and payment by email."],
              ["What's in the treats?",'Full ingredient list coming soon – it will be printed on every pack and posted here, word for word, before we sell.'],
              ['How does delivery work?','We deliver in West Delhi to start. Delivery day and any charge are confirmed by email before you pay.'],
              ['Can I change my bag?','Yes. Open Your bag to adjust quantities or remove items. Your bag is saved only in this browser.'],
              ['I run a pet shop – can I stock Broski?',"Email us your shop name and area at support@broskipetfood.com; we'll visit and leave a sample jar."]
            ].map(([q,a])=>(
              <details key={q}><summary>{q}<span>+</span></summary><p>{a}</p></details>
            ))}
          </div>
        </section>

        <section className="newsletter section">
          <div>
            <span className="eyebrow">LET’S STAY IN THE LOOP</span>
            <h2>Good things.<br/>Straight to your inbox.</h2>
            <p>New treats, little stories, and plenty of dog energy.</p>
          </div>
          <form onSubmit={newsletter}>
            <label htmlFor="newsletter">Your email address</label>
            <div className="email-field">
              <input id="newsletter" type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@example.com"/>
              <button aria-label="Subscribe to launch updates" type="submit"><Icon type="arrow"/></button>
            </div>
            <small>We'll write once, on launch day. No spam.</small>
            <p className="form-message" role="status">{newsletterMsg}</p>
          </form>
        </section>
      </main>

      <footer>
        <div className="footer-top">
          <a className="logo" href="#"><Icon type="paw"/>Broski</a>
          <p>Crunchy dog biscuits packed by hand in Nangloi, West Delhi.<br/>Treats for your best bro.</p>
          <div>
            <a href="#shop">Shop treats</a>
            <a href="#story">Our story</a>
            <a href="#faq">FAQs</a>
          </div>
          <div>
            <button onClick={()=>open('delivery')}>Delivery & returns</button>
            <button onClick={()=>open('privacy')}>Privacy</button>
            <button onClick={()=>open('contact')}>Contact Broski</button>
          </div>
        </div>
        <div className="footer-word">best bros forever.<Icon type="paw"/></div>
        <div className="footer-bottom">
          <span>© 2026 Broski · Nangloi, Delhi 110041 · Udyam UDYAM-DL-11-0177908</span>
          <span>Made for the ones with paws. ♡</span>
          <span>IN / INR ₹</span>
        </div>
      </footer>

      <BroskiDock count={count} onOpenCart={()=>open('cart')} onOpenPreview={()=>open('preview')}/>

      {CONFIG.WHATSAPP_NUMBER ? (
        <a href={getWhatsAppOrderLink(rows)} target="_blank" rel="noopener noreferrer" className="whatsapp-float" aria-label="Chat with Broski on WhatsApp">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.886 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          <span>WhatsApp</span>
        </a>
      ) : null}


      <div className={'toast '+(toast?'visible':'')} role="status">
        {toast}
        <button tabIndex={toast?0:-1} aria-hidden={!toast} onClick={()=>{setToast('');open('cart');}}>View bag →</button>
      </div>

      {dialog==='product'&&detail&&(
        <Modal title={detail.name} onClose={()=>setDialog(null)} wide>
          <div className="detail-grid">
            <div className="detail-art" style={{background:looks[detail.id]?.bg}}>
              <Pack id={detail.id}/>
            </div>
            <div>
              <div className="eyebrow">400g · Crunchy biscuits</div>
              <h3 className="detail-price">{money(detail.price)}</h3>
              <p>{looks[detail.id]?.note}</p>
              
              <div className="broski-product-notes" style={{margin:'14px 0'}}>
                <h4 style={{margin:'0 0 8px',fontSize:'14px',fontWeight:'700'}}>What's Inside & Nutrition</h4>
                <p style={{fontSize:'13px',lineHeight:'1.5',margin:'0 0 10px'}}><strong>Ingredients:</strong> {looks[detail.id]?.ingredients}</p>
                
                {looks[detail.id]?.analysis && (
                  <div style={{display:'grid',gridTemplateColumns:'repeat(4, 1fr)',gap:'6px',background:'#faf5ee',padding:'8px 10px',borderRadius:'8px',margin:'10px 0',fontSize:'12px',textAlign:'center',border:'1px solid #ebd9c8'}}>
                    <div><span style={{color:'#766358',display:'block',fontSize:'11px'}}>Protein</span><strong>{looks[detail.id].analysis.protein}</strong></div>
                    <div><span style={{color:'#766358',display:'block',fontSize:'11px'}}>Fat</span><strong>{looks[detail.id].analysis.fat}</strong></div>
                    <div><span style={{color:'#766358',display:'block',fontSize:'11px'}}>Fibre</span><strong>{looks[detail.id].analysis.fibre}</strong></div>
                    <div><span style={{color:'#766358',display:'block',fontSize:'11px'}}>Moisture</span><strong>{looks[detail.id].analysis.moisture}</strong></div>
                  </div>
                )}

                <p style={{fontSize:'12.5px',color:'#554138',margin:'8px 0'}}><strong>Daily Feeding Guide:</strong> {looks[detail.id]?.feedingGuide}</p>
                <p style={{fontSize:'11.5px',color:'#766358',margin:'6px 0'}}>Handcrafted & packed in Nangloi, West Delhi 110041 · Udyam {CONFIG.UDYAM_REGISTRATION}</p>
              </div>

              <div style={{display:'flex',gap:'10px',flexWrap:'wrap',marginTop:'16px'}}>
                <button className="button primary" onClick={()=>add(detail.id)}>Add to bag <Icon type="bag"/></button>
                {CONFIG.WHATSAPP_NUMBER ? (
                  <a className="button light" href={getWhatsAppOrderLink([{product:detail,quantity:1}])} target="_blank" rel="noopener noreferrer" style={{display:'inline-flex',alignItems:'center',gap:'8px'}}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.886 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Order on WhatsApp
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {dialog==='cart'&&(
        <Modal title="Your treat bag" onClose={()=>setDialog(null)}>
          {rows.length===0 ? (
            <div className="empty">
              <Icon type="bag" width="45" height="45"/>
              <h3>A little empty. A lot of possibility.</h3>
              <p>Find something for your favourite dog.</p>
              <button className="button primary" onClick={()=>{setDialog(null);document.querySelector('#shop')?.scrollIntoView();}}>Explore treats</button>
            </div>
          ) : (
            <>
              <div className="cart-rows">
                {rows.map(i=>(
                  <div className="cart-row" key={i.id}>
                    <div className="cart-art" style={{background:looks[i.id]?.bg}}><Pack id={i.id} small/></div>
                    <div className="cart-info">
                      <h3>{i.product.name}</h3>
                      <small>400g · {money(i.product.price)}</small>
                      <div className="quantity">
                        <button onClick={()=>change(i.id,-1)} aria-label={`Decrease ${i.product.name}`}>−</button>
                        <span>{i.quantity}</span>
                        <button disabled={i.quantity>=20} onClick={()=>change(i.id,1)} aria-label={`Increase ${i.product.name}`}>+</button>
                        <button className="remove" onClick={()=>setCart(c=>c.filter(x=>x.id!==i.id))}>Remove</button>
                      </div>
                    </div>
                    <strong>{money(i.product.price*i.quantity)}</strong>
                  </div>
                ))}
              </div>
              <div className="totals">
                <p><span>Subtotal</span><span>{money(subtotal)}</span></p>
                <p><span>Delivery</span><span>Confirmed by email</span></p>
                <p className="total"><strong>Estimated total</strong><strong>{money(subtotal)}</strong></p>
              </div>
              <button className="button primary full" onClick={()=>open('checkout')}>Continue to order request <Icon type="arrow"/></button>
              {CONFIG.WHATSAPP_NUMBER ? (
                <>
                  <div style={{margin:'8px 0',textAlign:'center',color:'#766358',fontSize:'12px'}}>— or instant WhatsApp checkout —</div>
                  <a className="button full" href={getWhatsAppOrderLink(rows)} target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',background:'#25D366',color:'#fff',borderColor:'#25D366',fontWeight:'600'}}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.886 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Send Bag on WhatsApp
                  </a>
                </>
              ) : null}
              <p className="fine center">Direct local fulfilment in West Delhi · No payment taken online.</p>
            </>
          )}
        </Modal>
      )}

      {dialog==='checkout'&&(
        <Modal title="Pre-launch order request" onClose={()=>setDialog(null)}>
          <ol className="checkout-steps" aria-label="Order request progress">
            <li>01 · Your bag</li>
            <li aria-current="step">02 · Delivery details</li>
            <li>03 · Confirmation</li>
          </ol>
          <p className="notice">Send an order request to Broski. We'll reply to confirm delivery and payment. Nothing has been charged.</p>
          <details className="checkout-summary" open>
            <summary>Your order request <strong>{money(subtotal)}</strong></summary>
            <ul>
              {rows.map(i=><li key={i.id}><span>{i.product.name} × {i.quantity}</span><strong>{money(i.product.price*i.quantity)}</strong></li>)}
            </ul>
            <div><span>Delivery</span><span>Confirmed by email</span></div>
          </details>
          <form className="checkout-form" onSubmit={submitOrderRequest}>
            <p className="checkout-required">All fields are required.</p>
            <div className="field-grid">
              <label>Full name<input name="name" autoComplete="name" required minLength="2" maxLength="80" placeholder="Your name"/></label>
              <label>Email<input name="email" autoComplete="email" type="email" required maxLength="150" placeholder="you@example.com"/></label>
              <label>Mobile number<input name="phone" autoComplete="tel" inputMode="tel" pattern="[6-9][0-9]{9}" title="A 10-digit Indian mobile number starting with 6–9" required placeholder="9876543210"/></label>
              <label>PIN code<input name="pincode" autoComplete="postal-code" inputMode="numeric" pattern="[1-9][0-9]{5}" required placeholder="110041"/></label>
            </div>
            <label>Address<input name="address" autoComplete="street-address" required minLength="5" maxLength="250" placeholder="House no., street, area, West Delhi"/></label>
            <label>City<input name="city" autoComplete="address-level2" required minLength="2" maxLength="80" placeholder="West Delhi"/></label>
            <div className="total"><strong>Estimated total</strong><strong>{money(subtotal)}</strong></div>
            <p className="fine">No card or UPI details are taken on this site. Submitting opens your email app with your order request.</p>
            <button className="button primary full" type="submit" disabled={!rows.length}>Submit order request <Icon type="arrow"/></button>
            <button type="button" className="text-link back" onClick={()=>open('cart')}>← Back to bag</button>
          </form>
        </Modal>
      )}

      {dialog==='success'&&order&&(
        <Modal title="Order request ready" onClose={()=>setDialog(null)}>
          <div className="success">
            <span className="round-paw"><Icon type="paw"/></span>
            <h3>Order request created!</h3>
            <p>Your order reference is <strong>{order.id}</strong>. Estimated total: {money(order.total)}.</p>
            <p style={{fontSize:'13px',color:'#554138',margin:'10px 0'}}>To confirm delivery instantly in West Delhi, you can message us directly on WhatsApp or reply via email. No payment has been taken online.</p>
            <div style={{display:'flex',gap:'10px',justifyContent:'center',flexWrap:'wrap',marginTop:'14px'}}>
              {CONFIG.WHATSAPP_NUMBER ? (
                <a className="button" href={getWhatsAppOrderLink(order.items, `Order Ref: ${order.id}\nName: ${order.customer?.name}\nPhone: ${order.customer?.phone}\nAddress: ${order.customer?.address}, ${order.customer?.pincode}`)} target="_blank" rel="noopener noreferrer" style={{display:'inline-flex',alignItems:'center',gap:'8px',background:'#25D366',color:'#fff',borderColor:'#25D366',fontWeight:'600'}}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.886 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Confirm on WhatsApp
                </a>
              ) : null}
              <button className="button primary" onClick={()=>setDialog(null)}>Back to Broski <Icon type="arrow"/></button>
            </div>
          </div>
        </Modal>
      )}

      {['preview','delivery','privacy','contact'].includes(dialog)&&(
        <Modal title={{preview:'Launch info',delivery:'Delivery & returns',privacy:'Privacy',contact:'Contact Broski'}[dialog]} onClose={()=>setDialog(null)}>
          <div className="info-copy">
            {dialog==='preview'?(
              <p>Broski is a new dog-biscuit brand from Nangloi, West Delhi. Our first two flavours, Non-Veg and Mix, come in a 400 g zip pouch. We plan to launch in West Delhi pet shops in November 2026.</p>
            ):dialog==='delivery'?(
              <p>We deliver in West Delhi to start. Delivery day and any charge are confirmed by email before you pay. Damaged or wrong pack? Email us within 3 days with a photo showing the batch number and we'll replace it.</p>
            ):dialog==='privacy'?(
              <>
                <p>Your bag is saved only in this browser. Order requests and sign-ups are sent from your own email app – we only see what you send us, and use it only to reply. We never sell or share your details.</p>
                <button className="button light" onClick={()=>{setCart([]);setToast('Saved bag cleared.');setDialog(null);}}>Clear my saved bag</button>
              </>
            ):(
              <p>Email: {CONFIG.SUPPORT_EMAIL}{CONFIG.WHATSAPP_NUMBER ? ` · WhatsApp: +${CONFIG.WHATSAPP_NUMBER}` : ''} · Nangloi, West Delhi 110041 · Udyam Reg. {CONFIG.UDYAM_REGISTRATION}</p>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
createRoot(document.getElementById('root')).render(<App/>);
