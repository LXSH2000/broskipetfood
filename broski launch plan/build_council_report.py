from pathlib import Path
import re, csv, json
from xml.sax.saxutils import escape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
ROOT=Path(__file__).parent; SITE=ROOT.parent/'dog biscuit website'
OUT=ROOT/'Broski_Site_Council_and_NCR_Suppliers_2026-10-06.pdf'
pdfmetrics.registerFont(TTFont('Arial',r'C:\Windows\Fonts\arial.ttf'))
pdfmetrics.registerFont(TTFont('ArialBold',r'C:\Windows\Fonts\arialbd.ttf'))
pdfmetrics.registerFontFamily('Arial',normal='Arial',bold='ArialBold',italic='Arial',boldItalic='ArialBold')
ink=colors.HexColor('#352016');rust=colors.HexColor('#a95030');paper=colors.HexColor('#f4ecdf')
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='BroBody',fontName='Arial',fontSize=9.2,leading=13.1,textColor=ink,spaceAfter=7))
styles.add(ParagraphStyle(name='BroTitle',fontName='ArialBold',fontSize=27,leading=33,textColor=ink,spaceAfter=18))
styles.add(ParagraphStyle(name='BroH1',fontName='ArialBold',fontSize=21,leading=26,textColor=ink,spaceAfter=16))
styles.add(ParagraphStyle(name='BroH2',fontName='ArialBold',fontSize=12,leading=17,textColor=rust,spaceBefore=11,spaceAfter=8,keepWithNext=True))
styles.add(ParagraphStyle(name='BroCell',fontName='Arial',fontSize=8.2,leading=11.7,textColor=ink))
story=[]
def inline(t):
    t=escape(t)
    t=re.sub(r'\[([^\]]+)\]\((https?://[^\s)]+)\)',r'<link href="\2" color="#A95030">\1</link>',t)
    t=re.sub(r'\*\*(.+?)\*\*',r'<b>\1</b>',t)
    return re.sub(r'`([^`]+)`',r'\1',t)
def p(t,style='BroBody'):story.append(Paragraph(t,styles[style]))
def table(rows,widths=None):
    cols=len(rows[0]);widths=widths or [174*mm/cols]*cols
    data=[[Paragraph(inline(str(v)),styles['BroCell']) for v in row] for row in rows]
    t=Table(data,colWidths=widths,repeatRows=1,hAlign='LEFT')
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),paper),('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7),('LINEBELOW',(0,0),(-1,0),1,rust),('LINEBELOW',(0,1),(-1,-1),.25,colors.HexColor('#d8ccbb'))]))
    story.extend([t,Spacer(1,10)])
def section(title):
    if story:story.append(PageBreak())
    p('BROSKI / WEST DELHI / 6 OCTOBER 2026');p(title,'BroH1')
def md(path,title):
    section(title);lines=path.read_text(encoding='utf8').splitlines();i=0;buf=[]
    def flush():
        if buf:p(inline(' '.join(buf)));buf.clear()
    while i<len(lines):
        l=lines[i].strip()
        if l.startswith('# '):i+=1;continue
        if l.startswith('|'):
            flush();rows=[]
            while i<len(lines) and lines[i].strip().startswith('|'):
                vals=[x.strip() for x in lines[i].strip().strip('|').split('|')]
                if not all(re.fullmatch(r'[:\- ]+',v) for v in vals):rows.append(vals)
                i+=1
            cols=len(rows[0]);rows=[r+['']*(cols-len(r)) for r in rows]
            widths=[52*mm,122*mm] if cols==2 else ([43*mm,47*mm,84*mm] if cols==3 else None)
            table(rows,widths);continue
        if l.startswith('## '):flush();p(inline(l[3:]),'BroH2');i+=1;continue
        if l.startswith('### '):flush();p(inline(l[4:]),'BroH2');i+=1;continue
        if not l:flush();i+=1;continue
        if l.startswith('- '):flush();p('• '+inline(l[2:]));i+=1;continue
        if re.match(r'^\d+\. ',l):flush();p(inline(l));i+=1;continue
        buf.append(l);i+=1
    flush()

section('Council review + NCR sourcing')
p('Keep the design.<br/>Strengthen the foundations.','BroTitle')
p('Restored Broski website review, regional supplier contacts, white-label screening questions and an execution checklist. Prepared for the West Delhi founder. Existing total launch budget: ₹2,00,000.')
table([['Finding','Decision'],['Website','Build and backend tests passed; browser/device acceptance remains unverified. Keep the restored appearance.'],['Recommended work','Loading recovery, decorative-motion control, lighter images, readable mobile text and reliable repeat-action feedback. No design changes made.'],['Sourcing','Seven primary-site regional candidates, with separate secondary discoveries. No candidate has been approved for the exact 500-pack biscuit requirement.'],['Next move','Four screening calls, then comparable written quotes and qualified product/pack/label review. No deposit on public website claims alone.']],[39*mm,135*mm])
p('Use the contact sheet to screen firms, the detailed directory to understand gaps, and the council checklist to scope future website work. Published phone numbers are not call-verified. The council is task-based peer review, not autonomous background monitoring.')

section('Quick supplier contact sheet')
contacts=[
('Pet Zone India','Bakarwala, West Delhi','08047689883','Biscuit listing; factory/OEM unconfirmed','https://www.petzoneindia.com/pet-dog-biscuits.html'),
('Mannu-G / Mannuji','Meerut','+91 9958228588','Biscuit OEM advertised; enhanced diligence','https://www.mannuji.in/export/contact.php'),
('Petz Creation','Kundli, Sonipat','+91 9999971719','Biscuit brand; factory/OEM unconfirmed','https://www.petzcreation.com/about-us'),
('Innomalous','Sector 63, Noida','+91 9711603003','Pet private label; baked biscuit unconfirmed','https://innomalous.com/about/contact/'),
('TrueCare Foods','Kasna, Greater Noida','+91 8799794887 / +91 8799793284','Contract pet treats; biscuit line unconfirmed','https://www.truecarefoods.in/icare4pets'),
('Biovencer','Greater Noida / NSEZ','+91 9560418220','Pet-food OEM; biscuit line unconfirmed','https://www.biovencer.com/pet-food'),
('Al Moin Exports','Hapur','+91 7505294317','Adjacent chews; domestic supply unresolved','https://almoinexports.com/contact'),
]
rows=[['Candidate / area','Published number','What to confirm']]
rows.extend([[f'{n}\n{area}',phone,f'{fit}\n[Official source]({url})'] for n,area,phone,fit,url in contacts])
table(rows,[47*mm,43*mm,84*mm])
p('Pet Zone’s number is a marketplace-site call line, not a verified direct mobile or WhatsApp contact. Mannu-G expressly lists WhatsApp Business; Al Moin links its WhatsApp. Other WhatsApp status is unconfirmed. Contact pages can change; verify the entity and current staff before payment.')
p('Priority call: “Do you manufacture baked dog biscuits yourself, and can you factory-pack 500 accepted 200 g packs under Broski using a documented existing recipe?” Reject or reclassify format mismatches before comparing prices.')
with (ROOT/'NCR_Supplier_Contacts_2026-10-06.csv').open('w',newline='',encoding='utf-8-sig') as f:
    w=csv.writer(f);w.writerow(['Candidate','Area','Published phone','Capability caveat','Source URL']);w.writerows(contacts)
md(SITE/'COUNCIL_DECISIONS_2026-10-06.md','Council decisions and release gates')
md(ROOT/'NCR_MANUFACTURERS_2026-10-06.md','Detailed manufacturer discovery and RFQ')
md(SITE/'COUNCIL_TECH_REVIEW_2026-10-06.md','Appendix: technical review evidence')
md(SITE/'COUNCIL_DESIGN_REVIEW_2026-10-06.md','Appendix: design and accessibility review')
def footer(c,doc):
    c.saveState();c.setStrokeColor(colors.HexColor('#d7c8b6'));c.line(18*mm,17*mm,192*mm,17*mm)
    c.setFont('Arial',7.5);c.setFillColor(ink);c.drawString(18*mm,12*mm,'BROSKI • COUNCIL + NCR SOURCING • 6 OCT 2026');c.drawRightString(192*mm,12*mm,str(doc.page));c.restoreState()
doc=SimpleDocTemplate(str(OUT),pagesize=(210*mm,297*mm),leftMargin=18*mm,rightMargin=18*mm,topMargin=18*mm,bottomMargin=24*mm,title='Broski council review and Delhi NCR sourcing',author='ATLAS / Broski specialist team')
doc.build(story,onFirstPage=footer,onLaterPages=footer)
print(OUT)

