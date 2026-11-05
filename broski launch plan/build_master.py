from pathlib import Path
from xml.sax.saxutils import escape
import re, json
ROOT=Path(__file__).parent
ns={'__file__':str(ROOT/'build_plan.py')}
base=(ROOT/'build_plan.py').read_text(encoding='utf8').split('doc=SimpleDocTemplate')[0]
base=base.replace("OUT=ROOT/'Broski_India_Launch_Plan_Under_2_Lakh.pdf'","OUT=ROOT/'Broski_West_Delhi_Complete_Execution_Masterplan.pdf'")
base=base.replace('India-focused; operating city not yet supplied.','India-focused; operating base: West Delhi, supplied by the founder.')
base=base.replace('one city','one West Delhi serviceable cluster').replace('your reachable city','your West Delhi serviceable cluster')
base=base.replace('Detailed research notes are saved beside this PDF:', 'Original research notes are saved beside this PDF:')
base=base.replace('Treats for your best bro.','Broski / West Delhi')
base=base.replace('A practical business launch<br/>within','Complete execution masterplan<br/>within')
# Save the original source section for the end, after the new detailed playbooks.
prefix,refs=base.split('sources=[',1)
exec(prefix,ns)
p=ns['p'];page=ns['page'];h=ns['h'];table=ns['table'];bullets=ns['bullets']
mm=ns['mm'];story=ns['story'];styles=ns['styles']
styles['H2X'].keepWithNext=True
styles['Body'].fontSize=9.2;styles['Body'].leading=13.2

page('22 / West Delhi launch route','LOCAL EXECUTION DECISIONS')
p('Start in one reachable cluster near your actual dispatch address. Rajouri Garden, Janakpuri and Paschim Vihar are examples to evaluate, not researched partner commitments or automatically serviceable delivery zones. The exact dispatch PIN and suitable storage premises remain unknown.')
table(['Sequence','Action and measurable output'],[['First 72 hours','Choose dispatch PIN and 3–5 nearby serviceable PINs. Map five potential groomers/pet shops and two permitted communities using public business channels. Record travel time.'],['Supplier sequence','B&K for documented biscuit OEM feasibility; Mannu-G Meerut for verification-first backup. Restokart Gurugram, Printo Graphics Delhi and Packman Greater Noida for local packaging comparisons. Proximity does not replace evidence.'],['Local demand test','20 short interviews across weeks 1–3. Start with recent treat buyers outside only friends/family. Ask price-specific objections before ordering stock.'],['Local delivery test','Get written quotes for fully packed 1/2/3-pouch parcels from the actual dispatch PIN. Compare door-to-door delivery with prepaid pickup at a willing partner. Budget partner handling and founder travel.'],['Launch promise','Publish only verified PINs, shipping charge and dispatch window. Avoid same-day/next-day promises until tested. A pickup site requires written permission and appropriate handling.'],['Expand','Open adjacent PINs only after delivered-order margins and service reliability pass. Keep ₹30,000 reserve protected.']],[34*mm,140*mm])
p('A West Delhi focus is a strategy hypothesis: lower coordination burden, easier relationship building and short feedback loops. Delivery may still cost more than the base assumptions. Do not infer demand, cheap rent, regulatory approval or low freight from the location.')
h('Who owns the work')
p('Founder: supplier selection, cash, customer conversations and final approvals. Manufacturer: approved production and sealing/coding. Qualified specialist/lab: appropriate product protocol and evidence interpretation. Local adviser/CA: actual premises, tax, registration and label applicability. Scoped helper: dispatch/support within ₹10,000. No paid employee or dedicated rented premises is funded.')

def inline(text):
    text=text.replace('city and legal entity remain to be confirmed','operating base is West Delhi; exact dispatch PIN, premises and legal entity remain to be confirmed')
    text=text.replace('complete 10 interviews; confirm actual founder hours','start short buyer interviews; confirm actual founder hours')
    text=text.replace('Finish 20 interviews; compare three concept cards','Continue toward 20 interviews by end of week 3; compare three concept cards')
    for a,b in {'all50':'all 50','reservepacks':'reserve packs','packfit':'pack fit','startupMOQ':'startup MOQ','smallerpilot':'smaller pilot','existingcaps':'existing caps','acceptable500pack':'acceptable 500-pack','shipping+':'shipping +','stock+':'stock +','mix20':'mix 20','packs2.1':'packs 2.1','payment2.36':'payment 2.36','courier+':'courier +','prepaid20':'prepaid 20','commission10':'commission 10','referral10':'referral 10'}.items():text=text.replace(a,b)
    text=escape(text)
    text=re.sub(r'\[([^\]]+)\]\((https?://[^\s)]+)\)',r'<link href="\2" color="#A95030">\1</link>',text)
    text=re.sub(r'\*\*(.+?)\*\*',r'<b>\1</b>',text)
    text=re.sub(r'`([^`]+)`',r'\1',text)
    # Compact draft spacing corrections, preserving IDs, phones and source URLs.
    text=re.sub(r'(?<=[A-Za-z])(?=₹)', ' ',text)
    text=re.sub(r'(?<=₹)(\d+(?:,\d+)*(?:\.\d+)?)(?=[A-Za-z])',r'\1 ',text)
    for a,b in {'singlepack':'single pack','leadbundles':'lead bundles','samplecourier':'sample courier','existingcaps':'existing caps','discretionarysamples':'discretionary samples','50reserve':'50 reserve','20consumer':'20 consumer','5creator':'5 creator','5partner':'5 partner','10retained':'10 retained','10replacement':'10 replacement','quoteoutsidebudget':'quote outside budget','unavailablestorage':'unavailable storage','Another500packs':'Another 500 packs','within10h':'within 10 h','supplierowner':'supplier owner'}.items():text=text.replace(a,b)
    return text

def markdown(path,label):
    page(label,'DETAILED WORKBOOK')
    lines=path.read_text(encoding='utf8').splitlines();i=0;buf=[]
    def flush():
        if buf:p(inline(' '.join(buf)));buf.clear()
    while i<len(lines):
        line=lines[i].strip()
        if line.startswith('# '):i+=1;continue
        if line.startswith('|'):
            flush();rows=[]
            while i<len(lines) and lines[i].strip().startswith('|'):
                vals=[x.strip() for x in lines[i].strip().strip('|').split('|')]
                if not all(re.fullmatch(r'[:\- ]+',x) for x in vals):rows.append(vals)
                i+=1
            if rows:
                cols=max(map(len,rows));rows=[r+['']*(cols-len(r)) for r in rows]
                # table() escapes strings, so render Markdown emphasis as plain text.
                rows=[[re.sub(r'\*\*|`','',x) for x in r] for r in rows]
                widths=[174*mm/cols]*cols
                if cols==2:widths=[52*mm,122*mm]
                if cols==3:widths=[45*mm,30*mm,99*mm]
                if cols==4:widths=[43.5*mm]*4
                table(rows[0],rows[1:],widths)
            continue
        if line.startswith('## '):flush();h(inline(line[3:]));i+=1;continue
        if line.startswith('### '):flush();h(inline(line[4:]));i+=1;continue
        if not line:flush();i+=1;continue
        if line.startswith('- '):flush();p('• '+inline(line[2:]));i+=1;continue
        if re.match(r'^\d+\. ',line):flush();p(inline(line));i+=1;continue
        buf.append(line);i+=1
    flush()

markdown(ROOT/'supplier-directory-v2.md','23 / Suppliers, phones and buying briefs')
markdown(ROOT/'strategy-council-v2.md','24 / Differentiation and market experiments')
markdown(ROOT/'execution-finance-v2.md','25 / Detailed finance and operating system')
markdown(ROOT/'founder-playbook-v2.md','26 / Founder execution worksheets')
page('27 / Integrated council decision','WHAT WE WILL EXECUTE')
p('Peer challenges were exchanged before the agents reached their usage limit. The saved strategy and finance notes record accepted changes: lead cold acquisition with the three-pack; use a fixed ₹40 capped referral reward; prohibit double-payout; keep one SKU; count gift-stock consumption in channel economics without expensing it twice in total profit; and delay release when supplier or quality evidence is missing. The council skill itself is a broken local pointer and was not loaded.')
bullets(['Funded plan: 500 accepted 200 g packs, provisional ₹85 landed, 450 initially saleable; 50 retained/evaluation/replacement stock subject to specialist requirements. Exact cash cap ₹2,00,000 and ₹30,000 protected reserve.','Recommended first channel: West Delhi direct prepaid orders and permitted referral relationships. Wholesale terms remain an illustrative alternative, not a parallel funded rollout.','Biscuit sourcing: B&K direct capability lead; Mannu-G conditional backup. Adjacent meat/dehydrated-treat suppliers require a revised product decision and economics.','Referral: ₹40 for a first delivered new customer, maximum 50 groomer and 25 customer rewards across funded pools. No stacking, self-referrals or payment for refunded orders.','CAC gate: track fully loaded channel CAC including allocated consumed gift stock; report cash CAC separately. Pilot scenarios use cash acquisition and separately expense sample stock. Do not subtract samples twice.','Wholesale decision floor: at least ₹35 contribution per pack under the stated prepaid bulk assumptions; the earlier ₹30 floor in the worksheet is illustrative only. Two-pack ₹449 delivers ₹31.91 after ₹60 acquisition in the model, below a strict ₹35 retail-order goal.','Schedule: customer interviews over weeks 1–3, not all in week 1; two repurposed content posts/week. Lab/QA and legal gates override launch dates.','Supplier numbers are publicly published, not call-verified. Availability, scope, dates, payment beneficiaries and prices must be checked before any commitment.'])
p('Direct integration review checked saved notes and reconciled these decisions. A second complete independent review of the expanded final artifact was unavailable after the agent usage limit. No outreach, supplier order, deposit, paid campaign or public deployment occurred.')
p('For the final supplier selection, use the directory score only after safety/legal gates: evidence 35%, economics 25%, MOQ/cash exposure 20%, delivery 10%, support/remedies 10%. Earlier scoring examples are optional comparison worksheets, not an additional conflicting approval rule. West Delhi supersedes any earlier unknown-city wording; exact dispatch PIN, suitable storage and entity remain undecided.')

page('28 / One more label quotation','PUBLIC CONTACT SUPPLEMENT')
p('<b>HelloPrints, Hyderabad</b> — public business phone +91 92562 56699; email hello@helloprint.in. Published address: Plot No. 42, HMT Shatavahana Nagar, near Miyapur Metro Station, Miyapur, Hyderabad, Telangana 500049. This is a national shipping comparison, not a West Delhi shop. Use the official contact-page WhatsApp link if desired; no outreach has been made.')
p('Its official product page lists a 100-label minimum and paper/vinyl/PP options. Request the actual 500-per-design front/back label quote, physical proof, adhesive compatibility, finish, tax/freight, print readiness and defect replacement. A label minimum is not a manufacturer MOQ. This is the twelfth directory lead; the eleven-lead count refers to the specialist directory alone.')
p('<link href="https://www.helloprints.in/contact" color="#A95030">Official contact page</link> · <link href="https://www.helloprints.in/product?id=product-labels" color="#A95030">Official product and MOQ page</link>. Checked 1 October 2026. These published details are not call-verified. Earlier indexed-only caution is superseded by the accessible official product result for these points; exact Broski pricing remains unquoted.')

exec('sources=['+refs,ns)
# Add an operational table of contents after the cover. Final physical page numbers are generated from PDF outlines.
from reportlab.platypus import SimpleDocTemplate
out=ns['OUT']
doc=SimpleDocTemplate(str(out),pagesize=(210*mm,297*mm),rightMargin=18*mm,leftMargin=18*mm,topMargin=18*mm,bottomMargin=24*mm,title='Broski West Delhi complete execution masterplan',author='ATLAS / Broski research team')
doc.build(story,onFirstPage=ns['footer'],onLaterPages=ns['footer'])
(ROOT/'Broski_Masterplan_Editable.md').write_text('\n\n'.join(ns['manuscript']),encoding='utf8')
print(out)

# Add a clickable contents page, section bookmarks and consistent physical page numbering.
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from io import BytesIO
reader=PdfReader(str(out));entries=[]
for i,pg in enumerate(reader.pages):
    txt=pg.extract_text()
    m=re.search(r'\n(\d{2} / [^\n]+)',txt)
    if m:entries.append((m.group(1),i+2))
nav=BytesIO();c=canvas.Canvas(nav,pagesize=(210*mm,297*mm))
c.setFillColor(ns['ink']);c.setFont('ArialBold',24);c.drawString(18*mm,270*mm,'Your execution roadmap')
c.setFont('Arial',9);c.drawString(18*mm,257*mm,'West Delhi • ₹2,00,000 cap • 1 October 2026')
y=244*mm
for title,number in entries:
    c.setFont('Arial',9);c.drawString(18*mm,y,title);c.drawRightString(192*mm,y,str(number));y-=6.4*mm
c.setFont('Arial',8);c.drawString(18*mm,35*mm,'Start with the local route and supplier directory; use the worksheets before paying.')
c.drawString(18*mm,29*mm,'Contacts are published leads. Quotes, approvals and product demand remain unverified.')
c.showPage();c.save()
writer=PdfWriter();writer.add_page(reader.pages[0]);writer.add_page(PdfReader(nav).pages[0])
for pg in reader.pages[1:]:writer.add_page(pg)
for title,number in entries:writer.add_outline_item(title,number-1)
for i,pg in enumerate(writer.pages):
    overlay=BytesIO();c=canvas.Canvas(overlay,pagesize=(210*mm,297*mm))
    c.setFillColor(ns['colors'].white);c.rect(176*mm,8*mm,19*mm,9*mm,stroke=0,fill=1)
    c.setFillColor(ns['ink']);c.setFont('Arial',7.5);c.drawRightString(192*mm,12*mm,str(i+1));c.save()
    pg.merge_page(PdfReader(overlay).pages[0])
writer.add_metadata({'/Title':'Broski West Delhi Complete Execution Masterplan','/Author':'ATLAS / Broski research team'})
with out.open('wb') as f:writer.write(f)
print('Final pages:',len(writer.pages))
