from pathlib import Path
import json
from pypdf import PdfReader
import pypdfium2 as pdfium
from PIL import Image, ImageDraw
root=Path(__file__).parent
path=root/'Broski_India_Launch_Plan_Under_2_Lakh.pdf'
r=PdfReader(str(path));d=pdfium.PdfDocument(str(path))
sheet=Image.new('RGB',(1000,330*((len(r.pages)+3)//4)), '#ddd')
draw=ImageDraw.Draw(sheet)
checks=[]
for i,page in enumerate(r.pages):
    txt=page.extract_text()
    assert len(txt)>300, f'Sparse page {i+1}'
    checks.append({'page':i+1,'characters':len(txt),'opening':txt[:110]})
    im=d[i].render(scale=.38).to_pil().convert('RGB');im.thumbnail((240,305))
    x=(i%4)*250;y=(i//4)*330
    sheet.paste(im,(x,y));draw.text((x+5,y+308),str(i+1),fill='#111')
sheet.save(root/'layout-review.png')
for i in [0,3,5,10,19,21]:
    if i<len(d):d[i].render(scale=1.3).to_pil().save(root/f'page-{i+1:02d}.png')
m=json.loads((root/'financial_model.json').read_text())
assert m['budget_total']==200000
assert abs(m['blended_pre_acquisition_contribution']-108.6107525)<.001
assert all(int(row[2])<=450 for row in m['scenarios'])
(root/'verification.json').write_text(json.dumps({'pages':len(r.pages),'budget':200000,'financial_checks':'passed','page_checks':checks},ensure_ascii=False,indent=2),encoding='utf8')
print('Pages:',len(r.pages),'Budget:200000. Financial checks passed.')
for row in checks: print(row['page'],row['characters'],row['opening'].encode('ascii','replace').decode().replace('\n',' / '))
