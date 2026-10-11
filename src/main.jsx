import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { bundles, gallery, uses, steps, impact, faqs, included, money } from './data.js';
import './styles.css';

const asset = path => `${import.meta.env.BASE_URL}${path}`;

function Icon({ name, size = 24, ...props }) {
  const paths = {
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    bag: <><path d="M5 7h14l1 14H4L5 7Z" /><path d="M8 8V6a4 4 0 0 1 8 0v2M9 11a3 3 0 0 0 6 0" /></>,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    left: <path d="m14 5-7 7 7 7" />,
    right: <path d="m10 5 7 7-7 7" />,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 4v3" /></>,
    return: <><path d="M4 10a8 8 0 1 1 1 8M4 4v6h6" /><path d="M12 8v5l3 2" /></>,
    zoom: <><circle cx="10" cy="10" r="6" /><path d="m15 15 6 6M7 10h6m-3-3v6" /></>,
    leaf: <><path d="M20 3C5 2 2 10 6 16c6 5 14 1 14-13Z" /><path d="M4 21 16 8" /></>,
    book: <><path d="M3 4h6a4 4 0 0 1 3 2 4 4 0 0 1 3-2h6v16h-6a4 4 0 0 0-3 1 4 4 0 0 0-3-1H3V4Zm9 2v15" /></>,
    plus: <path d="M5 12h14M12 5v14" />,
    minus: <path d="M5 12h14" />,
    trash: <><path d="M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name] || paths.check}</svg>;
}

function Wordmark({ footer = false }) {
  return <a href="#top" className={`wordmark ${footer ? 'wordmark-footer' : ''}`} aria-label="Manveo – till sidans början"><span className="brand-m">M<span className="brand-thread" /></span>ANVEO</a>;
}

function Photo({ src, cell, alt, className = '', eager = false }) {
  const sprite = Number.isInteger(cell);
  return <div className={`photo ${sprite ? 'sprite' : ''} ${className}`}>
    <div className="photo-frame">
      <img src={asset(`images/${src}`)} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" fetchPriority={eager ? 'high' : 'auto'}
        style={sprite ? { left: `${-(cell % 2) * 100}%`, top: `${-Math.floor(cell / 2) * 100}%` } : undefined} />
    </div>
  </div>;
}

function Kicker({ children, light = false }) {
  return <p className={`kicker ${light ? 'light' : ''}`}><span />{children}</p>;
}

function GallerySlide({ item, compact = false }) {
  return <div className={`gallery-art art-${item.type} ${compact ? 'compact' : ''}`}>
    <Photo {...item} eager={item.type === 'hero'} />
    {item.type === 'hero' && <div className="hero-art-copy"><span>Allt du behöver</span><em>för att väva, laga & skapa</em><i /><small>INSTRUKTIONER & MÖNSTER INGÅR</small></div>}
    {item.type === 'repair' && <><div className="repair-art-copy"><span>Ge dina kläder<br />en andra chans.</span><small>SMÅ LAGNINGAR. STORA MÖJLIGHETER.</small></div><div className="before-after-labels"><span>FÖRE</span><span>EFTER</span></div></>}
    {item.type === 'craft' && <div className="art-bottom-copy"><span>Små stygn.<br />Stor skillnad.</span><small>SKAPA NÅGOT SOM ÄR DITT.</small></div>}
    {item.type === 'steps' && <div className="steps-art-copy"><strong>Laga hål på minuter</strong><span>i 4 enkla steg</span></div>}
    {item.type === 'flower' && <div className="art-bottom-copy"><span>Låt kreativiteten<br />blomma.</span></div>}
    {item.type === 'kit' && <div className="kit-art-copy"><span>Stort för en<br />liten kreativ stund.</span></div>}
  </div>;
}

function Gallery({ active, setActive, onZoom }) {
  const touchStart = useRef(null);
  const next = direction => setActive(index => (index + direction + gallery.length) % gallery.length);
  return <section className="product-gallery" aria-label="Produktbilder">
    <div className="gallery-stage" tabIndex="0" role="region" aria-roledescription="bildspel" aria-label="Manveo produktgalleri"
      onKeyDown={e => { if (['ArrowLeft', 'ArrowRight'].includes(e.key)) { e.preventDefault(); next(e.key === 'ArrowRight' ? 1 : -1); } }}
      onTouchStart={e => { touchStart.current = e.touches[0].clientX; }}
      onTouchEnd={e => { if (touchStart.current !== null) { const delta = touchStart.current - e.changedTouches[0].clientX; if (Math.abs(delta) > 40) next(delta > 0 ? 1 : -1); touchStart.current = null; } }}>
      <GallerySlide item={gallery[active]} />
      <button className="gallery-arrow prev" aria-label="Föregående produktbild" onClick={() => next(-1)}><Icon name="left" size={18} /></button>
      <button className="gallery-arrow next" aria-label="Nästa produktbild" onClick={() => next(1)}><Icon name="right" size={18} /></button>
      <button className="zoom-button" aria-label="Förstora produktbild" onClick={onZoom}><Icon name="zoom" size={19} /></button>
      <span className="gallery-count" aria-live="polite">{active + 1} / {gallery.length}</span>
    </div>
    <div className="gallery-thumbnails" aria-label="Välj produktbild">
      {gallery.map((item, index) => <button key={item.type} className={active === index ? 'selected' : ''} onClick={() => setActive(index)} aria-label={`Visa bild ${index + 1}: ${item.alt}`} aria-pressed={active === index}><GallerySlide item={item} compact /></button>)}
    </div>
    <div className="gallery-note"><Icon name="leaf" size={16} /><span>Laga. Skapa. Bevara det du tycker om.</span></div>
  </section>;
}

function PaymentMethods() {
  return <div className="payment-methods" aria-label="Betalningsmetoder från originalsidans layout">
    <span className="pay klarna">Klarna.</span><span className="pay swish"><i />swish</span>
    <span className="pay mastercard" aria-label="Mastercard"><i /><i /></span>
    <span className="pay visa">VISA</span><span className="pay applepay">● Pay</span>
    <span className="pay googlepay"><b>G</b> Pay</span><span className="pay amex">AMERICAN<br />EXPRESS</span>
  </div>;
}

function ProductForm({ selected, setSelected, threads, setThreads, onAdd, formRef }) {
  return <div className="product-details">
    <Kicker>Ett litet verktyg. Stora möjligheter.</Kicker>
    <h1>Manveo – Väv enkelt & ge kläder nytt liv</h1>
    <div className="product-intro"><span>Laga dina favoriter.</span> Skapa något personligt.</div>
    <form onSubmit={e => { e.preventDefault(); onAdd(); }} ref={formRef}>
      <fieldset className="bundle-options"><legend className="sr-only">Välj antal kit</legend>
        {bundles.map((bundle, index) => <label className={`bundle ${selected === index ? 'is-selected' : ''}`} key={bundle.id}>
          {bundle.popular && <span className="popular-label">MEST POPULÄR</span>}
          <input type="radio" name="bundle" value={index} checked={selected === index} onChange={() => setSelected(index)} />
          <div className="bundle-main"><span className="radio-mark" /><strong>{bundle.count} Kit</strong><span className="bundle-price"><span>{money(bundle.price)}</span><del>{money(bundle.oldPrice)}</del></span></div>
          <div className="bundle-gift"><span className="ebook"><Icon name="book" size={18} /><small>PDF</small></span><strong>+ Digital mönsterbok</strong><del>49 kr</del></div>
        </label>)}
      </fieldset>
      <div className="addon-title"><span />Behöver du fler färger att skapa med?<span /></div>
      <label className={`thread-addon ${threads ? 'is-selected' : ''}`}>
        <input type="checkbox" checked={threads} onChange={e => setThreads(e.target.checked)} /><span className="checkbox-mark">{threads && <Icon name="check" size={17} />}</span>
        <img src={asset('images/threads.png')} alt="24 färgtrådar i dämpade nyanser" width="72" height="72" />
        <strong>Manveo Färgtrådar™<br /><span>– 24 färger</span></strong><span className="addon-price">99 kr<del>149 kr</del></span>
      </label>
      <button className="button primary add-to-cart" type="submit"><span>Lägg i kundvagn</span><Icon name="arrow" size={20} /></button>
    </form>
    <PaymentMethods />
    <div className="purchase-assurance"><span><Icon name="return" size={16} />30 dagars öppet köp</span><span><Icon name="lock" size={15} />Säker betalning</span></div>
  </div>;
}

function Carousel({ items, label, kind }) {
  const track = useRef(null);
  const [active, setActive] = useState(0);
  const go = index => {
    const children = track.current.children;
    const normalized = (index + items.length) % items.length;
    const target = children[normalized];
    track.current.scrollTo({ left: target.offsetLeft - children[0].offsetLeft, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    setActive(normalized);
  };
  const sync = () => {
    const el = track.current;
    const cards = [...el.children];
    const nearest = cards.reduce((best, card, i) => Math.abs(card.offsetLeft - cards[0].offsetLeft - el.scrollLeft) < Math.abs(cards[best].offsetLeft - cards[0].offsetLeft - el.scrollLeft) ? i : best, 0);
    setActive(nearest);
  };
  return <div className={`carousel carousel-${kind}`} role="region" aria-roledescription="karusell" aria-label={label}>
    <div className="carousel-track" ref={track} onScroll={sync} tabIndex="0" onKeyDown={e => { if (['ArrowLeft', 'ArrowRight'].includes(e.key)) { e.preventDefault(); go(active + (e.key === 'ArrowRight' ? 1 : -1)); } }}>
      {items.map((item, i) => <article className="carousel-card" key={item.title || item.alt} aria-label={`${i + 1} av ${items.length}`}>
        <Photo {...item} />
        <div className="carousel-caption">{item.title && <h3>{item.title}</h3>}<p>{item.text}</p></div>
      </article>)}
    </div>
    <div className="carousel-controls"><span className="slide-counter" aria-live="polite">{String(active + 1).padStart(2, '0')} <span>/ {String(items.length).padStart(2, '0')}</span></span>
      <div className="carousel-dots">{items.map((_, i) => <button key={i} className={active === i ? 'active' : ''} aria-label={`Visa ${label.toLowerCase()} ${i + 1}`} aria-current={active === i ? 'true' : undefined} onClick={() => go(i)} />)}</div>
      <div className="carousel-arrows"><button aria-label={`Föregående: ${label}`} onClick={() => go(active - 1)}><Icon name="left" size={18} /></button><button aria-label={`Nästa: ${label}`} onClick={() => go(active + 1)}><Icon name="right" size={18} /></button></div>
    </div>
  </div>;
}

function Editorial() {
  return <>
    <section className="section split-story" id="upptack">
      <div className="story-copy"><Kicker>Vissa plagg är värda att bevara</Kicker><h2>Skapa nytt av det du<br className="desktop-break" /> redan tycker om</h2><p>Med Manveo kan du förvandla hål och slitage till vackra, personliga detaljer – eller låta kreativiteten flöda och skapa egna mönster på tröjor, jeans, filtar och mycket mer.</p><a className="text-link" href="#sa-fungerar-det">Upptäck hur det fungerar <Icon name="arrow" size={18} /></a></div>
      <Photo src="striped.png" alt="Manveo på en salviagrön och gräddvit randig tröja med terrakottafärgad tråd" />
    </section>
    <section className="before-after-section section soft-section">
      <header className="section-heading centered"><Kicker>Före & efter</Kicker><h2>Från hål till något vackert</h2><p>En sliten omtyckt tröja behöver inte slängas. Gör lagningen till en del av plagget och skapa något som känns personligt på riktigt.</p></header>
      <div className="comparison"><img src={asset('images/before-after.png')} alt="Samma salviagröna tröja före lagning med hål, och efter med en ton-i-ton-vävd lagning" loading="lazy" /><div className="comparison-labels"><span>FÖRE</span><span>EFTER</span></div></div>
    </section>
    <section className="section split-story creativity">
      <div className="story-copy"><Kicker>Skapa fritt</Kicker><h2>Låt fantasin flöda</h2><p>Du behöver inte laga hål för att använda Manveo. Välj dina favoritfärger och börja skapa! Väv en blomma på tröjan, ett färgglatt mönster på jeansen eller något helt eget. Det roliga är att se din idé växa fram rad för rad.</p><div className="color-palette" aria-label="Färginspiration: salvia, terrakotta, gräddvitt, blått och rosa"><i /><i /><i /><i /><i /><span>Dina färger. Ditt uttryck.</span></div></div>
      <Photo src="craft.png" cell={2} alt="Ett handgjort blommönster i terrakotta, rosa och gräddvitt på blå denim" />
    </section>
    <section className="slow-section">
      <Photo src="craft.png" cell={3} alt="Händer arbetar med Manveo på en mörk stickad tröja vid ett träbord" />
      <div className="slow-copy"><Kicker light>Mer än bara lagning</Kicker><h2>En stund för dig själv</h2><p>Välj dina färger, låt händerna arbeta och se mönstret växa fram rad för rad. Manveo gör lagningen till en lugn och kreativ stund – samtidigt som du skapar något användbart.</p><p className="slow-end">Rogivande som ett pyssel.<br />Användbart på riktigt.</p></div>
    </section>
    <section className="section use-section" id="inspiration"><header className="section-heading"><Kicker>Gör det till ditt</Kicker><h2>Laga. Skapa. Förnya.</h2><p>Från diskreta lagningar till färgstarka detaljer – du bestämmer hur resultatet ska se ut.</p></header><Carousel items={uses} label="Inspiration" kind="uses" /></section>
    <section className="section beginner-section"><header className="section-heading centered"><Kicker>Gjord för nybörjare</Kicker><h2>Du behöver inte<br />kunna väva</h2><p>Manveo hjälper dig att hålla trådarna på plats medan du arbetar rad för rad. Följ de enkla instruktionerna och se ditt mönster växa fram framför dig.</p></header>
      <div className="benefits">{[['Ingen erfarenhet', 'Börja direkt, även om du aldrig har vävt tidigare.'], ['Steg för steg', 'Enkla instruktioner guidar dig hela vägen.'], ['Allt samlat', 'Verktyg, instruktioner och mönster på ett ställe.']].map(([title, text]) => <div className="benefit" key={title}><Icon name="check" size={26} /><h3>{title}</h3><p>{text}</p></div>)}</div>
    </section>
    <section className="section soft-section tutorial" id="sa-fungerar-det"><header className="section-heading centered"><Kicker>Så fungerar det</Kicker><h2>Väv i 4 enkla steg</h2><p>Ingen tidigare erfarenhet behövs.</p></header><div className="steps-grid">{steps.map((step, i) => <article className="step-card" key={step.title}><div className="step-image"><Photo src="steps.png" cell={i} alt={step.alt} /><span className="step-number">0{i + 1}</span></div><div className="step-copy"><h3>{step.title}</h3><p>{step.text}</p></div></article>)}</div></section>
    <section className="section split-story kit-section" id="ditt-kit"><div className="story-copy"><Kicker>I ditt Manveo-kit</Kicker><h2>Detta ingår</h2><p>Verktygen, mönstren och instruktionerna är samlade i ett kit. Du väljer själv garn och färger till det du vill skapa.</p><ul className="included-list">{included.map(item => <li key={item}><Icon name="check" size={20} />{item}</li>)}</ul></div><Photo src="kit.png" alt="Manveo-kit med vävverktyg, träskiva, fjäder, nålar och instruktionsbok. Garn visas som färginspiration." /></section>
    <section className="section impact-section"><header className="section-heading centered"><Kicker>Bevara mer</Kicker><h2>Laga mer än bara kläder</h2><p>Genom att laga istället för att köpa nytt förlänger du livet på dina kläder och minskar onödigt avfall – ett litet val som gör skillnad för en mer hållbar framtid.</p></header><Carousel items={impact} label="Bevara mer" kind="impact" /></section>
    <section className="guarantee" id="oppet-kop"><div className="guarantee-number">30<span>DAGARS ÖPPET KÖP</span></div><div className="guarantee-copy"><h2>Skapa först.<br />Bestäm dig sen.</h2><p>Vi vill att du ska känna dig trygg med ditt köp. Därför har du 30 dagars öppet köp på Manveo.</p><a className="text-link" href="#produkt">Hitta ditt kit <Icon name="arrow" size={18} /></a></div></section>
    <section className="section faq-section" id="fragor"><header className="section-heading centered"><Kicker>Vanliga frågor</Kicker><h2>Undrar du något?</h2><p>Här hittar du svaren på de vanligaste frågorna om Manveo.</p></header><div className="faq-list">{faqs.map(([q, a]) => <details key={q}><summary>{q}<span className="faq-plus"><Icon name="plus" size={20} /></span></summary><p>{a}</p></details>)}</div></section>
  </>;
}

function Modal({ children, onClose, title, variant = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    return () => { dialog.close(); document.body.style.overflow = oldOverflow; };
  }, []);
  return <dialog ref={ref} className={`modal ${variant}`} aria-label={title} onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="modal-inner"><header className="modal-heading"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Stäng"><Icon name="close" /></button></header>{children}</div>
  </dialog>;
}

function getStoredCart() {
  try {
    const raw = JSON.parse(localStorage.getItem('manveo-cart-v1'));
    if (!Array.isArray(raw)) return [];
    const seen = new Set();
    return raw.filter(item => {
      if (!item || !['kit-1', 'kit-2', 'kit-3', 'threads'].includes(item.id) || !Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > 99 || seen.has(item.id)) return false;
      seen.add(item.id); return true;
    }).map(({ id, quantity }) => ({ id, quantity }));
  } catch { return []; }
}

function cartProduct(id) {
  if (id === 'threads') return { name: 'Manveo Färgtrådar™', detail: '24 färger', price: 99, src: 'threads.png' };
  const bundle = bundles.find(b => b.id === id);
  return { name: `Manveo – ${bundle.count} Kit`, detail: '+ Digital mönsterbok ingår', price: bundle.price, src: 'hero.png' };
}

function Cart({ cart, setCart, onClose }) {
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const total = cart.reduce((sum, item) => sum + cartProduct(item.id).price * item.quantity, 0);
  const update = (id, delta) => { setStatus(''); setCart(old => old.map(item => item.id === id ? { ...item, quantity: Math.min(99, item.quantity + delta) } : item).filter(item => item.quantity > 0)); };
  const checkout = async () => {
    const endpoint = import.meta.env.VITE_CHECKOUT_ENDPOINT;
    if (!endpoint) { setStatus('Kassan är inte öppen ännu. Dina varor finns kvar i kundvagnen och ingen betalning har gjorts.'); return; }
    setBusy(true); setStatus('');
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: cart }) });
      if (!response.ok) throw new Error('Checkout request failed');
      const { url } = await response.json();
      const destination = new URL(url);
      if (destination.protocol !== 'https:') throw new Error('Invalid checkout URL');
      window.location.assign(destination.href);
    } catch { setStatus('Det gick inte att öppna kassan. Försök igen om en stund. Inga varor har tagits bort.'); }
    finally { setBusy(false); }
  };
  return <><div className="cart-content">{cart.length === 0 ? <div className="empty-cart"><Icon name="bag" size={48} /><h3>Din nästa kreativa stund börjar här.</h3><p>Din kundvagn är tom just nu.</p><button className="button primary" onClick={onClose}>Upptäck Manveo <Icon name="arrow" size={18} /></button></div> : <>
    <p className="cart-assurance"><Icon name="check" size={16} />Ett steg närmare något personligt.</p>
    {cart.map(item => { const product = cartProduct(item.id); return <article className="cart-item" key={item.id}><img src={asset(`images/${product.src}`)} alt={product.name} /><div className="cart-item-details"><h3>{product.name}</h3><p>{product.detail}</p><div className="cart-item-actions"><div className="quantity"><button onClick={() => update(item.id, -1)} aria-label={`Minska antal ${product.name}`}><Icon name="minus" size={14} /></button><span aria-label="Antal">{item.quantity}</span><button onClick={() => update(item.id, 1)} disabled={item.quantity >= 99} aria-label={`Öka antal ${product.name}`}><Icon name="plus" size={14} /></button></div><strong>{money(product.price * item.quantity)}</strong><button className="remove-item" aria-label={`Ta bort ${product.name}`} onClick={() => update(item.id, -item.quantity)}><Icon name="trash" size={17} /></button></div></div></article>; })}
  </>}</div>{cart.length > 0 && <div className="cart-bottom"><div className="cart-subtotal"><span>Delsumma</span><strong>{money(total)}</strong></div><p>Frakt och eventuella rabatter visas i kassan.</p><button className="button primary" onClick={checkout} disabled={busy}>{busy ? 'Öppnar kassan…' : 'Gå till kassan'}<Icon name="lock" size={18} /></button>{status && <p className="checkout-status" role="status">{status}</p>}<button className="continue-shopping" onClick={onClose}>Fortsätt handla</button></div>}</>;
}

const policyContent = {
  'Spåra din beställning': <><p>Du hittar leveransinformation och din spårningslänk i leveransbekräftelsen som skickas när beställningen lämnar lagret.</p><p>Kontakta kundservice via uppgifterna i din orderbekräftelse om du behöver hjälp.</p></>,
  'Kontakta oss': <><p>Vi hjälper dig gärna med frågor om Manveo, din beställning eller en retur.</p><p>Måndag–fredag kl. 08:00–17:00.</p><p>Använd kontaktuppgifterna i din orderbekräftelse för frågor om en befintlig beställning.</p></>,
  'Återbetalningspolicy': <><p>Du har 30 dagars öppet köp på Manveo. Kontakta kundservice via din orderbekräftelse innan du skickar tillbaka en vara, så får du hjälp med returinstruktioner.</p><p>Fullständiga returvillkor ska finnas tillgängliga före köp.</p></>,
  'Fraktpolicy': <><p>Fraktalternativ, kostnader och beräknad leveranstid ska visas i kassan innan du bekräftar din beställning.</p><p>När beställningen skickats får du en leveransbekräftelse med tillgänglig spårningsinformation.</p></>,
  'Integritetspolicy': <><p>Den här sidan sparar din kundvagn lokalt i din webbläsare så att dina val finns kvar när du kommer tillbaka. Inga formuläruppgifter skickas från sidan innan en betalningstjänst är ansluten.</p><p>Du kan ta bort den sparade kundvagnen genom att rensa webbplatsens data i din webbläsare.</p></>,
  'Allmänna villkor': <><p>Priserna på sidan anges i svenska kronor. Kontrollera valda produkter, slutpris, fraktvillkor och säljarens företagsuppgifter innan du bekräftar ett köp.</p><p>En beställning är inte genomförd förrän den har bekräftats i en ansluten kassa. Den här sidans kundvagn genomför inte någon betalning på egen hand.</p></>,
};

function Footer({ onInfo }) {
  return <footer className="footer"><div className="footer-grid"><div className="footer-brand"><Wordmark footer /><p>Små lagningar.<br />Stora möjligheter.</p></div><div><h3>Information</h3><p>Måndag–fredag kl.<br />08:00–17:00</p><p>Manveo</p></div><div><h3>Hjälpcenter</h3>{['Spåra din beställning', 'Kontakta oss', 'Återbetalningspolicy'].map(label => <button key={label} onClick={() => onInfo(label)}>{label}</button>)}</div><div><h3>Företagsinformation</h3>{['Fraktpolicy', 'Integritetspolicy', 'Allmänna villkor'].map(label => <button key={label} onClick={() => onInfo(label)}>{label}</button>)}</div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Manveo</span><span>Skapat för att bevara.</span><span>Sverige · SEK</span></div></footer>;
}

function App() {
  const [selected, setSelected] = useState(0);
  const [threads, setThreads] = useState(false);
  const [active, setActive] = useState(0);
  const [modal, setModal] = useState(null);
  const [cart, setCart] = useState(getStoredCart);
  const [stickyVisible, setStickyVisible] = useState(false);
  const formRef = useRef(null);
  useEffect(() => { try { localStorage.setItem('manveo-cart-v1', JSON.stringify(cart)); } catch { /* A private browser can still use the in-memory cart. */ } }, [cart]);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setStickyVisible(!entry.isIntersecting && entry.boundingClientRect.bottom < 0), { threshold: 0 });
    observer.observe(formRef.current);
    return () => observer.disconnect();
  }, []);
  const add = () => {
    const additions = [bundles[selected].id, ...(threads ? ['threads'] : [])];
    setCart(old => { const updated = old.map(item => ({ ...item })); for (const id of additions) { const existing = updated.find(item => item.id === id); if (existing) existing.quantity = Math.min(99, existing.quantity + 1); else updated.push({ id, quantity: 1 }); } return updated; });
    setModal({ type: 'cart' });
  };
  const close = () => setModal(null);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  return <><a href="#produkt" className="skip-link">Hoppa till innehållet</a>
    <div className="announcement" id="top"><div className="announcement-inner"><span>JUST NU: HÖSTREA 40% RABATT</span><i /><span>BETALA SENARE MED KLARNA</span><i /><span>30 DAGARS ÖPPET KÖP</span></div></div>
    <header className="site-header"><div className="header-inner"><button className="icon-button menu-toggle" onClick={() => setModal({ type: 'menu' })} aria-label="Öppna meny"><Icon name="menu" size={26} /></button><Wordmark /><nav aria-label="Huvudmeny"><a href="#produkt">Manveo-kitet</a><a href="#sa-fungerar-det">Så fungerar det</a><a href="#inspiration">Inspiration</a><a href="#fragor">Vanliga frågor</a></nav><button className="icon-button cart-toggle" onClick={() => setModal({ type: 'cart' })} aria-label={`Öppna kundvagn, ${count} artiklar`}><Icon name="bag" size={25} />{count > 0 && <span className="cart-badge">{count}</span>}</button></div></header>
    <main><section className="product-section page-width" id="produkt"><Gallery active={active} setActive={setActive} onZoom={() => setModal({ type: 'gallery' })} /><ProductForm {...{ selected, setSelected, threads, setThreads, formRef }} onAdd={add} /></section><div className="editorial-width"><Editorial /></div></main>
    <Footer onInfo={title => setModal({ type: 'info', title })} />
    <div className={`sticky-cart ${stickyVisible ? 'visible' : ''}`} inert={!stickyVisible ? true : undefined}><div><strong>Manveo · {bundles[selected].count} Kit</strong><span>{money(bundles[selected].price + (threads ? 99 : 0))}</span></div><button className="button primary" onClick={add}>Lägg i kundvagn<Icon name="arrow" size={18} /></button></div>
    {modal?.type === 'cart' && <Modal title={`Din kundvagn (${count})`} onClose={close} variant="drawer cart-drawer"><Cart cart={cart} setCart={setCart} onClose={close} /></Modal>}
    {modal?.type === 'menu' && <Modal title="Manveo" onClose={close} variant="drawer menu-drawer"><nav className="drawer-nav" aria-label="Mobilmeny">{[['Manveo-kitet', 'produkt'], ['Upptäck Manveo', 'upptack'], ['Så fungerar det', 'sa-fungerar-det'], ['Inspiration', 'inspiration'], ['Detta ingår', 'ditt-kit'], ['Vanliga frågor', 'fragor']].map(([label, id]) => <a href={`#${id}`} key={id} onClick={close}>{label}<Icon name="arrow" size={19} /></a>)}</nav><p className="menu-note">Laga. Skapa. Förnya.<br /><span>En tråd i taget.</span></p></Modal>}
    {modal?.type === 'gallery' && <Modal title={`Produktbild ${active + 1} av ${gallery.length}`} onClose={close} variant="lightbox"><GallerySlide item={gallery[active]} /><div className="lightbox-controls"><button className="icon-button" aria-label="Föregående förstorade bild" onClick={() => setActive(i => (i + gallery.length - 1) % gallery.length)}><Icon name="left" /></button><span>{active + 1} / {gallery.length}</span><button className="icon-button" aria-label="Nästa förstorade bild" onClick={() => setActive(i => (i + 1) % gallery.length)}><Icon name="right" /></button></div></Modal>}
    {modal?.type === 'info' && <Modal title={modal.title} onClose={close} variant="info-modal"><div className="policy-content">{policyContent[modal.title]}</div></Modal>}
  </>;
}

createRoot(document.getElementById('root')).render(<App />);
