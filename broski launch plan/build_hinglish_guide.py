from pathlib import Path
import json
ROOT=Path(__file__).parent
source=(ROOT/'build_council_report.py').read_text(encoding='utf-8-sig').split("section('Council review + NCR sourcing')")[0]
ns={'__file__':str(ROOT/'build_council_report.py')};exec(source,ns)
p=ns['p'];section=ns['section'];table=ns['table'];inline=ns['inline'];mm=ns['mm']
OUT=ROOT/'Broski_NCR_Manufacturer_Questions_Hinglish.pdf'
editable=[]
def text(s,style='BroBody'):p(inline(s),style);editable.append(s)
def title(s):section(s);editable.append('\n## '+s)

title('Manufacturer call guide — Hinglish')
text('Broski ke liye sahi supplier kaise choose karein','BroTitle')
text('West Delhi se launch | Manufacturer contacts | White label | Packaging | Quality | Price | Payment | 56 detailed questions')
text('Yeh guide 6 October 2026 ki saved research par based hai. Public numbers website par mile the; humne kisi ko call/WhatsApp nahi kiya, factory audit nahi kiya aur koi price ya order book nahi kiya. Yeh NCR ke har manufacturer ki exhaustive list nahi hai.')
table([['Aapka working brief','Supplier ko kya batana hai'],['Product','Ek existing, documented dog reward-biscuit recipe; final suitability qualified expert se review hogi.'],['Pilot','500 accepted sealed packs × 200 g. Product factory mein fill, seal, label aur batch-code ho.'],['Location','West Delhi; exact delivery PIN quote maangte waqt dena hai.'],['Inventory target','₹75–95 per accepted landed pack sirf planning target hai, supplier quote nahi. ₹85 par 500 packs = ₹42,500.'],['Budget discipline','₹2 lakh poore business ka cap hai; poora paisa factory ko dene ka budget nahi. QA, legal review, marketing aur ₹30,000 reserve alag hain.']],[43*mm,131*mm])
text('Important: kisi local candidate ki exact 500-pack biscuit capability, safety evidence, MOQ aur delivered price abhi approve nahi hue. Pehle screen karo, phir written quote, phir samples/evidence review; uske baad hi order decide karo.')

contacts=[
dict(name='Pet Zone India',area='Bakarwala / Mundka, West Delhi',phone='08047689883 / +91 8047689883',email='Public email nahi mila; official enquiry form use karo.',address='G/F, KH No. 18/1/2, near Hirankudna Road, Pole No. Mdkp281, Bakarwala, New Delhi 110041. Registered address alag listed hai: House 7-A, Khasra 14/10/11, Kamruddin Nagar, Delhi 110041.',status='Dog biscuits listed hain, lekin in-house biscuit factory aur white label confirmed nahi. Number marketplace-site call line hai; direct mobile/WhatsApp verified nahi.',question='Aap biscuits khud bake karte ho ya kisi aur factory se lete ho? Broski ke naam se factory-packed 200 g packs de sakte ho?',terms='Listing mein ₹58/kg, 25 kg MOQ aur 1 kg packet hai. Yeh Broski finished-pack quote nahi; packaging, tax, testing aur freight alag/unknown ho sakte hain.',url='https://www.petzoneindia.com/pet-dog-biscuits.html'),
dict(name='Mannu-G / Mannuji',area='Meerut, Uttar Pradesh',phone='+91 9958228588',email='info@mannuji.in',address='Published factory lead: Khasra 520, Village Acchronda, Gagole Road, Partapur, Meerut 250103. Actual biscuit unit aur selling entity confirm karo.',status='Official indexed product page par dog-biscuit OEM advertised hai. Phone aur WhatsApp Business expressly listed hain. Website/document inconsistencies ke kaaran extra verification zaroori hai.',question='Aapka domestic dog-biscuit OEM available hai? Actual GST/legal entity, biscuit plant aur bank beneficiary ke documents share kar sakte ho?',terms='Generic export FAQ mein biscuits/cookies 50 cartons likha hai. Dog-biscuit carton weight, domestic MOQ, 200 g pack aur price unknown hain.',url='https://www.mannuji.in/export/contact.php'),
dict(name='Petz Creation',area='Kundli, Sonipat, Haryana',phone='+91 9999971719',email='info@petzcreation.com',address='First Floor, Khasra No. 47, 16/1 to 16/4, 25/1 Min, Area Kundli, Sonipat 131028, Haryana.',status='Biscuit brand/contact lead hai; own factory aur white-label willingness established nahi. WhatsApp status unconfirmed. Contact indexed official page se mila; direct page retrieval failed tha.',question='Aapke biscuit pack par manufacturer kaun hai? Aap khud manufacture karte ho? Agar haan, Broski ke liye private label offer karte ho?',terms='MOQ, recipe, price aur OEM terms unknown.',url='https://www.petzcreation.com/about-us'),
dict(name='Innomalous Technologies',area='Sector 63, Noida',phone='+91 9711603003',email='B2B quote/contact form preferred. Related Pawcrafted business channel: sales@pawcrafted.com, +91 9581993320.',address='E-197, Sector 63, Noida, Uttar Pradesh 201309.',status='Pet-edible manufacturing/private-label evidence hai; baked biscuit format confirmed nahi. Related Pawcrafted ko separate factory count mat karo. WhatsApp status unconfirmed.',question='Aapki existing line mein crisp baked dog biscuits hain, ya sirf dehydrated/custom treats? Existing validated biscuit ho toh pilot MOQ kya hai?',terms='Low-MOQ wording numerical 500-pack commitment nahi. Product-specific quote chahiye.',url='https://innomalous.com/about/contact/'),
dict(name='TrueCare Foods',area='Kasna, Greater Noida',phone='+91 8799794887 / +91 8799793284',email='armaan.goyal@truecarefoods.in; deepak.sharma@truecarefoods.in',address='K-329, Site-V, UPSIDC Industrial Area, Kasna, Greater Noida 201310, Uttar Pradesh. Visit se pehle address confirm karo.',status='Contract pet treats ka offer hai; soft sticks, meat strips, soft bites aur dental sticks listed hain. Baked biscuits unconfirmed; WhatsApp unconfirmed.',question='Broski ke liye existing baked reward-biscuit SKU hai? Agar nahi, kaunsa adjacent treat available hai aur uska separate MOQ/price kya hoga?',terms='Custom functional/health product ko biscuit ke substitute ki tarah assume mat karo. MOQ aur price unknown.',url='https://www.truecarefoods.in/icare4pets'),
dict(name='Biovencer Healthcare',area='Greater Noida / NSEZ',phone='+91 9560418220',email='info@biovencer.com',address='Published units: K-230/K-232, Site-V, Greater Noida 201306; G-14/K-436, Site-V, Kasna 201308; NSEZ plots 181/114. Quoted pet product kis unit mein banta hai, confirm karo.',status='Pet-food OEM/private-label offer hai; actual biscuit line confirmed nahi. Human protein diskettes ko dog-biscuit evidence mat samjho. WhatsApp unconfirmed.',question='Dog biscuits ki actual production line aur domestic supplying unit kaunsi hai? Existing recipe aur final-pack stability evidence share kar sakte ho?',terms='500-pack availability aur price unknown; broad product portfolio se biscuit capability assume mat karo.',url='https://www.biovencer.com/pet-food'),
dict(name='Al Moin Exports',area='Hapur, Uttar Pradesh',phone='+91 7505294317',email='exports@almoinexports.com',address='Industrial Area Phase 2, Hapur, Uttar Pradesh 245101.',status='Private-label dehydrated chews/meat treats ka adjacent supplier; biscuits confirmed nahi. Number official WhatsApp-linked hai. Export focus hai; domestic supply eligibility unresolved.',question='India domestic startup ko supply kar sakte ho? Indian contracting/invoice entity kaun hogi? Baked biscuit hai ya sirf chews?',terms='Domestic MOQ, price aur accepted pack quantity unknown. Chew choose karne par product aur economics ka naya review chahiye.',url='https://almoinexports.com/contact'),
]
title('Quick contact sheet')
table([['Company / area','Public number','Capability gap']]+[[c['name']+' — '+c['area'],c['phone'],('Biscuit OEM advertised; verify.' if c['name'].startswith('Mannu') else 'Biscuit factory / exact OEM format verify karo.')] for c in contacts],[52*mm,48*mm,74*mm])
text('Suggested first calls: Pet Zone → Innomalous → TrueCare → Mannu-G. Agar biscuit format unavailable ho toh Biovencer screen karo. Petz Creation se manufacturer identity/OEM poochho; Al Moin ko sirf adjacent fallback samjho. Yeh approval ranking nahi hai.')
text('Phone lagne par poochho: “Kya main private-label sales person se baat kar raha hoon? Aapka naam aur designation kya hai?” WhatsApp unconfirmed number par availability assume mat karo.')

for start in [0,2,4,6]:
    title('Manufacturer details '+str(start+1)+'–'+str(min(start+2,len(contacts))))
    for c in contacts[start:start+2]:
        text(c['name']+' | '+c['area'],'BroH2')
        for label,key in [('Phone','phone'),('Email / enquiry','email'),('Address','address'),('Research status','status'),('Sabse pehla sawaal','question'),('MOQ / price caveat','terms')]:text('**'+label+':** '+c[key])
        text('[Official contact / capability source]('+c['url']+')')

title('Extra Faridabad lead + first-call script')
text('Gopal Krishna Enterprises / Spunky Pets — secondary discovery','BroH2')
text('Retail listing ke manufacturer field mein **9311989810** aur **gopalkrishnaenterprises2@gmail.com** diye hain. Address: H.No. 1929, Sector 23A, Faridabad 121005. Yeh retailer-hosted evidence hai; company ki own factory, current contact aur white-label offer independently establish nahi hue. WhatsApp unconfirmed.')
text('[Retail manufacturer-field source](https://www.jiomart.com/p/homeandkitchen/spunky-pets-multi-grain-freshly-oven-baked-puppy-milk-dog-biscuits-5-kg/600935023)')
text('Pehla sawaal: “Aap Spunky Pets biscuits ki actual manufacturing entity ho? Food plant ka address aur Broski private-label terms share kar sakte ho?” Payment-ready shortlist mein tabhi lao jab primary documents/evidence mil jaaye.')
text('Call opening — bolne ke liye ready','BroH2')
text('“Hello, mera naam [naam] hai. Main West Delhi se Broski naam ka dog-treat brand start kar raha hoon. Mujhe ek existing documented dog-biscuit recipe chahiye jo aapki factory mein manufacture, pack, seal aur label ho. Pilot mein 500 accepted 200 g packs chahiye. Kya aap khud baked dog biscuits manufacture karte ho aur domestic white-label service dete ho?”')
text('Agar haan: “Main pehle aapki capability, MOQ, sample aur quality documents samajhna chahta hoon. Please itemized written quote aur sample process share kar dijiye. Yeh enquiry hai, abhi order confirm nahi kar raha.”')
text('Agar trader hain: “Actual biscuit manufacturer ka naam, food-plant address aur traceability kaise milegi? Manufacturing agreement aur QA responsibility kiski hogi?”')
text('Agar sirf chews/soft treats hain: “Theek hai, us product ka separate catalogue bhejiye. Main biscuit pricing ya feeding guidance us par apply nahi karunga.”')

groups=[
('A / Factory aur white-label fit',[
'Aap actual biscuit manufacturer ho ya trader/brand owner? Biscuit baking line kis entity ki hai?',
'Food factory ka exact address aur legal selling entity kya hai? GST/invoice aur bank beneficiary kis naam par honge?',
'Aap baked dog biscuits banate ho, ya soft chews/dehydrated treats? Existing biscuit SKUs ka catalogue bhej sakte ho?',
'India domestic startups ko private label dete ho? Apne brand ke pack par Broski label aur marketer details allowed hain?',
'Appointment par factory visit ya live video walkthrough possible hai? Kaunse manufacturing/quality documents review ke liye milenge?',
'Existing private-label customer references permission ke saath share kar sakte ho? Confidential names disclose karne ki zaroorat nahi.',
'Aapka sales aur quality contact kaun hai? Written quote approve karne aur complaint resolve karne ka authority kis ke paas hai?']),
('B / Recipe aur dog suitability',[
'Existing validated biscuit recipe ki full ingredient list, allergens aur recipe revision kya hai?',
'Yeh complementary treat hai ya complete food? Intended dog age/size aur use limitations kis basis par hain?',
'Feeding quantity aur calorie information kis qualified reviewer/data se supported hai? Hum final expert review karwa sakte hain?',
'Biscuit ka size, texture, breakability aur crumbs kitne hain? Actual piece/pack samples mil sakte hain?',
'Ingredients ki specification aur supplier traceability available hai? Cross-contact/allergen controls kya hain?',
'Flavour, shape, ingredient supplier ya pack change karne par kaunsi validation dobara karni padegi?',
'Bina written approval ke recipe/ingredient/pack substitution rokne ka change-control agreement karoge?']),
('C / MOQ, quantity aur samples',[
'MOQ per recipe, pack size aur artwork kitna hai? 500 accepted sealed 200 g retail packs possible hain?',
'Agar MOQ cartons mein hai, ek carton mein kitne packs aur total net kilograms kitne honge?',
'Smaller documented pilot possible hai? 250 aur 500 accepted packs ki separate quote mil sakti hai?',
'Sample fee, courier, quantity aur sample lead time kya hai? Sample final production recipe/pack jaisa hoga?',
'100 kg net retail fill ke alawa process loss, overfill, factory/lab retained samples aur rejects ka allowance kaise calculate hoga?',
'500 accepted packs humare delivery count mein honge? Factory-retained samples extra hain ya is count se nikalenge?',
'Weight tolerance, short count, broken biscuits aur rejected packs ki acceptance/replacement conditions written mein kya hongi?']),
('D / Quality, safety aur shelf life',[
'Batch COA aur relevant lab reports milenge? COA mein kaunse tests aur kaunse batch/recipe details honge?',
'Tests ki lab, matrix aur method accreditation ka scope kya hai? Hum independent qualified lab/expert se review karwa sakte hain?',
'Microbiology, moisture/water activity, oxidation aur ingredient-specific contaminants ka protocol kaun decide karta hai?',
'Process hygiene, pest control, allergen management aur ingredient/batch traceability ke records available hain?',
'Shelf life exact recipe + final pouch + storage conditions par tested hai? Existing data kaunsi conditions mein transfer ho sakta hai?',
'Accelerated aur real-time stability mein kya evidence hai, aur proposed best-before ko kaun approve/sign karega?',
'Batch release se pehle stock hold/inspection possible hai? Failed test ya suspected contamination par complaint/withdrawal procedure kya hai?']),
('E / Primary pouch, labels aur cartons',[
'200 g actual biscuit fill ke liye kaunsa opaque/metallized stock pouch recommend karoge? Empty sample sizes milenge?',
'Pouch ki layer structure, thickness/tolerance, food-contact/migration documents aur traceability kya hai?',
'Oxygen/moisture barrier values, test conditions aur relevant shelf-life evidence share kar sakte ho? Sirf “food grade” label sufficient nahi hoga.',
'Zipper ke upar factory heat seal, coding aur seal-integrity check hoga? Sealing parameters ka record kaise maintain hoga?',
'Front/back labels, adhesive, print finish, coding window aur final proof ka approval process kya hai?',
'Pack par manufacturer, marketer, quantity, MRP, dates, batch, consumer care aur applicable declarations ka reviewer kaun hoga?',
'Master cartons aur customer shipping boxes ka cost alag dikhaoge? Pouch MOQ/order increments aur spare packaging ki ownership kya hogi?']),
('F / Complete cost aur payment',[
'Product, pouch, paired labels, filling, sealing, coding, cartons, tax aur West Delhi inward freight separately quote karoge?',
'One-time recipe development, sample, testing, artwork/cylinder, wastage aur setup charges kya hain? Kya koi hidden minimum hai?',
'Recurring landed cost ko accepted retail packs se divide karke per-pack quote doge? Bulk ₹/kg aur packed retail quote alag rakho.',
'Quote validity aur tax/invoicing treatment kya hai? Accountant ko required invoice details milengi?',
'Deposit aur balance milestones kya hain? Specification, sample, artwork aur QA scope pass hone ke baad hi commitment possible hai?',
'Payment verified contracting entity ke bank account mein hoga? Purchase order, agreement aur receipt doge?',
'Defect/reject replacement, refund/credit aur replacement freight ka responsibility split kya hoga?']),
('G / Timeline aur dispatch',[
'Sample, expert review support, artwork proof, production aur dispatch ki separate realistic dates kya hain?',
'Delay hone par written update, revised schedule aur cancellation/deposit treatment kya hoga?',
'Delivered batch ki remaining supported shelf life kitni hogi? Manufacturing date aur expiry data shipment se pehle milega?',
'Actual packed dimensions/weights, cartons count aur damage-resistant dispatch packing share karoge?',
'Delivery kis carrier/route se hogi? Inward freight insurance, transit damage aur lost shipment ki responsibility kya hai?',
'Reorder lead time, MOQ aur pricing review kya hoga? Same recipe/pack consistency written agreement mein maintain hogi?',
'Production ready hone ke baad acceptance documents/photos aur agreed release approval ke bina shipment roka ja sakta hai?']),
('H / Agreement, claims aur after-sales',[
'Brand/logo aur artwork rights Broski ke rahenge? Standard recipe aur custom-development IP ownership clearly define karoge?',
'Label par kaunse claims evidence se supported hain? Unsupported vet-approved, therapeutic, dental ya certification claims print nahi karoge?',
'Applicable permissions/registrations aur certificate validity ka evidence doge? Hum relevant local adviser se applicability verify karenge.',
'Serious product complaint par quality contact kitne time mein respond karega? Lot-wise buyer traceability mein cooperate karoge?',
'Withdrawal/recall mein investigation, communication, replacement aur cost responsibility ka agreed process kya hai?',
'Quality dispute par sealed retained samples, independent testing aur remedy process kaise chalega?',
'Saari agreed specifications, no-substitution rule, price, output, dates, QA/label approval aur defect terms signed agreement/PO mein doge?']),
]
question_no=0
for i in range(0,len(groups),2):
    title('Detailed questions '+str(i//2+1)+' / 4')
    for heading,qs in groups[i:i+2]:
        text(heading,'BroH2')
        for q in qs:
            question_no+=1;text(str(question_no)+'. '+q)
assert question_no==56

title('Written enquiry — copy/paste ready')
text('Subject: Broski West Delhi pilot — 500 × 200 g dog-biscuit packs','BroH2')
text('Hello [contact name], main [naam], West Delhi se Broski dog-treat brand ke liye manufacturing partner evaluate kar raha hoon. Please confirm karein ki aap apni facility mein baked dog biscuits manufacture karte hain aur India domestic private label offer karte hain.')
text('Humein ek existing documented reward-biscuit recipe chahiye, 500 accepted sealed 200 g packs mein, aapki factory par approved barrier pouch + front/back labels + batch/date coding ke saath. Delivery PIN: [PIN].')
text('Please share karein: legal selling entity aur biscuit-plant address; recipe/ingredients/allergens; intended feeding/use information; final-pack stability evidence aur batch QA/COA; product-specific MOQ; sample quantity/fee/courier; complete itemized landed quote; one-time costs; realistic approval-to-dispatch schedule; payment milestones; rejects/replacement/recall cooperation terms.')
text('Please biscuit capability ko chews/dehydrated treats se alag clearly mention karein. Pouch ki laminate/barrier/contact suitability aur actual-fill sample proof bhi chahiye. Hum specification, expert QA scope aur final artwork review ke baad hi order decision lenge.')
text('Planning target ₹75–95 per accepted landed pack hai, safe aur appropriate scope ke subject to. Yeh agreed price nahi hai. Agar 500 packs possible nahi hain, smallest suitable pilot ki separate quote bhej dijiye. Yeh enquiry hai; production ya printing authorize nahi ki ja rahi. Thank you, [naam / business contact].')
text('Follow-up after agreed response date','BroH2')
text('“Hello [naam], Broski biscuit enquiry ka follow-up kar raha hoon. Kya own baked-biscuit line aur domestic white label confirm ho gaya? Please pending MOQ, sample terms, documents aur itemized quote ka response date bata dijiye.”')

title('Quote comparison aur decision sheet')
table([['Field','Supplier A','Supplier B','Supplier C'],['Own biscuit plant / actual factory','Fill','Fill','Fill'],['Legal entity / beneficiary checked','Yes / pending','Yes / pending','Yes / pending'],['500 accepted 200 g packs','Yes / alternative','Yes / alternative','Yes / alternative'],['Recipe + final-pack QA evidence','Details','Details','Details'],['All-in inventory invoice','₹','₹','₹'],['Separate one-time sample/lab costs','₹','₹','₹'],['Accepted-pack landed cost','₹ / pack','₹ / pack','₹ / pack'],['Deposit / balance milestones','Terms','Terms','Terms'],['Supported shelf life / dispatch date','Evidence / date','Evidence / date','Evidence / date'],['Reject / damage / recall terms','Terms','Terms','Terms']])
text('Formula: recurring gross inventory invoice ÷ accepted retail packs = landed recurring pack cost. Included pouches, labels aur inward freight ko budget mein dobara add mat karo. Customer-order shipping material alag hota hai. QA/lab costs quote mein included hain toh scope verify karke duplicate setup allocation remove karo; assumption par nahi.')
text('MOQ mismatch ya ₹95 se upar quote par automatically supplier reject karna zaroori nahi; landed economics aur poora ₹2 lakh cash envelope dobara calculate karo. Quality evidence aur protected reserve compromise karke low price chase mat karo.')

title('Call ke baad exactly kya karna hai')
for s in [
'1. Call log banao: date, contact name/role, company, product format, factory identity, MOQ, sample fee, documents pending aur next response date.',
'2. Pehle comparable written quotes lo. Biscuit, chew aur dehydrated products ko same comparison mein nutritional/price equivalent mat maan lo.',
'3. Qualified expert/lab aur local adviser se recipe, pack, evidence, label aur required operating scope review karwao. Public certificate claim se automatic approval nahi milta.',
'4. Approved sample order lo; actual product, pouch fit, seal, coding, breakage aur transit conditions check karo. Taste/fit trials shelf life prove nahi karte.',
'5. Final specification + artwork + evidence requirements + acceptance terms agree hone ke baad hi manufacturing commitment decide karo.',
'6. Payment se pehle contracting entity, invoice aur beneficiary match verify karo. Unexplained mismatch, traceability refusal ya pressure deposit par commercial progression rok do.',
'7. Finished batch receive karke hold/check aur documented release karo; sirf tab real storefront product facts aur stock update karo.',
'8. Agar NCR mein suitable documented biscuit pilot nahi milta, national OEM comparison lo ya run/schedule reduce karo. Sirf nearby hone ke kaaran unverified product buy mat karo.'
]:text(s)
text('Sensible answer vs red flag','BroH2')
table([['Topic','Useful answer','Concern'],['Factory','Named plant + documents + appointment','Factory identity unclear / trading hidden'],['Shelf life','Exact recipe/pack evidence + reviewer','Generic “12 months” without evidence'],['Price','Itemized dated written quote','Only ₹/kg with packing/tax unexplained'],['Payment','Verified company + milestones','Unrelated beneficiary / urgent deposit pressure'],['MOQ','Clear actual units and pilot alternatives','Cartons mentioned but pack count unknown']],[30*mm,73*mm,71*mm])
text('High MOQ ya delayed reply apne aap fraud ka proof nahi hai. Questions ka purpose clear evidence aur suitable commercial fit establish karna hai. Is PDF ke basis par kisi supplier ko approved ya booked mat samjho.')

from reportlab.platypus import SimpleDocTemplate
def footer(c,doc):
    c.saveState();c.setStrokeColor(ns['colors'].HexColor('#d7c8b6'));c.line(18*mm,17*mm,192*mm,17*mm)
    c.setFont('Arial',7.5);c.setFillColor(ns['ink']);c.drawString(18*mm,12*mm,'BROSKI • HINGLISH SUPPLIER CALL GUIDE • RESEARCH: 6 OCT 2026');c.drawRightString(192*mm,12*mm,str(doc.page));c.restoreState()
doc=SimpleDocTemplate(str(OUT),pagesize=(210*mm,297*mm),leftMargin=18*mm,rightMargin=18*mm,topMargin=18*mm,bottomMargin=24*mm,title='Broski NCR manufacturer questions in Hinglish',author='ATLAS / Broski research team')
doc.build(ns['story'],onFirstPage=footer,onLaterPages=footer)
(ROOT/'Broski_Hinglish_Call_Guide_Editable.md').write_text('\n\n'.join(editable),encoding='utf8')
print(OUT)

