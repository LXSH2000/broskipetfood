import React, {useEffect, useRef} from 'react';

export default function Modal({title,onClose,children,wide=false,locked=false}){
  const ref=useRef(null);
  const latest=useRef({onClose,locked});
  latest.current={onClose,locked};
  const dismiss=()=>{if(!latest.current.locked)latest.current.onClose();};
  useEffect(()=>{
    const panel=ref.current, backdrop=panel.parentElement;
    const previous=document.activeElement;
    const oldOverflow=document.body.style.overflow;
    const inertBefore=new Map();
    const isolate=()=>Array.from(backdrop.parentElement.children).forEach(node=>{
      if(node===backdrop||inertBefore.has(node))return;
      inertBefore.set(node,node.inert);node.inert=true;
    });
    isolate();
    const siblings=new MutationObserver(isolate);
    siblings.observe(backdrop.parentElement,{childList:true});
    document.body.style.overflow='hidden';
    panel.focus({preventScroll:true});
    const controls=()=>Array.from(panel.querySelectorAll('button,a[href],input,select,textarea,summary,[tabindex]'))
      .filter(node=>!node.disabled&&node.tabIndex>=0&&node.getClientRects().length&&!node.closest('[hidden],[inert]'));
    const key=e=>{
      if(e.key==='Escape'){e.preventDefault();dismiss();}
      if(e.key!=='Tab')return;
      const nodes=controls(),first=nodes[0],last=nodes[nodes.length-1];
      if(!first){e.preventDefault();panel.focus();return;}
      if(!panel.contains(document.activeElement)||document.activeElement===panel){e.preventDefault();(e.shiftKey?last:first).focus();}
      else if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    };
    const contain=e=>{if(!panel.contains(e.target))panel.focus({preventScroll:true});};
    const contents=new MutationObserver(()=>{if(!panel.contains(document.activeElement))panel.focus({preventScroll:true});});
    contents.observe(panel,{childList:true,subtree:true});
    document.addEventListener('keydown',key);document.addEventListener('focusin',contain);
    return()=>{
      siblings.disconnect();contents.disconnect();
      document.removeEventListener('keydown',key);document.removeEventListener('focusin',contain);
      inertBefore.forEach((value,node)=>{node.inert=value;});
      document.body.style.overflow=oldOverflow;
      const target=previous?.isConnected&&previous!==document.body?previous:document.querySelector('.bag-button');
      target?.focus?.({preventScroll:true});
    };
  },[]);
  return <div className="modal-backdrop" onClick={e=>{if(e.target===e.currentTarget)dismiss();}}>
    <section ref={ref} role="dialog" aria-modal="true" aria-label={title} aria-busy={locked} tabIndex={-1} className={'modal '+(wide?'wide':'')}>
      <div className="modal-top"><h2>{title}</h2><button className="icon-btn" type="button" disabled={locked} onClick={dismiss} aria-label="Close dialog"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg></button></div>{children}
    </section>
  </div>;
}
