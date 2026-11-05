from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image, KeepTogether
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.units import mm
import json, re

ROOT=Path(__file__).resolve().parent
OUT=ROOT/'Broski_India_Launch_Plan_Under_2_Lakh.pdf'
pdfmetrics.registerFont(TTFont('Arial',r'C:\Windows\Fonts\arial.ttf'))
pdfmetrics.registerFont(TTFont('ArialBold',r'C:\Windows\Fonts\arialbd.ttf'))
pdfmetrics.registerFontFamily('Arial',normal='Arial',bold='ArialBold',italic='Arial',boldItalic='ArialBold')
ink=colors.HexColor('#352016'); rust=colors.HexColor('#A95030'); cream=colors.HexColor('#F5EEE2'); olive=colors.HexColor('#697043')
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='Body',fontName='Arial',fontSize=9.4,leading=14,textColor=ink,spaceAfter=9))
styles.add(ParagraphStyle(name='TitleX',fontName='ArialBold',fontSize=29,leading=34,textColor=ink,spaceAfter=18))
styles.add(ParagraphStyle(name='H1X',fontName='ArialBold',fontSize=22,leading=27,textColor=ink,spaceAfter=16))
styles.add(ParagraphStyle(name='H2X',fontName='ArialBold',fontSize=12.5,leading=17,textColor=rust,spaceBefore=9,spaceAfter=8))
styles.add(ParagraphStyle(name='TinyX',fontName='Arial',fontSize=7.8,leading=11,textColor=ink,spaceAfter=6))
styles.add(ParagraphStyle(name='CellX',fontName='Arial',fontSize=8,leading=11,textColor=ink))
story=[]; sections=[]; manuscript=[]
def p(text,style='Body'):
    story.append(Paragraph(text,styles[style])); manuscript.append(re.sub('<[^>]*>','',text))
def h(text): p(text,'H2X')
def bullets(items):
    for item in items:p('• '+item)
def table(headers,rows,widths=None):
    data=[[Paragraph('<b>'+escape(str(x))+'</b>',styles['CellX']) for x in headers]]
    data += [[Paragraph(escape(str(x)),styles['CellX']) for x in row] for row in rows]
    t=Table(data,colWidths=widths or [174*mm/len(headers)]*len(headers),repeatRows=1,hAlign='LEFT')
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),cream),('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7),('LINEBELOW',(0,0),(-1,0),1,rust),('LINEBELOW',(0,1),(-1,-1),.3,colors.HexColor('#D8CCBB')),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#FAF7F1')])]))
    story.append(t);story.append(Spacer(1,10));manuscript.extend([' | '.join(map(str,headers))]+[' | '.join(map(str,row)) for row in rows])
def page(title,tag='ACTION PLAN'):
    if story:story.append(PageBreak())
    sections.append(title);manuscript.append('\n## '+title);p('BROSKI / '+tag,'TinyX');p(title,'H1X')
def note(text):p('<b>Decision gate:</b> '+text)

page('Treats for your best bro.','INDIA LAUNCH BLUEPRINT')
p('A practical business launch<br/>within <b>₹2,00,000</b>','TitleX')
p('Manufacturing • Packaging • Compliance • Pricing<br/>Fulfilment • Marketing • Website • Cash control')
asset=Path(r'D:\CHATGPT AI TEAM\dog biscuit website\public\broski-products.png')
if asset.exists():story.append(Image(str(asset),width=174*mm,height=116*mm))
story.append(Spacer(1,14))
p('<b>Prepared 1 October 2026.</b> Research checked 30 September–1 October 2026. India-focused; operating city not yet supplied. Founder time assumed 10 hours/week, based on the earlier brief.')
p('Recommended route: one outsourced 200 g biscuit recipe; 500 accepted sealed packs; a narrowly serviceable prepaid pilot. A working website and generated branding exist. The physical product, supplier approval and live commerce are still to be established.')
p('Generated packaging above is concept artwork. Prices, demand, delivery costs and timing are planning assumptions unless identified as a published benchmark. This document does not place supplier orders or certify legal clearance.','TinyX')

page('01 / Your launch decision','EXECUTIVE BRIEF')
h('Start small enough to learn, safely enough to sell')
p('Choose an existing manufacturer formulation with documented safety and stability, and have the factory fill and seal stock pouches. Launch one recipe and one pack size. Position Broski around companionship and enjoyable everyday rituals; make specific ingredient or nutritional claims only when supported.')
table(['Commitment','Working decision'],[['Capital ceiling','₹2,00,000 gross cash; no extra owner funding assumed'],['Inventory','500 × 200 g accepted finished packs; target ₹85 landed/pack'],['Saleable stock','450 packs initially; 50 reserved for QA, evaluation, sampling/replacements'],['Offers to test','₹249 single + ₹59 freight; ₹449 two-pack; ₹649 three-pack delivered on approved lanes'],['Sales channel','Broski website + direct local discovery; prepaid-first'],['Timing','6–8 weeks conditionally; longer if stability, supplier or compliance evidence is missing'],['Protected reserve','₹30,000; do not spend it on a second SKU or cosmetic packaging']],[48*mm,126*mm])
h('First milestone')
p('Get one acceptable written manufacturing quote, one viable packaging specification, a qualified QA protocol and a signed-off label. Collect real customer willingness-to-pay evidence before purchasing inventory. A live-looking website alone is not a product launch.')
note('No production deposit until recipe, pack, safety evidence, economics and legal applicability are approved. If the pilot MOQ or evidence costs cannot fit, reduce the run or delay it.')

page('02 / Scope and business model','STRATEGY')
table(['Route','Assessment under this budget'],[['Contract-made existing recipe','Recommended. Lower equipment spend; supplier MOQ and documentation remain risks.'],['Own kitchen / small factory','Not the base plan. Fit-out, process control, labour, premises permissions and testing can consume the budget.'],['Bulk purchase + home repacking','Avoid as a shortcut. Repacking adds handling, traceability, sealing and regulatory responsibilities.'],['Finished-product resale','Possible fallback only with written private-label rights, valid evidence and actual margins. No relabeling without permission.']],[54*mm,120*mm])
h('Customer hypothesis')
p('First segment: dog parents reachable in one city who buy small rewards for walks and training, value clear ingredient information and will pay for convenient bundles. Target behaviour before age or income stereotypes: recent treat buyers, willingness to read labels, and a reachable local pet community.')
h('A realistic differentiation')
bullets(['Clear, honest pack information and consistent lot quality; publish actual product images alongside approved ingredient and feeding details.','Warm, memorable Broski branding plus responsive service. These are execution advantages, not a durable manufacturing moat.','One easy bundle decision rather than six unvalidated flavours. Delay subscriptions, marketplaces and specialist health claims until repeat demand is measured.'])
p('Name availability has not been cleared. Search Broski and confusingly similar names before printing; keep an alternate name ready. Packaging changes become expensive after a large order.')

page('03 / The ₹2 lakh cash envelope','CAPITAL CONTROL')
budget=[('Samples, discovery and sample courier',12000),('Qualified formulation review + lab/QA',22000),('Accounting, classification, label/legal review',15000),('Artwork and actual product photography',10000),('Store, domain/hosting and payment setup',8000),('Scoped part-time pilot operations help',10000),('500 accepted packs × ₹85 landed',42500),('Outbound courier working float',22500),('Outer shipping material allowance',4500),('Payment fee allowance',3500),('Damage/refund/replacement allowance',5000),('Acquisition experiments',15000),('Uncommitted contingency',30000)]
assert sum(v for _,v in budget)==200000
table(['Allocation','Cash cap'],[(k,f'₹{v:,.0f}') for k,v in budget]+[('TOTAL','₹2,00,000')],[133*mm,41*mm])
p('All amounts are gross cash ceilings including applicable vendor taxes. Supplier quotes are not secured. The ₹42,500 stock line already includes primary pouches, labels, factory packing and inward freight/tax assumptions; do not add them again. Outer ecommerce cartons are a separate cost.')
p('Setup/operations caps total ₹77,000. Variable fulfilment/fee/loss float totals ₹35,500. An allowance is not an instruction to spend it all. The ₹8,000 technical cap requires a scoped quote using existing assets or a managed checkout fallback; custom production engineering may cost more.')

page('04 / Price and unit economics','ASSUMPTIONS, NOT A FORECAST')
p('Prices below are test hypotheses and supersede neither actual supplier quotes nor tax advice. Model a registered seller with 18% output GST included in gross collection and no usable input credit, pending current classification confirmation. The final tax position must be checked before invoicing.')
offers=[(1,249,59,65),(2,449,0,75),(3,649,0,85)]
rows=[]
for n,price,shipcharge,shipcost in offers:
    gross=price+shipcharge; net=gross/1.18; cogs=n*85; fee=gross*.0236; contrib=net-cogs-shipcost-18-fee-15
    rows.append([f'{n} pack(s)',f'₹{gross:.2f}',f'₹{net:.2f}',f'₹{cogs:.2f}',f'₹{shipcost:.2f}',f'₹{contrib:.2f}'])
table(['Offer','Collection','Net tax scenario','Landed stock','Courier','Pre-ad contribution'],rows,[24*mm,29*mm,33*mm,29*mm,25*mm,34*mm])
p('Every order also includes ₹18 outer packing, 2.36% payment fee on gross collection, and ₹15 expected loss allowance. Razorpay publishes a standard 2% platform fee plus 18% GST on the fee [S1]. Courier ₹65/75/85 are planning placeholders, not quotes. Weigh the fully packed parcels; two packs may exceed the 500 g slab.')
h('Choose a margin rule')
p('The single-pack offer contributes only about ₹70.75 before acquisition. At ₹80 acquisition spend/order it loses money. Lead paid experiments with bundles; use single packs mainly for organic/local trials. Do not stack WELCOME10 onto these prices without recalculating the margin.')
note('Prefer observed blended acquisition spend ≤₹60/order and positive delivered-order contribution. Treat ₹108.61 blended pre-ad contribution as a zero-margin ceiling, not a safe CAC target. No invented lifetime value.')

page('05 / 90-day scenarios and cash','STOCK-CONSTRAINED')
p('Illustrations start at project kickoff, so a 6–8 week preparation period leaves roughly 5–7 selling weeks. Mix: 20% single, 50% two-pack, 30% three-pack. This gives 2.1 packs/order and ₹480.80 gross collection/order. All illustrated orders are delivered, prepaid and settled; no reorder is counted.')
p('Acquisition assumptions per delivered order: slow ₹120; working ₹80; strong ₹55. Contribution = collection ÷ 1.18 − landed packs − courier − ₹18 outer packing − 2.36% of collection − ₹15 loss allowance − acquisition spend.')
cases=[('Slow',40,120),('Working',100,80),('Strong',200,55)]
weighted=sum((.2,.5,.3)[i]*(r[1]+r[2]) for i,r in enumerate(offers))
pre=weighted/1.18-2.1*85-76-18-weighted*.0236-15
rows=[]
for title,orders,cac in cases:
    gross=orders*weighted; con=orders*(pre-cac); result=con-77000-4250
    cash=200000-77000-42500+gross/1.18-orders*(76+18+weighted*.0236+15+cac)
    rows.append([title,orders,int(orders*2.1),f'₹{gross:,.0f}',f'₹{con:,.0f}',f'₹{result:,.0f}',f'₹{cash:,.0f}'])
table(['Case','Orders','Packs sold','Gross receipts','After ad contribution','Operating result','Cash remaining'],rows,[21*mm,15*mm,20*mm,29*mm,29*mm,30*mm,30*mm])
p('Operating result deducts ₹77,000 setup/operations and conservatively expenses all 50 reserved packs (₹4,250). Some retained/replacement packs may remain inventory in actual accounting. Founder labour and income tax are excluded. These are startup losses, not profit projections.')
p('Cash remaining is after the full 500-pack purchase, setup/ops, modeled fulfilment, acquisition and tax/loss reserves. It includes protected contingency and stock remains separately; it is not free profit. Replace reserve assumptions with actual invoices/events, rather than double-counting them.')
h('Stress test')
p('A 15% stock-cost increase cuts blended contribution by ₹26.78/order; ₹20 extra freight cuts it by ₹20. Combined, pre-ad contribution falls to ₹61.84. At ₹80 acquisition cost that loses ₹18.16/order. Stop or reprice; do not increase ad spend to chase revenue.')
note('At ₹60 acquisition, about ₹48.61 contribution/order remains; recovering ₹81,250 illustrative setup/sample expense would take roughly 1,672 comparable orders, requiring additional funded stock. Pilot success is evidence, not startup-cost recovery.')

page('06 / Manufacturing shortlist','REQUEST QUOTES FIRST')
table(['Candidate','Evidence and fit','Next question'],[['B&K Products / B&K Nutrifeeds, Thane','Official site lists biscuit OEM categories. Direct biscuit match [S4].','Will it supply 500 accepted 200 g domestic packs? Price, MOQ and lead time unpublished.'],['Furry Feast','Private-label dehydrated treats; site advertises from 5 kg/SKU [S5]. Adjacent category.','Biscuit capability unconfirmed. Resolve 15-day banner vs 3–5 week FAQ and exact MOQ.'],['Al Moin Exports, Hapur','Official OEM/private-label meat treats [S6]. Adjacent category, export-oriented.','Domestic startup supply and biscuit capability unconfirmed. Do not apply its offer to biscuit economics.']],[41*mm,69*mm,64*mm])
p('No supplier has been approved or contacted. Only B&K is a direct biscuit lead supported by the reviewed site. If it declines, seek additional biscuit OEM quotes; do not quietly substitute meat-treat pricing. No numerical pilot manufacturing quote has been verified.')
h('The brief to send')
bullets(['One existing validated biscuit formulation; complementary reward, not an assumed complete diet. Qualified specialist reviews ingredient, allergy, age and feeding suitability.','500 accepted sealed 200 g packs. Nominal fill is 100 kg; process loss, overfill and retained samples mean 100 kg bulk input does not guarantee 500 usable packs.','Factory packs, seals and lot-codes approved barrier pouches. Target ₹75–95 landed/accepted pack includes product, primary packaging, labels, packing, master cartons, inward freight and nonrecoverable tax.'])
note('If landed cost exceeds ₹95 or MOQ requires unaffordable stock, request a smaller viable run or change the plan. Keep QA and reserve protected.')

page('07 / Supplier RFQ and selection','PURCHASE CONTROL')
p('<b>Subject:</b> Broski India pilot — 500 × 200 g dog biscuit packs, existing validated formulation')
p('We are evaluating a domestic manufacturing partner. Please quote one biscuit SKU using an existing formulation with safety/stability evidence, packed at your facility in approved stock barrier pouches with our labels. This enquiry is not an order.')
table(['Ask for','Why it matters'],[['Identity and scope','Legal entity, plant address, bank beneficiary, domestic supply authority and applicable certificates/permissions.'],['Itemized quote','Recipe, pouch, paired labels, filling/sealing/coding, cartons, taxes, inward freight to our PIN, testing exclusions.'],['Quantity','Sample MOQ, production MOQ, 500 accepted packs, rejects/wastage/retained sample allowances, actual net fill.'],['QA evidence','Recipe revision, process controls, ingredient/lot traceability, recent COA, stability in exact final pack, audit access.'],['Timing','Sample, proof, production and evidence lead times; quote validity; realistic dispatch date.'],['Commercial terms','Deposit, balance, change control, defect replacement, recall cooperation, recipe/brand rights.']],[43*mm,131*mm])
p('Score quotes only after identity and documentation pass: QA/evidence 35%, total landed economics 25%, recipe/pack fit 15%, startup MOQ 10%, reliability/timing 10%, commercial terms 5%. A critical QA failure is disqualifying regardless of score.')
note('Proposed deposit/balance terms are negotiation requests, not accepted policies. Never pay a personal beneficiary unrelated to the verified contracting entity. Compare GST and freight on the same basis.')

page('08 / Safe product release','QA AND SHELF LIFE')
p('Do not formulate by copying internet recipes. Use a qualified pet-food technologist and a veterinarian with relevant nutrition expertise to assess the manufacturer’s formulation and intended use. Budget ₹22,000 for the agreed review/testing scope; secure quotes before assuming that scope fits.')
table(['Gate','Required evidence'],[['Recipe and process','Signed formulation revision, ingredient traceability, allergen controls, relevant heat/process validation and change-control records.'],['Testing protocol','Qualified lab specifies microbiological, chemical, moisture/water-activity and ingredient-dependent contaminants; methods and acceptance limits agreed in writing.'],['Shelf-life evidence','Exact recipe + exact final pouch + storage conditions. Existing validated evidence can support review; a new formulation may need longer studies.'],['Factory batch','Lot COA, production date, approved coding, count/weight checks, sealed packs and manufacturing records.'],['Receipt and release','No pests, mould, rancid smell, wrong labels, broken seals or untraceable lots. Quarantine failures; retain agreed samples.']],[40*mm,134*mm])
p('TÜV SÜD India describes pet-food/animal-feed shelf-life work [S9]; it is a laboratory lead, not a booked service or price quote. Verify the actual lab’s accreditation scope for the commissioned methods. Specialists define acceptance thresholds; this plan does not invent universal limits.')
h('Complaints and withdrawal')
p('For suspected contamination, illness, foreign matter or a serious seal failure: stop selling the affected lot, preserve evidence, contact the manufacturer/specialist, trace buyers and record advice/actions. Withdraw or recall as directed. Do not diagnose an animal or dismiss a safety complaint as a refund issue.')
note('Do not print a 6- or 12-month shelf life by borrowing a competitor date. Failed evidence moves the launch date; it does not reduce the test scope.')

page('09 / Packaging and print plan','LOW MOQ, VERIFIED BARRIER')
p('Use a stock opaque or metallized stand-up pouch with zipper and heat seal, plus digitally printed front/back labels. The zipper supports reclosure; it is not the unopened safety seal. The manufacturer should pack at its assessed facility.')
table(['Component','Specification / budget approach'],[['Retail pouch','Fit test 200 g of actual biscuits, including headspace and seal clearance. Request material structure, food-contact/migration documentation, thickness, OTR/WVTR and seal parameters.'],['Published benchmark','Restokart silver/clear 5 × 8.25 in pouch: ₹3.74/unit, pack 100 [S7]. 500 = ₹1,870 before unshown tax/freight. Its clear face is not automatically suitable for shelf life.'],['Front/back labels','HelloPrints search-indexed result advertises MOQ 100 [S8]; direct-page terms and current MOQ need confirmation. ₹4–8/paired labels is an RFQ assumption, not a verified price. Allow proof and agreed wastage.'],['Factory economics','Planning components within ₹75–95 landed: pouch ₹5–8, paired labels ₹4–8, product/packing ₹55–65, inward/carton/tax allowance ₹11–14. Remove included duplicates.'],['Dispatch pack','Protect biscuits against crushing. Packed dimensions/weight determine courier slab. ₹18/order modeled for outer material.']],[40*mm,134*mm])
p('Buy sample pouches before artwork. Ask factory to price about 550 pouches and label pairs if its wastage plan requires it; that is packaging quantity, not 550 purchased finished retail packs. Avoid custom printed-film cylinders and multi-thousand pouch MOQs initially.')
h('Print proof gate')
p('Approve actual dimensions, colour, readability, barcode if used, batch window and mandatory declaration sizes with the reviewer. Keep a signed physical proof. Generated Broski pack images guide visual direction; they are not print-ready compliant files or proof of recyclability.')

page('10 / Label and compliance checklist','CONFIRM BEFORE PRINTING')
p('The Food Safety and Standards Act defines food for human consumption and excludes animal feed [S10]. A human-food FSSAI licence is therefore not a default answer for dog treats. Confirm the actual pet-treat business, plant and local requirements with competent professionals/authorities.')
table(['Workstream','Action before launch'],[['State/local operation','Identify city, storage/packing roles and supplier premises; confirm applicable trade, establishment, manufacturing/animal-feed and other permissions.'],['BIS','IS 11968:2019 is a pet-food standard [S11]. Confirm scope for complementary biscuits and whether any applicable mandatory order/certification exists; do not self-claim certified status.'],['Legal Metrology','Reviewer confirms manufacturer/packer responsibility and registration, net quantity, MRP inclusive of taxes, identity/address, consumer care, dates and applicable unit-price/ecommerce declarations [S12].'],['GST','CA confirms current HSN, rate, registration, interstate/ecommerce position, input credit and shipping invoicing. This model’s 18% remains provisional: the historical CBIC FAQ was found, but current amended notifications were not fully reconciled [S18–S19].'],['Plastic packaging','Map Brand Owner vs Producer/Importer status. CPCB FAQ discusses micro/small Brand Owner EPR relief, not a universal exemption for every MSME role [S13].'],['Brand/IP','Search and clear name before artwork. Eligible trademark e-filing government fee published at ₹4,500 per class/application [S14]; professional/search fees extra. Udyam registration is free [S3].']],[39*mm,135*mm])
p('Back label: approved ingredients/allergens; substantiated analytical/use/feeding/storage information; manufacturer/packer and marketer details; consumer care; traceable lot; manufacture/packing and justified best-before information; approved MRP and applicable declarations. Front: accurate name, dog-treat use, net 200 g, brand. A final legal label review is required.')
note('Do not print therapeutic, complete-and-balanced, hypoallergenic, dental or “vet approved” claims, certification marks or generated endorsements without substantiation and permission.')

page('11 / Your eight-week critical path','DEPENDENCY-BASED TIMELINE')
table(['Window','Outcome and owner','Release condition'],[['Week 1','Founder: start buyer interviews, three RFQs, city/channel choice, name search, initial CA scope.','Comparable quotes and evidence checklist; no stock deposit.'],['Weeks2–3','Founder completes 20 interviews; manufacturer + specialist: samples, recipe review, pouch fit/transit test, lab scope and label requirements.','Spend within ₹12k sample + ₹22k QA + ₹15k review caps; pause if scope cannot fit.'],['Weeks3–4','Founder: approve recipe/spec/print proof and select vendor; tech contractor finalizes real checkout scope.','Signed agreement, cost model viable, supporting stability evidence and label approval.'],['Weeks4–6','Manufacturer produces accepted pack target; founder prepares real content, partner sampling and fulfilment SOP.','Payment milestone tied to documented progress/accepted scope.'],['Weeks6–8','Specialist/founder: receive, quarantine/check, release stock; provider sandbox, refund and courier tests.','QA release, permissions/label done, actual parcel rates and customer-service contacts.'],['Weeks8–13','Founder/helper: limited paid pilot, delivered-order economics and genuine feedback.','Release ads in ≤₹3k tranches; expand only with positive economics.']],[24*mm,94*mm,56*mm])
p('Dates are estimates, not booked supplier promises. New recipe/pack stability evidence may extend the timeline substantially. Today’s launch activity can be customer discovery and a truthful waitlist; paid sales begin only after the release gates pass.')
h('Budget release discipline')
p('Discovery/QA/review caps total ₹49,000. Inventory/creative/store caps total ₹60,500. Help and variable float are released as operations need them. Contingency stays separate. Track committed, paid and remaining amounts weekly; a deposit is still committed cash.')

page('12 / Customer validation and sales','FIRST 20 CONVERSATIONS')
p('Before production, interview 20 recent treat buyers in your reachable city. Ask what they actually bought, price/pack weight, frequency, delivery friction, rejected products and label concerns. Show sample visual concepts as concepts and the proposed prices; do not claim a manufactured product already exists.')
table(['Question','Record'],[['Last treat purchase?','Brand, weight, actual amount paid, channel/date.'],['What made you choose it?','Ingredient clarity, habit, dog acceptance, convenience, recommendation.'],['What would stop you buying Broski?','Price, unknown brand, quality proof, recipe suitability, delivery charge.'],['₹249 + freight / ₹449 two / ₹649 three?','Chosen offer and reason; preference is not an order.'],['Would you trial after approved samples?','Consent and contact preference; no unsupported outcome promises.']],[67*mm,107*mm])
p('Working validation gate: at least eight interviewees show credible trial intent at the proposed economics, and at least two relevant local groomer/pet-store partners accept a structured small trial discussion. These are planning thresholds, not proof of product-market fit; record evidence and objections.')
h('Pilot channels')
bullets(['Use one direct storefront and consensual local community discovery. Ask permission before posting in pet groups.','Partner samples come from the 50-pack reserve; obtain owner consent and specialist-approved use guidance. Keep lot records.','Delay marketplaces until channel fees, paperwork, reviews and stock replenishment are affordable. No paid fake reviews or bulk unsolicited messages.'])

page('13 / Marketing that fits the budget','₹15,000 EXPERIMENT CAP')
table(['Work','Execution','Measure'],[['Founder content','Real batch photos, pack details, dog-parent rituals, founder story. Generated art can be mood imagery, not real stock proof.','Useful replies, qualified clicks, consenting trial leads.'],['Local partnerships','3–5 groomers/pet stores/community hosts; short agreed sample pilot and customer feedback.','Delivered first orders and actual partner cost.'],['Small paid tests','Initial ≤₹3,000, mainly bundles, approved serviceable geography. Test2 creatives before more spend.','Delivered-order contribution after spend, not only clicks/ROAS.'],['Retention','Opt-in reorder reminder at a realistic consumption interval; easy unsubscribe and direct support.','Measured second purchases by cohort, not assumed LTV.']],[35*mm,94*mm,45*mm])
p('Stop paid tests if delivered-order contribution turns negative, quality complaints emerge or cash commitments threaten the reserve. A low click cost does not offset poor conversion, freight or returns. Track spend / all delivered orders as blended acquisition cost; calculate new-customer CAC separately when repeat orders appear.')
h('Message structure')
p('Hook: “For the friend who makes every day better.” Proof: real product, clear ingredients and qualified supported feeding information. Offer: verified price/weight/delivery. CTA: “Choose your little ritual.” No invented customer totals, medical promises or “best in India” assertions.')
h('Review collection')
p('Invite genuine feedback after confirmed delivery. Ask permission before publishing name/photo. Disclose gifted samples/incentives and never make them conditional on a positive review. Replace the website’s sample diaries with authentic feedback or remove the section before treating it as social proof.')

page('14 / 30-day content and activity calendar','AROUND THE APPROVED LAUNCH')
p('Run this after sale-ready stock and checkout are verified. Use Instagram/Reels plus the website; repost selectively. Publishing time is a test: compare lunchtime vs evening from your own audience analytics rather than promising a universal optimal time.')
table(['Days','Posts / activity','Purpose'],[['1–3','Founder introduction; actual 200 g pack unboxing; approved ingredient explainers.','Explain product truth and offer.'],['4–6','“Walk, wag, little reward” Reel; how to reseal/store; answer a real FAQ.','Useful content and routine.'],['7','Live Q&A / short founder answers; week 1 metrics review.','Discover objections; change weak copy.'],['8–10','Behind-the-scenes factory-approved footage; bundle comparison; customer question thread.','Process evidence and easy choice.'],['11–13','Partner trial story with disclosure; packaging demo; real dog-parent routine (consent).','Trust without fabricated claims.'],['14','Review spend, delivered margin and support issues; pause failing creative.','Capital protection.'],['15–18','Three genuine feedback themes; customer-permitted photo; “What’s your little ritual?” poll.','Learn and retain.'],['19–21','Dispatch promise explainer; feeding FAQ approved by specialist; bundle creative B.','Reduce checkout doubts.'],['22–25','Founder lessons; label walkthrough; reorder reminder to consenting buyers; community reply day.','Repeat behaviour and service.'],['26–30','Pilot recap with actual numbers; remaining stock; questions; next month decision.','Transparent progress and cash gate.']],[20*mm,111*mm,43*mm])
p('Time-capped cadence: two useful posts/week, including one short video from the same shoot, within the founder’s one-hour content allowance. Support uses its separate founder/helper allocation. Reduce cadence if fulfilment needs the time. Capture actual stock/delivery facts; do not simulate popularity or scarcity.')

page('15 / Fulfilment and founder workload','10 HOURS/WEEK ASSUMPTION')
table(['Founder activity','Weekly time'],[['Supplier, QA and product issues','2h'],['Customer discovery/acquisition','3h'],['Content and offer approval','1h'],['Cash, settlements and tax reserve','1h'],['Customer exceptions','1h'],['Helper coordination and dispatch audit','1h'],['Buffer','1h']],[130*mm,44*mm])
p('₹10,000 helper allowance is a scoped pilot contractor budget, not a guaranteed full-time salary. Obtain a quote for packing labels, dispatch and routine support; manufacturer, accountant and specialist retain their roles. At 200 orders over 5–7 selling weeks, expect roughly 29–40 orders/week and check that capacity fits.')
h('Daily operating sequence')
bullets(['Reconcile paid orders to gateway settlement and stock; reject/resolve unsupported PIN codes before accepting an order.','Pick by earliest expiry; record lot per order. Inspect seal/condition, pack against breakage, weigh parcel and create courier label.','Send truthful dispatch/tracking information; monitor failed attempts and customer exceptions. Publish a realistic dispatch promise, not assumed next-day shipping.','Log complaints, returns, damage and replacements by lot. Keep minimal customer data, restricted access and retention policy.'])
p('Use a shared stock ledger with date, batch, best-before, opening stock, receipt, sold, QA/sample use, damage, returns, replacement and closing stock. Founder checks physical inventory weekly. Use prepaid pilot orders to limit COD fees and RTO exposure.')

page('16 / Website and payment launch gate','TURN THE PREVIEW INTO COMMERCE')
p('The saved Broski site currently has generated branding, motion, catalog, cart and demo checkout. Its demo API deliberately does not retain fulfilment contact details and does not collect money. Those choices must change through a scoped production implementation before real orders can be fulfilled.')
table(['Gate','Required completion'],[['Catalog truth','One approved SKU initially; actual photos, final ingredients/weights/price and qualified feeding/storage information. Hide undeveloped flavours.'],['Seller and policies','Real legal/seller identity, email/phone, serviceable locations, shipping, cancellation/refund, privacy and grievance/support details reviewed for applicability.'],['Payment','Provider onboarding; server-created amount; signed webhook verification; idempotency; paid/pending/failed/refunded states. Never dispatch from a browser success redirect alone.'],['Customer/order storage','Secure persistent minimum fulfilment data, access controls, backups, lot tracking and approved privacy/retention handling.'],['Delivery','Actual PIN/rate/weight rules, stock availability and truthful dispatch estimates.'],['Verification','Sandbox payment/failure/refund tests; controlled real order; mobile cart/forms, accessibility/reduced motion, shipping errors and no duplicate orders.']],[35*mm,139*mm])
p('Use a fixed quote within the ₹8,000 technical cap. If the custom site cannot be safely completed within scope, use a reputable managed checkout/order tool after assessment and keep the site as the brand front. Subscription fees and staff handling still count against the cap; do not deploy insecure order collection to save money.')
note('Generated artwork and sample reviews must be identified appropriately. Business details and payment setup were deferred in the website task; this plan does not assume they are complete.')

page('17 / Risk register and stop rules','PROTECT THE RESERVE')
table(['Risk','Trigger','Response'],[['Supplier MOQ/cost','No viable 500-pack quote or landed cost >₹95','Reduce scope/run; reprice; defer. No uncontrolled equipment spend.'],['Shelf-life / QA','Evidence missing, failed test, seal/contamination issue','Quarantine/stop release; specialist review. No date shortcut.'],['Poor economics','Actual delivered margin negative after acquisition','Pause ads; revise bundle/freight/pricing or stop.'],['Freight surprise','Packed slab/route cost above allowance','Narrow lanes; charge freight or reject route before payment.'],['Stock ageing','Slow sell-through vs supported expiry','Stop reorder; adjust ethical sampling/channel plan within safe dates.'],['Label/legal ambiguity','Authority/professional cannot confirm required route','Resolve before print/sale; revise timeline.'],['Brand/IP','Confusingly similar name or challenged rights','Change before print; keep alternate ready.'],['Cash tied up','Tax/refund/payables consume operating balance','Hold contingency; spend by milestone; no gross receipt-funded assumptions.']],[32*mm,61*mm,81*mm])
h('Reorder conditions')
p('Known actual landed/freight costs; quality complaints resolved; genuine repeat-buy evidence; stock/expiry reconciled; cash forecast covers supplier, tax and refunds while preserving ₹30,000. Another hypothetical 500-pack batch costs ₹42,500 and is not included in the pilot scenarios. Reduce MOQ if commercially possible or stop at pilot completion.')
p('Return/refund rules must reflect actual law and seller policy. For damaged/wrong/unsafe goods, handle evidence and resolution fairly; do not invent a blanket “no returns” rule for cost control.')

page('18 / Your next seven days','EXECUTION CHECKLIST')
table(['Day','Action','Output'],[['1','Choose operating city, available storage and owner role; create cash ledger.','One-page assumptions + committed/paid budget.'],['2','Search name/rights; request professional local classification/label scope.','Review quote and questions; alternate brand name.'],['3','Send three manufacturer RFQs; compare local packaging/sample providers.','Itemized written quotes; no PO yet.'],['4','Start 3–4 short buyer interviews; record last purchase and bundle objections.','Evidence notes, no invented demand.'],['5','Continue interviews across weeks 1–3; approach 2 local partners for a disclosed future trial.','Trial interest and practical channel costs.'],['6','Compare samples/QA/lab protocol and test packed shipping weight assumptions.','Specific sample/testing plan within caps.'],['7','Review economics, evidence and quotes; decide proceed/pause/smaller pilot.','Signed decision; release only approved next tranche.']],[16*mm,104*mm,54*mm])
h('Before the first commercial shipment')
bullets(['Approved product, batch release, supported shelf-life and exact print proof.','Seller/local/tax/packaging roles resolved; actual business contacts and policies published.','Accepted stock, lot tracking, real checkout and paid-order reconciliation working.','Actual courier serviceability, parcel weight/rates and customer-support procedure.','Marketing facts checked; real reviews/consent only; reserve remains ring-fenced.'])
p('Success criterion for the pilot: safe and reliably delivered stock, clear actual economics, genuine customer feedback and a funded next decision. A polished brand is the starting asset; disciplined product release and cash control make it a business.')

sources=[
('S1','Razorpay published payment pricing','https://razorpay.com/pricing/'),
('S2','Shiprocket rate calculator — lane/weight-specific quoting','https://www.shiprocket.in/shipping-rate-calculator/'),
('S3','Government Udyam portal — free registration','https://udyamregistration.gov.in/'),
('S4','B&K biscuit OEM range and contact','https://www.bnkproducts.com/dog-biscuits/'),
('S5','Furry Feast private-label page','https://furryfeast.co.in/pages/start-your-own-brand'),
('S6','Al Moin OEM/private-label service','https://almoinexports.com/b2b/private-label-dog-treats'),
('S7','Restokart pouch benchmark','https://www.restokart.com/product/5x825-inches-silver-standup-zipper-pouch/660'),
('S8','HelloPrints product labels','https://www.helloprints.in/product?id=product-labels'),
('S9','TÜV SÜD shelf-life testing','https://www.tuvsud.com/en-in/industries/consumer-products-and-retail/food/shelf-life-testing'),
('S10','FSSAI official manual — statutory food definition','https://fssai.gov.in/upload/knowledge_hub/16230060e42ededcc7dFSO_Manual_05_07_2021_.pdf'),
('S11','BIS committee programme — pet-food standard','https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/pow_new/Pow/download_pow_pdf_dept_commtt/61/276/'),
('S12','Department of Consumer Affairs Legal Metrology','https://doca.gov.in/lm-ebook/wp-content/uploads/2024/12/FInal-Book-Legal-Metrology-with-amendments.pdf'),
('S13','CPCB plastic packaging EPR FAQ','https://eprplastic.cpcb.gov.in/plastic/downloads/FAQs.pdf'),
('S14','IP India trademark fees','https://ipindia.gov.in/pages/trade-marks/learn/forms-and-official-fees'),
]
page('19 / Market price context','OFFICIAL STORE BENCHMARKS')
p('Accessed 30 September–1 October 2026. Formula and positioning differ; these are retail price context, not proof of equivalent quality, demand or wholesale margins.')
table(['Product','Pack / displayed price','Price per 100 g / caveat'],[['HUFT Goat Milk Cookies — Blueberry [S15]','200 g / ₹299','₹149.50; shipping extra as applicable.'],['Dogsee Gigabites Carrot Cookies [S16]','300 g / ₹199','₹66.33; no stock displayed during review.'],['Mother of Strays All New Dog Biscuits [S17]','Entry 400 g option / ₹299','₹74.75 indicative; sold out. Recheck selected variant.'],['Broski single-pack hypothesis','200 g / ₹249 + ₹59 freight','₹124.50 product-only; ₹308 collected including delivery.'],['Broski bundle hypotheses','400 g / ₹449; 600 g / ₹649','₹112.25 / ₹108.17 per 100 g, delivered on approved lanes.']],[70*mm,50*mm,54*mm])
h('Test the complete delivered price')
p('The earlier website concept of ₹349/200 g is about 17% above the HUFT benchmark. This plan tests ₹249 singles and bundles instead; neither price is validated customer willingness to pay. Update the website and approved printed MRP only after quotes, tax review and customer evidence align.')
p('Compete through clear product information, consistent quality, useful pack size and responsive service. Do not infer competitor product faults from price or claim Broski is healthier without substantiation. Log actual objections from the 20 interviews and address the recurring ones.')
note('No competitor stock, price or promotion is guaranteed. Recheck at the pricing decision; compare delivered prices and fees on the same basis.')

page('20 / Sources and verification','PRIMARY SOURCES + OPEN ITEMS')
p('Sources were reviewed for the specific points noted; supplier marketing claims are not independent validation. Exact tax and local permit applicability remain professional confirmation items. Live prices, availability and terms can change.')
for code,title,url in sources[:9]:p(f'<b>{code}</b> — {escape(title)}<br/><link href="{escape(url)}" color="#A95030">{escape(url)}</link>','TinyX')
page('21 / Compliance and market sources','REFERENCE LINKS')
for code,title,url in sources[9:]:p(f'<b>{code}</b> — {escape(title)}<br/><link href="{escape(url)}" color="#A95030">{escape(url)}</link>','TinyX')
extra=[('S15','HUFT official product','https://headsupfortails.com/products/blueberries-goat-milk-dog-cookies'),('S16','Dogsee official product','https://dogseechew.in/product/dogsee-gigabites-carrot-cookies-for-dogs'),('S17','Mother of Strays official product','https://motherofstrays.in/products/chicken-biscuits'),('S18','CBIC historical GST rate FAQ; latest notification unresolved','https://cbic-gst.gov.in/gst-rates-faq.html'),('S19','Current CBIC tax portal','https://taxinformation.cbic.gov.in/')]
for code,title,url in extra:p(f'<b>{code}</b> — {escape(title)}<br/><link href="{escape(url)}" color="#A95030">{escape(url)}</link>','TinyX')
p('Detailed research notes are saved beside this PDF: manufacturing-packaging.md, finance-ops.md and compliance-pricing.md. They include supplier caveats, legal source detail and competitor price benchmarks. The generation script and editable plan text are also retained.','TinyX')
p('Team roles: manufacturing/packaging research; compliance/competitive pricing; finance/operations; integration and document production. No supplier outreach, order, payment, advertisement or public deployment was executed.','TinyX')

def footer(canvas,doc):
    canvas.saveState();w,h=doc.pagesize
    canvas.setStrokeColor(colors.HexColor('#D7C8B6'));canvas.line(18*mm,17*mm,w-18*mm,17*mm)
    canvas.setFont('Arial',7.5);canvas.setFillColor(ink)
    canvas.drawString(18*mm,12*mm,'BROSKI • INDIA LAUNCH PLAN • ₹2,00,000 CAP')
    canvas.drawRightString(w-18*mm,12*mm,f'{doc.page}')
    canvas.restoreState()
doc=SimpleDocTemplate(str(OUT),pagesize=(210*mm,297*mm),rightMargin=18*mm,leftMargin=18*mm,topMargin=18*mm,bottomMargin=24*mm,title='Broski India launch plan under ₹2 lakh',author='ATLAS / Broski planning team')
doc.build(story,onFirstPage=footer,onLaterPages=footer)
(ROOT/'Broski_Launch_Plan_Editable.md').write_text('\n\n'.join(manuscript),encoding='utf8')
(ROOT/'financial_model.json').write_text(json.dumps({'budget':dict(budget),'budget_total':sum(v for _,v in budget),'tax_assumption':.18,'gateway_gross_rate':.0236,'landed_pack_cost':85,'blended_order_gross':weighted,'blended_pre_acquisition_contribution':pre,'scenarios':rows},indent=2),encoding='utf8')
print(OUT)
