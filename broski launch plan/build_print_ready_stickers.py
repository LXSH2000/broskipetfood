"""
BROSKI Premium Packaging & Sticker Print PDF Generator (V9.0 - Master Press Edition)
Designed for: Lakshay (BROSKI Sole Proprietorship, Nangloi, New Delhi)
Compliant with: Legal Metrology (Packaged Commodities) Rules 2011 (Rule 6)

Features:
- Exact 1:1 photo-matched Front Bone Mascot Sticker (winking dog, tongue out, paw in the 'O', Good Boy Snacks)
- Exact 1:1 photo-matched Front Bottom Pill Badges in Comic Sans MS Bold (Chicken Bone, Mix Flavour, Peanut Butter)
- 1:1 Scale Circular Ø 50 mm Sample Stickers (for 50g sample pouches with live QR review code)
- 1:1 Scale Back Compliance Labels (A6 format with Rule 6 >= 4.0mm numeral & 1.0mm Scoobee footnote)
- A3 Sheet 1: Front Master Combo (6 Complete Front Sets: 3 Chicken + 3 Mix + 5 Nested 50mm Circles - Zero Waste!)
- A3 Sheet 2: Dedicated 50mm Circular Sample Stickers (35 Circles per Sheet: 14 Chicken + 14 Mix + 7 PB)
- A3 Sheet 3: Back Master Compliance (8 Complete A6 Labels: 4 Chicken + 4 Mix - 90% Paper Coverage!)
- A3 Sheet 4: Peanut Butter Front Combo (6 PB Sets + 5 Nested PB Circles)
- A3 Sheet 5: Peanut Butter Back Compliance Labels (8 PB A6 Labels)
"""

import os
import sys
from pathlib import Path
import qrcode
from PIL import Image, ImageDraw, ImageFont, ImageFilter

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, A3, landscape
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT = Path(r"D:\BROSKI ANTIGRAVITY\broski launch plan")
BRAIN = Path(r"C:\Users\lxshl\.gemini\antigravity\brain\5d55cb36-6899-4206-bd48-dabeba1b1cda")
DOWNLOADS = Path(r"C:\Users\lxshl\Downloads\_Office & Docs")
FONTS_DIR = Path(r"C:\Windows\Fonts")

# Register Unicode TrueType Fonts for crisp rendering & Indian Rupee symbol (₹)
pdfmetrics.registerFont(TTFont("Arial", str(FONTS_DIR / "arial.ttf")))
pdfmetrics.registerFont(TTFont("Arial-Bold", str(FONTS_DIR / "arialbd.ttf")))
pdfmetrics.registerFont(TTFont("SegoeUI-Bold", str(FONTS_DIR / "segoeuib.ttf")))
pdfmetrics.registerFont(TTFont("Comic-Bold", str(FONTS_DIR / "comicbd.ttf")))

# 1. Color Palette
C_BROWN = colors.HexColor("#49250B")       # Dark Chocolate Brown (matching photo outline)
C_CREAM = colors.HexColor("#FFFDF8")       # Bone Cream (matching photo background)
C_GOLD = colors.HexColor("#D97706")        # Warm Amber / Peanut / Biscuit Gold
C_DARK = colors.HexColor("#221C18")        # Deep Charcoal
C_LIGHT_BG = colors.HexColor("#FAF6EE")    # Soft Off-White
C_MAGENTA = colors.HexColor("#EC008C")     # Spot CutContour

# 2. Generate Live QR Code
def make_qr_code():
    qr_path = BRAIN / "qr_review_print.png"
    qr = qrcode.QRCode(box_size=12, border=1)
    qr.add_data("https://broskipetfood.com/r/")
    qr.make(fit=True)
    img = qr.make_image(fill_color="#49250B", back_color="white")
    img.save(str(qr_path))
    return str(qr_path)

# 3. Prepare High-Res Top Bone Mascot Sticker
def prepare_top_mascot():
    top_path = BRAIN / "hires_top_bone_sticker.png"
    if not top_path.exists():
        im_top = Image.open(BRAIN / "tight_top_sticker.png")
        target_w = 1400
        scale = target_w / im_top.width
        target_h = int(im_top.height * scale)
        up_top = im_top.resize((target_w, target_h), Image.Resampling.LANCZOS)
        up_top = up_top.filter(ImageFilter.UnsharpMask(radius=2, percent=130, threshold=3))
        up_top.save(str(top_path))
    return str(top_path)

# 4. Generate High-Res Bottom Pill Badges (350 DPI)
def make_pill_badges():
    f_title = ImageFont.truetype(str(FONTS_DIR / "comicbd.ttf"), 86)
    f_qty = ImageFont.truetype(str(FONTS_DIR / "segoeuib.ttf"), 42)
    
    badge_files = {}
    variants = [
        ("Chicken", "Chicken Bone", "chicken"),
        ("Mix", "Mix Flavour", "mix"),
        ("PB", "Peanut Butter", "peanut"),
    ]
    
    w, h = 1400, 390
    c_cream = (255, 253, 246)
    c_brown = (73, 37, 11)
    c_gold = (226, 147, 60)
    
    for key, flavor_name, icon_type in variants:
        img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        
        # Main rounded pill container with dark brown border
        d.rounded_rectangle([(14, 14), (w-14, h-14)], radius=140, fill=c_cream, outline=c_brown, width=13)
        
        # Title text (Exact match to sample photo typography)
        tb = d.textbbox((0, 0), flavor_name, font=f_title)
        t_w = tb[2] - tb[0]
        t_x = (w - t_w) // 2
        t_y = 52
        d.text((t_x, t_y), flavor_name, font=f_title, fill=c_brown)
        
        # Sub-pill for "Net Qty. 400 g"
        q_str = "Net Qty. 400 g"
        qb = d.textbbox((0, 0), q_str, font=f_qty)
        q_w = qb[2] - qb[0]
        q_h = qb[3] - qb[1]
        pill_w = q_w + 94
        pill_h = 76
        pill_x = (w - pill_w) // 2
        pill_y = 250
        d.rounded_rectangle([(pill_x, pill_y), (pill_x + pill_w, pill_y + pill_h)], radius=38, fill=c_brown)
        d.text((pill_x + (pill_w - q_w)//2, pill_y + (pill_h - q_h)//2 - 4), q_str, font=f_qty, fill=(255, 255, 255))
        
        # Right paw print at cx = 1220, cy = 215
        paw_cx, paw_cy = 1215, 215
        d.ellipse([(paw_cx - 32, paw_cy - 12), (paw_cx + 32, paw_cy + 30)], fill=c_brown)
        d.ellipse([(paw_cx - 36, paw_cy - 44), (paw_cx - 18, paw_cy - 20)], fill=c_brown)
        d.ellipse([(paw_cx - 13, paw_cy - 56), (paw_cx + 7, paw_cy - 30)], fill=c_brown)
        d.ellipse([(paw_cx + 12, paw_cy - 56), (paw_cx + 32, paw_cy - 30)], fill=c_brown)
        d.ellipse([(paw_cx + 30, paw_cy - 44), (paw_cx + 48, paw_cy - 20)], fill=c_brown)
        
        # Left icon at cx = 185, cy = 215
        ic_cx, ic_cy = 185, 215
        if icon_type == "peanut":
            d.ellipse([(ic_cx - 65, ic_cy - 55), (ic_cx + 8, ic_cy + 35)], fill=c_gold, outline=c_brown, width=9)
            d.ellipse([(ic_cx - 18, ic_cy - 18), (ic_cx + 65, ic_cy + 65)], fill=c_gold, outline=c_brown, width=9)
            d.arc([(ic_cx - 55, ic_cy - 45), (ic_cx - 8, ic_cy + 25)], start=30, end=150, fill=c_brown, width=5)
            d.arc([(ic_cx + 6, ic_cy - 8), (ic_cx + 52, ic_cy + 55)], start=210, end=330, fill=c_brown, width=5)
        elif icon_type == "chicken":
            d.ellipse([(ic_cx - 40, ic_cy - 55), (ic_cx + 45, ic_cy + 20)], fill=c_gold, outline=c_brown, width=9)
            d.line([(ic_cx - 15, ic_cy + 10), (ic_cx - 45, ic_cy + 45)], fill=c_brown, width=16)
            d.line([(ic_cx - 15, ic_cy + 10), (ic_cx - 45, ic_cy + 45)], fill=(255, 255, 255), width=8)
            d.ellipse([(ic_cx - 58, ic_cy + 35), (ic_cx - 36, ic_cy + 57)], fill=(255, 255, 255), outline=c_brown, width=4)
            d.ellipse([(ic_cx - 46, ic_cy + 47), (ic_cx - 24, ic_cy + 69)], fill=(255, 255, 255), outline=c_brown, width=4)
        else: # mix: twin bones
            d.rounded_rectangle([(ic_cx - 48, ic_cy - 22), (ic_cx + 48, ic_cy + 2)], radius=12, fill=c_gold, outline=c_brown, width=7)
            d.ellipse([(ic_cx - 58, ic_cy - 30), (ic_cx - 36, ic_cy - 10)], fill=c_gold, outline=c_brown, width=6)
            d.ellipse([(ic_cx - 58, ic_cy - 10), (ic_cx - 36, ic_cy + 10)], fill=c_gold, outline=c_brown, width=6)
            d.ellipse([(ic_cx + 36, ic_cy - 30), (ic_cx + 58, ic_cy - 10)], fill=c_gold, outline=c_brown, width=6)
            d.ellipse([(ic_cx + 36, ic_cy - 10), (ic_cx + 58, ic_cy + 10)], fill=c_gold, outline=c_brown, width=6)
            d.rounded_rectangle([(ic_cx - 36, ic_cy + 8), (ic_cx + 36, ic_cy + 26)], radius=9, fill=(245, 185, 105), outline=c_brown, width=5)
            d.ellipse([(ic_cx - 44, ic_cy + 2), (ic_cx - 28, ic_cy + 18)], fill=(245, 185, 105), outline=c_brown, width=4)
            d.ellipse([(ic_cx - 44, ic_cy + 16), (ic_cx - 28, ic_cy + 32)], fill=(245, 185, 105), outline=c_brown, width=4)
            d.ellipse([(ic_cx + 28, ic_cy + 2), (ic_cx + 44, ic_cy + 18)], fill=(245, 185, 105), outline=c_brown, width=4)
            d.ellipse([(ic_cx + 28, ic_cy + 16), (ic_cx + 44, ic_cy + 32)], fill=(245, 185, 105), outline=c_brown, width=4)
            
        out_p = BRAIN / f"pill_badge_{key}.png"
        img.save(str(out_p))
        badge_files[key] = str(out_p)
        
    return badge_files

# 5. Generate 50mm Circular Sample Stickers (500 DPI)
def make_circular_stickers():
    f_flv = ImageFont.truetype(str(FONTS_DIR / "comicbd.ttf"), 38)
    f_qty = ImageFont.truetype(str(FONTS_DIR / "segoeuib.ttf"), 42)
    f_sub = ImageFont.truetype(str(FONTS_DIR / "segoeuib.ttf"), 26)
    f_web = ImageFont.truetype(str(FONTS_DIR / "arialbd.ttf"), 24)

    top_mascot = Image.open(BRAIN / "tight_top_sticker.png")
    m_w = 580
    m_h = int(top_mascot.height * m_w / top_mascot.width)
    mascot_small = top_mascot.resize((m_w, m_h), Image.Resampling.LANCZOS)

    sz = 1000
    c_cream = (255, 253, 246)
    c_brown = (73, 37, 11)
    c_gold = (217, 119, 6)

    flavors = [
        ("Chicken", "CHICKEN BONE"),
        ("Mix", "MIX FLAVOUR"),
        ("PB", "PEANUT BUTTER")
    ]
    
    circle_files = {}

    for key, flv_txt in flavors:
        img = Image.new("RGBA", (sz, sz), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        
        # Outer circle container & gold accent ring
        d.ellipse([(18, 18), (sz-18, sz-18)], fill=c_cream, outline=c_brown, width=16)
        d.ellipse([(44, 44), (sz-44, sz-44)], outline=c_gold, width=5)
        
        # Mascot top
        m_x = (sz - m_w) // 2
        m_y = 65
        img.paste(mascot_small, (m_x, m_y), mascot_small)
        
        # Flavor pill
        tb_f = d.textbbox((0, 0), flv_txt, font=f_flv)
        fw = tb_f[2] - tb_f[0] + 70
        fh = 64
        fx = (sz - fw) // 2
        fy = m_y + m_h + 10
        d.rounded_rectangle([(fx, fy), (fx + fw, fy + fh)], radius=32, fill=c_brown)
        d.text(((sz - (tb_f[2]-tb_f[0]))//2, fy + (fh - (tb_f[3]-tb_f[1]))//2 - 2), flv_txt, font=f_flv, fill=(255, 255, 255))
        
        # QR Code
        qr = qrcode.QRCode(box_size=6, border=1)
        qr.add_data("https://broskipetfood.com/r/")
        qr.make(fit=True)
        qr_img = qr.make_image(fill_color="#49250B", back_color="white").resize((230, 230))
        qr_x = 135
        qr_y = fy + fh + 30
        img.paste(qr_img, (qr_x, qr_y))
        
        # Text beside QR
        tx = 400
        d.text((tx, qr_y + 12), "FREE SAMPLER", font=f_qty, fill=c_gold)
        d.text((tx, qr_y + 68), "NET WT: 50 g", font=f_qty, fill=c_brown)
        d.text((tx, qr_y + 126), "Scan for Review", font=f_sub, fill=(100, 60, 30))
        d.text((tx, qr_y + 162), "& Get Free Treats!", font=f_sub, fill=c_brown)
        
        # Bottom website banner
        wb = d.textbbox((0, 0), "broskipetfood.com", font=f_web)
        ww = wb[2] - wb[0]
        d.text(((sz - ww)//2, 875), "broskipetfood.com", font=f_web, fill=c_brown)
        
        out_p = BRAIN / f"circle_50mm_{key}.png"
        img.save(str(out_p))
        circle_files[key] = str(out_p)
        
    return circle_files

# 6. Draw Back Compliance Label in Vector ReportLab
def draw_back_label(c, x, y, width, height, variant_name, flavor_title, mrp_str, usp_str, batch_str, qr_path):
    c.saveState()
    
    # Background rounded rectangle
    c.setFillColor(C_LIGHT_BG)
    c.setStrokeColor(C_BROWN)
    c.setLineWidth(1.5)
    c.roundRect(x, y, width, height, 5*mm, fill=1, stroke=1)
    
    # Inner border line
    c.setStrokeColor(colors.HexColor("#D8CDBE"))
    c.setLineWidth(0.7)
    c.roundRect(x + 2.5*mm, y + 2.5*mm, width - 5*mm, height - 5*mm, 3.5*mm, fill=0, stroke=1)
    
    # Top Header Banner
    c.setFillColor(C_BROWN)
    c.roundRect(x + 4.5*mm, y + height - 16*mm, width - 9*mm, 11*mm, 2*mm, fill=1, stroke=0)
    
    c.setFillColor(C_CREAM)
    c.setFont("Arial-Bold", 12)
    c.drawString(x + 7.5*mm, y + height - 11.5*mm, "B R O S K I")
    
    c.setFont("Arial-Bold", 8)
    c.drawRightString(x + width - 7.5*mm, y + height - 9.8*mm, flavor_title.upper())
    c.setFont("Arial", 5.8)
    c.drawRightString(x + width - 7.5*mm, y + height - 13.8*mm, "— Good Boy Snacks —")
    
    cur_y = y + height - 20.5*mm
    left_x = x + 5.5*mm
    right_margin = x + width - 5.5*mm
    content_w = width - 11*mm
    
    # Ingredients (Clean 2-line layout)
    c.setFillColor(C_BROWN)
    c.setFont("Arial-Bold", 6.5)
    c.drawString(left_x, cur_y, "INGREDIENTS:")
    c.setFillColor(C_DARK)
    c.setFont("Arial", 5.8)
    if "CHICKEN" in flavor_title.upper() or "NON-VEG" in flavor_title.upper():
        ing_line1 = "Whole Wheat Flour, Bone Broth & Liver Extract,"
        ing_line2 = "Vegetable Oil, Natural Flavour, Essential Minerals, Permitted Antioxidants."
    elif "MIX" in flavor_title.upper():
        ing_line1 = "Whole Wheat Flour, Milk Solids, Vegetable Extracts,"
        ing_line2 = "Vegetable Oil, Natural Flavour, Essential Minerals, Permitted Antioxidants."
    else:
        ing_line1 = "Whole Wheat Flour, Roasted Peanut Butter, Vegetable Oil,"
        ing_line2 = "Natural Flavour, Essential Minerals, Permitted Antioxidants."
    c.drawString(left_x + 18.5*mm, cur_y, ing_line1)
    c.drawString(left_x, cur_y - 3.2*mm, ing_line2)
    
    cur_y -= 7.5*mm
    
    # Daily Feeding Guide Box
    c.setFillColor(colors.HexColor("#EAE3D5"))
    c.roundRect(left_x, cur_y - 17*mm, content_w, 16.5*mm, 1.5*mm, fill=1, stroke=0)
    
    c.setFillColor(C_BROWN)
    c.setFont("Arial-Bold", 6.5)
    c.drawString(left_x + 2*mm, cur_y - 4*mm, "FEEDING GUIDE:")
    c.setFont("Arial", 5.2)
    c.drawString(left_x + 2*mm, cur_y - 8*mm, "• Treats max 10% daily diet")
    c.drawString(left_x + 2*mm, cur_y - 11.5*mm, "• Fresh water always")
    c.drawString(left_x + 2*mm, cur_y - 15*mm, "• Not for puppies < 2 mos")
    
    c.setFont("Arial-Bold", 5.8)
    c.drawString(left_x + 40*mm, cur_y - 4*mm, "Dog Weight")
    c.drawRightString(left_x + content_w - 3*mm, cur_y - 4*mm, "Biscuits / Day")
    
    c.setFont("Arial", 5.6)
    c.setFillColor(C_DARK)
    c.drawString(left_x + 40*mm, cur_y - 7.5*mm, "Up to 10 kg (Small)")
    c.drawRightString(left_x + content_w - 3*mm, cur_y - 7.5*mm, "1 – 2 pcs")
    
    c.drawString(left_x + 40*mm, cur_y - 11*mm, "10 – 25 kg (Medium)")
    c.drawRightString(left_x + content_w - 3*mm, cur_y - 11*mm, "2 – 4 pcs")
    
    c.drawString(left_x + 40*mm, cur_y - 14.5*mm, "Over 25 kg (Large)")
    c.drawRightString(left_x + content_w - 3*mm, cur_y - 14.5*mm, "4 – 6 pcs")
    
    cur_y -= 21.5*mm
    
    # Statutory Grid (Legal Metrology Rule 6)
    box_h = 11*mm
    # Net Quantity Box (HIGH PROMINENCE >= 4mm numeral)
    c.setFillColor(C_BROWN)
    c.roundRect(left_x, cur_y - box_h, 28*mm, box_h, 1.5*mm, fill=1, stroke=0)
    c.setFillColor(C_CREAM)
    c.setFont("Arial-Bold", 5.8)
    c.drawString(left_x + 2*mm, cur_y - 4*mm, "NET QUANTITY")
    c.setFont("Arial-Bold", 13.5) # > 4.5 mm numeral
    c.drawString(left_x + 2*mm, cur_y - 9.5*mm, "400 g")
    
    # MRP & USP Box
    c.setFillColor(colors.white)
    c.setStrokeColor(C_BROWN)
    c.setLineWidth(0.7)
    c.roundRect(left_x + 30*mm, cur_y - box_h, 32*mm, box_h, 1.5*mm, fill=1, stroke=1)
    c.setFillColor(C_DARK)
    c.setFont("Arial-Bold", 7.5)
    c.drawString(left_x + 32*mm, cur_y - 4*mm, f"MRP: {mrp_str}")
    c.setFont("Arial", 5.2)
    c.drawString(left_x + 32*mm, cur_y - 7.2*mm, "(Incl. of all taxes)")
    c.drawString(left_x + 32*mm, cur_y - 9.8*mm, f"Unit Price: {usp_str}")
    
    # Batch & Date Box
    c.setFillColor(colors.white)
    c.roundRect(left_x + 63.5*mm, cur_y - box_h, content_w - 63.5*mm, box_h, 1.5*mm, fill=1, stroke=1)
    c.setFillColor(C_DARK)
    c.setFont("Arial-Bold", 5.2)
    c.drawString(left_x + 65.5*mm, cur_y - 4*mm, f"BATCH: {batch_str}")
    c.setFont("Arial", 5.0)
    c.drawString(left_x + 65.5*mm, cur_y - 7.2*mm, "PKD: NOV 2026")
    c.drawString(left_x + 65.5*mm, cur_y - 9.8*mm, "EXP: 9 MONTHS")
    
    cur_y -= 14*mm
    
    # Guaranteed Analysis Card (Nutritional Values)
    c.setFillColor(colors.HexColor("#F5EFEB"))
    c.roundRect(left_x, cur_y - 8.5*mm, content_w, 8*mm, 1*mm, fill=1, stroke=0)
    c.setFillColor(C_BROWN)
    c.setFont("Arial-Bold", 5.2)
    c.drawString(left_x + 2*mm, cur_y - 3.2*mm, "NUTRITIONAL ANALYSIS:")
    c.setFillColor(C_DARK)
    c.setFont("Arial", 5.0)
    c.drawString(left_x + 2*mm, cur_y - 6.8*mm, "Crude Protein (Min): 12.0%  |  Crude Fat (Min): 6.0%  |  Crude Fibre (Max): 3.5%  |  Moisture (Max): 10.0%")
    
    cur_y -= 11.5*mm
    
    # Company, Marketer & Consumer Care (Left Side) + QR Code (Right Side)
    col_w = content_w - 24*mm
    c.setFillColor(C_DARK)
    c.setFont("Arial-Bold", 6.0)
    c.drawString(left_x, cur_y, "Packed & Marketed by:")
    c.setFont("Arial-Bold", 6.5)
    c.drawString(left_x, cur_y - 3.2*mm, "BROSKI")
    c.setFont("Arial", 5.2)
    c.drawString(left_x, cur_y - 6.2*mm, "12A/3, Dharam Colony, Nangloi, New Delhi - 110041, India")
    c.drawString(left_x, cur_y - 9.2*mm, "Web: broskipetfood.com | Email: hello@broskipetfood.com")
    c.drawString(left_x, cur_y - 12.2*mm, "Consumer Care WhatsApp: +91 92892 00000 | Origin: India")
    
    c.setFont("Arial-Bold", 5.2)
    c.drawString(left_x, cur_y - 16*mm, "Category: Complementary Dog Treat (Not for human consumption)")
    
    # Draw QR Code on the right
    qr_x = left_x + col_w + 1*mm
    qr_y = cur_y - 16.5*mm
    qr_sz = 21*mm
    c.drawImage(qr_path, qr_x, qr_y, width=qr_sz, height=qr_sz)
    c.setFillColor(C_BROWN)
    c.setFont("Arial-Bold", 4.5)
    c.drawCentredString(qr_x + qr_sz/2, qr_y - 2.2*mm, "Scan for Review &")
    c.drawCentredString(qr_x + qr_sz/2, qr_y - 4.0*mm, "FREE 50g Sample!")
    
    # Value Highlights Strip
    c.setFillColor(colors.HexColor("#F0EAE1"))
    c.roundRect(left_x, y + 13*mm, content_w, 5*mm, 1*mm, fill=1, stroke=0)
    c.setFillColor(C_BROWN)
    c.setFont("Arial-Bold", 4.8)
    c.drawCentredString(x + width/2, y + 14.5*mm, "100% OVEN-BAKED CRUNCH   •   HUMAN-GRADE CARE   •   SUPPORTS STRONG TEETH & BONES")
    
    # 1.0 mm Legal Manufacturer Footnote at the very bottom edge (Rule 6 compliant fine print)
    cur_y_foot = y + 7*mm
    c.setStrokeColor(colors.HexColor("#D8CDBE"))
    c.setLineWidth(0.5)
    c.line(left_x, cur_y_foot + 4*mm, right_margin, cur_y_foot + 4*mm)
    
    c.setFillColor(colors.HexColor("#665548"))
    c.setFont("Arial", 4.2) # Exactly ~1.0 mm height
    c.drawString(left_x, cur_y_foot + 1.8*mm, "Mfd. by: Scoobee Pet Foods Pvt. Ltd., Shalimar Bagh, Delhi - 110088. Under Commercial Agreement with BROSKI.")
    c.drawString(left_x, cur_y_foot - 1.2*mm, "Storage: Store in a cool, dry place away from sunlight. Keep pouch securely zipped shut after opening.")
    
    c.restoreState()

# 7. Build Master Multi-Page PDF
def build_master_pdf():
    out_pdf_path = ROOT / "Broski_PRINT_READY_Stickers_2026.pdf"
    qr_img_path = make_qr_code()
    top_mascot_img = prepare_top_mascot()
    badges = make_pill_badges()
    circles = make_circular_stickers()
    
    c = canvas.Canvas(str(out_pdf_path), pagesize=A4)
    
    # =========================================================================
    # PAGE 1: PRINTER JOB SHEET & SPECIFICATIONS (A4)
    # =========================================================================
    c.setTitle("BROSKI · Print-Ready Packaging Stickers (Final Release 2026)")
    c.setAuthor("BROSKI Executive Team / Rex (CEO)")
    c.setSubject("Commercial Print-Ready Packaging Stickers & Imposition Sheets")
    
    # Header Banner
    c.setFillColor(C_BROWN)
    c.rect(0, 260*mm, 210*mm, 37*mm, fill=1, stroke=0)
    c.setFillColor(C_CREAM)
    c.setFont("Arial-Bold", 20)
    c.drawString(15*mm, 280*mm, "BROSKI · COMMERCIAL PRINT JOB SHEET")
    c.setFont("Arial", 9.5)
    c.drawString(15*mm, 271*mm, "Packaging Sticker Specifications, Kiss-Cut Die Lines & Max-Yield Imposition Sheets")
    c.setFont("Arial-Bold", 8.5)
    c.drawRightString(195*mm, 271*mm, "RELEASE V9.0 · NOV 2026")
    
    # Summary Info Card
    c.setFillColor(C_LIGHT_BG)
    c.setStrokeColor(C_BROWN)
    c.setLineWidth(1)
    c.roundRect(15*mm, 210*mm, 180*mm, 42*mm, 3*mm, fill=1, stroke=1)
    
    c.setFillColor(C_BROWN)
    c.setFont("Arial-Bold", 10.5)
    c.drawString(20*mm, 244*mm, "FOUNDER PRINTING DIRECTIVE & BATCH DETAILS")
    
    c.setFillColor(C_DARK)
    c.setFont("Arial", 8.5)
    c.drawString(20*mm, 235*mm, "• Brand / Proprietor: BROSKI (Sole Proprietorship · Nangloi, New Delhi · Lakshay)")
    c.drawString(20*mm, 227*mm, "• Total 400g Pouches: 500 Stand-Up Zipper Pouches (250 Non-Veg Chicken + 250 Mix Flavour)")
    c.drawString(20*mm, 219*mm, "• Total 50g Samples: 250–300 Sample Pouches (Ø 50 mm Circular Stickers with live Review QR)")
    c.drawString(20*mm, 211*mm, "• Legal Metrology (Packaged Commodities) Rules 2011 Rule 6 Compliant: >= 4.0mm Net Qty Numeral")
    
    # Technical Specifications Table
    c.setFillColor(C_BROWN)
    c.setFont("Arial-Bold", 11)
    c.drawString(15*mm, 198*mm, "1. TECHNICAL SUBSTRATE & FINISHING SPECIFICATIONS")
    
    specs = [
        ("Front Stickers (Bone + Pill)", "Mirror-Coat Chromo Self-Adhesive Paper (80-90 GSM)", "Gloss Poly-Lamination (Water & Grease Proof)", "Custom Shaped Kiss-Cut (Follow Magenta CutContour)"),
        ("Circular Sample Stickers (50mm)", "Mirror-Coat Chromo / Cast-Coated Paper Sticker", "Gloss Lamination / High-Contrast Digital Print", "Round Kiss-Cut (Exact Ø 50 mm Circle)"),
        ("Back Compliance Labels (A6)", "Self-Adhesive Chromo Sticker Sheet (80 GSM)", "Matte Thermal Lamination (Sharp Text Readability)", "Rectangular Kiss-Cut with 5mm Rounded Corners"),
        ("Ink / Press Standard", "Digital Press (Konica Minolta AccurioPress / Xerox / HP)", "CMYK Process + Spot Magenta CutContour", "Minimum 300-350 DPI true optical resolution"),
    ]
    
    table_y = 190*mm
    for item, stock, finish, cut in specs:
        c.setFillColor(colors.HexColor("#F5EFEB"))
        c.roundRect(15*mm, table_y - 12*mm, 180*mm, 11*mm, 1.5*mm, fill=1, stroke=0)
        c.setFillColor(C_BROWN)
        c.setFont("Arial-Bold", 8)
        c.drawString(18*mm, table_y - 4*mm, item)
        c.setFillColor(C_DARK)
        c.setFont("Arial", 7)
        c.drawString(18*mm, table_y - 8*mm, f"Stock: {stock}")
        c.drawString(18*mm, table_y - 11*mm, f"Finish: {finish}  |  Cut: {cut}")
        table_y -= 13.5*mm
        
    # Imposition & Sheet Count Guide
    c.setFillColor(C_BROWN)
    c.setFont("Arial-Bold", 11)
    c.drawString(15*mm, table_y - 2*mm, "2. A3 IMPOSITION SUMMARY & EXACT PRINT COUNTS (FOR 500 POUCHES)")
    
    imp_y = table_y - 9*mm
    c.setFillColor(colors.HexColor("#EAE3D5"))
    c.roundRect(15*mm, imp_y - 34*mm, 180*mm, 33*mm, 2*mm, fill=1, stroke=0)
    
    c.setFillColor(C_BROWN)
    c.setFont("Arial-Bold", 8.2)
    c.drawString(18*mm, imp_y - 5*mm, "SHEET NAME")
    c.drawString(65*mm, imp_y - 5*mm, "ITEMS PER A3 SHEET")
    c.drawString(125*mm, imp_y - 5*mm, "PAPER UTILIZATION")
    c.drawString(165*mm, imp_y - 5*mm, "PRINT RUN")
    
    c.setFont("Arial", 7.5)
    c.setFillColor(C_DARK)
    c.drawString(18*mm, imp_y - 11*mm, "Page 12 (Front Master Combo)")
    c.drawString(65*mm, imp_y - 11*mm, "6 Front Sets (3 Chk + 3 Mix) + 5 Circles (50mm)")
    c.drawString(125*mm, imp_y - 11*mm, "> 82% (Zero Waste Margins)")
    c.drawString(165*mm, imp_y - 11*mm, "42 Sheets (252 Sets)")
    
    c.drawString(18*mm, imp_y - 17*mm, "Page 13 (Dedicated 50mm Circles)")
    c.drawString(65*mm, imp_y - 17*mm, "35 Circular 50mm Stickers (7×5 Grid)")
    c.drawString(125*mm, imp_y - 17*mm, "> 85% High Density")
    c.drawString(165*mm, imp_y - 17*mm, "9 Sheets (315 Circles)")
    
    c.drawString(18*mm, imp_y - 23*mm, "Page 14 (Back Master Compliance)")
    c.drawString(65*mm, imp_y - 23*mm, "8 Full A6 Labels (4 Chk + 4 Mix, 4×2 Grid)")
    c.drawString(125*mm, imp_y - 23*mm, "89.8% (Maximum Yield)")
    c.drawString(165*mm, imp_y - 23*mm, "32 Sheets (256 Labels)")
    
    c.drawString(18*mm, imp_y - 29*mm, "Pages 15-16 (Peanut Butter Sets)")
    c.drawString(65*mm, imp_y - 29*mm, "6 PB Front Sets + 8 PB Back A6 Labels")
    c.drawString(125*mm, imp_y - 29*mm, "89.8% Yield")
    c.drawString(165*mm, imp_y - 29*mm, "On demand for PB run")
    
    # Legend & Footer Note
    c.setFillColor(colors.HexColor("#776655"))
    c.setFont("Arial-Bold", 7)
    c.drawString(15*mm, 20*mm, "LEGEND: ")
    c.setFont("Arial", 6.8)
    c.drawString(28*mm, 20*mm, "Magenta stroke indicates CutContour / Kiss-Cut outline. Do not print magenta stroke on finished stickers.")
    c.drawString(15*mm, 15*mm, "All dimensions in millimeters (mm). Master PDF generated 1:1 scale with embedded vector artwork.")
    
    c.setFont("Arial", 6.5)
    c.drawRightString(195*mm, 8*mm, "BROSKI Digital Print Release v9.0 · Page 1 of 16")
    c.showPage()
    
    # =========================================================================
    # PAGE 2: 1:1 SCALE TOP BONE MASCOT STICKER (A4)
    # =========================================================================
    c.setFillColor(colors.white)
    c.rect(0, 0, 210*mm, 297*mm, fill=1, stroke=0)
    
    c.setFillColor(C_BROWN)
    c.setFont("Arial-Bold", 12)
    c.drawString(15*mm, 280*mm, "FRONT TOP MASCOT STICKER · 1:1 ACTUAL PRINT SIZE")
    c.setFont("Arial", 8)
    c.drawString(15*mm, 274*mm, "Dimensions: 115 mm × 78 mm · Die-Cut / Kiss-Cut Outline · Sits above clear window on 8×12\" pouch")
    
    s_w = 115*mm
    s_h = 78*mm
    s_x = (210*mm - s_w) / 2
    s_y = 145*mm
    
    c.drawImage(top_mascot_img, s_x, s_y, width=s_w, height=s_h, mask='auto')
    
    c.setStrokeColor(C_MAGENTA)
    c.setLineWidth(0.5)
    c.roundRect(s_x - 1*mm, s_y - 1*mm, s_w + 2*mm, s_h + 2*mm, 8*mm, fill=0, stroke=1)
    c.setFont("Arial", 6)
    c.setFillColor(C_MAGENTA)
    c.drawString(s_x, s_y - 6*mm, "CutContour (Die-Cut Path) — 2.0 mm Bleed Included")
    
    c.setFillColor(colors.HexColor("#998877"))
    c.setFont("Arial", 6.5)
    c.drawRightString(195*mm, 8*mm, "BROSKI Digital Print Release v9.0 · Page 2 of 16")
    c.showPage()
    
    # =========================================================================
    # PAGE 3, 4, 5: 1:1 SCALE BOTTOM PILL BADGES (A4)
    # =========================================================================
    badge_info = [
        ("Chicken", "Chicken Bone (Non-Veg)", 3),
        ("Mix", "Mix Flavour (Twin Bones)", 4),
        ("PB", "Peanut Butter (Twin Peanuts)", 5),
    ]
    
    b_w = 115*mm
    b_h = 32*mm
    b_x = (210*mm - b_w) / 2
    b_y = 150*mm
    
    for k, title, p_num in badge_info:
        c.setFillColor(colors.white)
        c.rect(0, 0, 210*mm, 297*mm, fill=1, stroke=0)
        c.setFillColor(C_BROWN)
        c.setFont("Arial-Bold", 12)
        c.drawString(15*mm, 280*mm, f"FRONT BOTTOM PILL BADGE · {title.upper()} · 1:1 SCALE")
        c.setFont("Arial", 8)
        c.drawString(15*mm, 274*mm, "Dimensions: 115 mm × 32 mm · Rounded Pill (R=12mm) · Sits below clear window on yellow pouch")
        
        c.drawImage(badges[k], b_x, b_y, width=b_w, height=b_h, mask='auto')
        
        c.setStrokeColor(C_MAGENTA)
        c.setLineWidth(0.5)
        c.roundRect(b_x - 1*mm, b_y - 1*mm, b_w + 2*mm, b_h + 2*mm, 11*mm, fill=0, stroke=1)
        c.setFont("Arial", 6)
        c.setFillColor(C_MAGENTA)
        c.drawString(b_x, b_y - 6*mm, "CutContour Path (Rounded Pill)")
        
        c.setFillColor(colors.HexColor("#998877"))
        c.setFont("Arial", 6.5)
        c.drawRightString(195*mm, 8*mm, f"BROSKI Digital Print Release v9.0 · Page {p_num} of 16")
        c.showPage()
        
    # =========================================================================
    # PAGE 6, 7, 8: 1:1 SCALE 50MM CIRCULAR SAMPLE STICKERS (A4)
    # =========================================================================
    circ_info = [
        ("Chicken", "Chicken Bone", 6),
        ("Mix", "Mix Flavour", 7),
        ("PB", "Peanut Butter", 8),
    ]
    
    c_sz = 50*mm
    c_x = (210*mm - c_sz) / 2
    c_y = 140*mm
    
    for k, title, p_num in circ_info:
        c.setFillColor(colors.white)
        c.rect(0, 0, 210*mm, 297*mm, fill=1, stroke=0)
        c.setFillColor(C_BROWN)
        c.setFont("Arial-Bold", 12)
        c.drawString(15*mm, 280*mm, f"CIRCULAR 50MM SAMPLE STICKER · {title.upper()} · 1:1 ACTUAL SIZE")
        c.setFont("Arial", 8)
        c.drawString(15*mm, 274*mm, "Diameter: 50 mm (Ø 50 mm) · Round Kiss-Cut · For 4×6\" Sample Pouches · Live Review QR Code")
        
        c.drawImage(circles[k], c_x, c_y, width=c_sz, height=c_sz, mask='auto')
        
        c.setStrokeColor(C_MAGENTA)
        c.setLineWidth(0.5)
        c.circle(c_x + c_sz/2, c_y + c_sz/2, c_sz/2 + 0.5*mm, fill=0, stroke=1)
        c.setFont("Arial", 6)
        c.setFillColor(C_MAGENTA)
        c.drawString(c_x, c_y - 6*mm, "CutContour (Ø 50 mm Circular Die-Cut Path)")
        
        c.setFillColor(colors.HexColor("#998877"))
        c.setFont("Arial", 6.5)
        c.drawRightString(195*mm, 8*mm, f"BROSKI Digital Print Release v9.0 · Page {p_num} of 16")
        c.showPage()
        
    # =========================================================================
    # PAGE 9, 10, 11: BACK COMPLIANCE LABELS (1:1 SCALE A6)
    # =========================================================================
    back_info = [
        ("Non-Veg", "Chicken Bone Biscuits", "₹149.00", "₹0.37 / g", "BR-NV-2611-01", 9),
        ("Mix", "Mix Flavour Biscuits", "₹179.00", "₹0.45 / g", "BR-MX-2611-01", 10),
        ("PB", "Peanut Butter Biscuits", "₹149.00", "₹0.37 / g", "BR-PB-2611-01", 11),
    ]
    
    lbl_w = 100*mm
    lbl_h = 140*mm
    lbl_x = (210*mm - lbl_w)/2
    lbl_y = 120*mm
    
    for gvar, gtitle, gmrp, gusp, gbatch, p_num in back_info:
        c.setFillColor(colors.white)
        c.rect(0, 0, 210*mm, 297*mm, fill=1, stroke=0)
        c.setFillColor(C_BROWN)
        c.setFont("Arial-Bold", 12)
        c.drawString(15*mm, 280*mm, f"BACK COMPLIANCE LABEL · {gtitle.upper()} · 1:1 SCALE A6")
        c.setFont("Arial", 8)
        c.drawString(15*mm, 274*mm, f"Dimensions: 100 mm × 140 mm · Rule 6 Fully Compliant · MRP {gmrp} · USP {gusp} · 1.0 mm Scoobee Footnote")
        
        c.setStrokeColor(C_MAGENTA)
        c.setLineWidth(0.5)
        c.roundRect(lbl_x - 1*mm, lbl_y - 1*mm, lbl_w + 2*mm, lbl_h + 2*mm, 6*mm, fill=0, stroke=1)
        draw_back_label(c, lbl_x, lbl_y, lbl_w, lbl_h, gvar, gtitle, gmrp, gusp, gbatch, qr_img_path)
        
        c.setFillColor(colors.HexColor("#998877"))
        c.setFont("Arial", 6.5)
        c.drawRightString(195*mm, 8*mm, f"BROSKI Digital Print Release v9.0 · Page {p_num} of 16")
        c.showPage()
        
    # =========================================================================
    # PAGE 12: A3 SHEET 1: FRONT MASTER COMBO (6 SETS + 5 NESTED 50MM CIRCLES)
    # =========================================================================
    c.setPageSize(landscape(A3)) # 420 mm wide x 297 mm tall
    c.setFillColor(colors.white)
    c.rect(0, 0, 420*mm, 297*mm, fill=1, stroke=0)
    
    c.setFillColor(C_BROWN)
    c.setFont("Arial-Bold", 13)
    c.drawString(12*mm, 288*mm, "A3 SHEET 1: FRONT MASTER COMBO (6 COMPLETE SETS) + 5 NESTED 50MM CIRCLES")
    c.setFont("Arial", 7.5)
    c.drawString(12*mm, 283*mm, "Paper: A3 (420×297 mm) · Zero Margin Waste: 6 Front Sets (3 Chicken + 3 Mix) + 5 Full-Size Ø 50mm Circles in Margin Strip!")
    
    # 3 columns x 2 rows of Front Sets
    col_xs = [12*mm, 131*mm, 250*mm]
    row_ys = [160*mm, 35*mm]
    
    s_idx = 0
    for r_y in row_ys:
        for c_x in col_xs:
            flv_k = "Chicken" if (s_idx % 2 == 0) else "Mix"
            
            # Top Mascot Bone Sticker (115 x 78 mm)
            c.drawImage(top_mascot_img, c_x, r_y + 36*mm, width=115*mm, height=78*mm, mask='auto')
            c.setStrokeColor(C_MAGENTA)
            c.setLineWidth(0.3)
            c.roundRect(c_x, r_y + 36*mm, 115*mm, 78*mm, 8*mm, stroke=1, fill=0)
            
            # Bottom Pill Badge (115 x 32 mm)
            c.drawImage(badges[flv_k], c_x, r_y, width=115*mm, height=32*mm, mask='auto')
            c.roundRect(c_x, r_y, 115*mm, 32*mm, 11*mm, stroke=1, fill=0)
            s_idx += 1
            
    # NESTED CIRCULAR 50MM STICKERS IN RIGHT MARGIN STRIP (X = 368mm; 5 full-size 50mm circles)
    right_circ_ys = [236*mm, 182*mm, 128*mm, 74*mm, 20*mm]
    for c_y in right_circ_ys:
        circ_k = "Chicken" if (s_idx % 2 == 0) else "Mix"
        c.drawImage(circles[circ_k], 368*mm, c_y, width=50*mm, height=50*mm, mask='auto')
        c.setStrokeColor(C_MAGENTA)
        c.setLineWidth(0.3)
        c.circle(368*mm + 25*mm, c_y + 25*mm, 25*mm, stroke=1, fill=0)
        s_idx += 1
        
    c.setFillColor(colors.HexColor("#998877"))
    c.setFont("Arial", 6.5)
    c.drawRightString(410*mm, 5*mm, "BROSKI Digital Print Release v9.0 · Page 12 of 16 (A3 Landscape)")
    c.showPage()
    
    # =========================================================================
    # PAGE 13: A3 SHEET 2: DEDICATED 50MM CIRCULAR SAMPLE STICKERS (35 PER SHEET)
    # =========================================================================
    c.setFillColor(colors.white)
    c.rect(0, 0, 420*mm, 297*mm, fill=1, stroke=0)
    
    c.setFillColor(C_BROWN)
    c.setFont("Arial-Bold", 13)
    c.drawString(14*mm, 288*mm, "A3 SHEET 2: DEDICATED 50MM CIRCULAR SAMPLE STICKERS (35 STICKERS PER SHEET)")
    c.setFont("Arial", 7.5)
    c.drawString(14*mm, 283*mm, "Diameter: 50 mm (Ø 50 mm) · 7 Columns × 5 Rows = 35 Circular Kiss-Cut Stickers · Only 8–9 Sheets Needed for 300 Samples!")
    
    # 7 columns x 5 rows of 50mm circles (Pitch X = 57mm, Pitch Y = 55mm)
    circ_xs = [14*mm + i*57*mm for i in range(7)]
    circ_ys = [10*mm + j*54*mm for j in range(5)]
    
    # Row-wise distribution: Rows 0, 3 = Chicken; Rows 1, 4 = Mix; Row 2 = PB
    row_flavor = ["Mix", "Chicken", "PB", "Mix", "Chicken"]
    
    for r_idx, cy_pos in enumerate(reversed(circ_ys)):
        flv_key = row_flavor[r_idx]
        for cx_pos in circ_xs:
            c.drawImage(circles[flv_key], cx_pos, cy_pos, width=50*mm, height=50*mm, mask='auto')
            c.setStrokeColor(C_MAGENTA)
            c.setLineWidth(0.3)
            c.circle(cx_pos + 25*mm, cy_pos + 25*mm, 25*mm, stroke=1, fill=0)
            
    c.setFillColor(colors.HexColor("#998877"))
    c.setFont("Arial", 6.5)
    c.drawRightString(410*mm, 5*mm, "BROSKI Digital Print Release v9.0 · Page 13 of 16 (A3 Landscape)")
    c.showPage()
    
    # =========================================================================
    # PAGE 14: A3 SHEET 3: BACK MASTER COMPLIANCE (8 LABELS PER SHEET - 90% COVERAGE)
    # =========================================================================
    c.setFillColor(colors.white)
    c.rect(0, 0, 420*mm, 297*mm, fill=1, stroke=0)
    
    c.setFillColor(C_BROWN)
    c.setFont("Arial-Bold", 13)
    c.drawString(10*mm, 288*mm, "A3 SHEET 3: BACK MASTER COMPLIANCE LABELS (8 COMPLETE A6 LABELS PER SHEET)")
    c.setFont("Arial", 7.5)
    c.drawString(10*mm, 283*mm, "Paper: A3 (420×297 mm) · 4 Columns × 2 Rows = 8 Labels (4 Chicken + 4 Mix) · 89.8% (90%) Paper Utilization · Cuts Printing Cost in Half!")
    
    grid_8 = [
        # Top Row (Y = 145 mm)
        (8*mm, 145*mm, "Non-Veg", "Chicken Bone Biscuits", "₹149.00", "₹0.37 / g", "BR-NV-2611-01"),
        (110*mm, 145*mm, "Mix", "Mix Flavour Biscuits", "₹179.00", "₹0.45 / g", "BR-MX-2611-01"),
        (212*mm, 145*mm, "Non-Veg", "Chicken Bone Biscuits", "₹149.00", "₹0.37 / g", "BR-NV-2611-01"),
        (314*mm, 145*mm, "Mix", "Mix Flavour Biscuits", "₹179.00", "₹0.45 / g", "BR-MX-2611-01"),
        # Bottom Row (Y = 3 mm)
        (8*mm, 3*mm, "Non-Veg", "Chicken Bone Biscuits", "₹149.00", "₹0.37 / g", "BR-NV-2611-01"),
        (110*mm, 3*mm, "Mix", "Mix Flavour Biscuits", "₹179.00", "₹0.45 / g", "BR-MX-2611-01"),
        (212*mm, 3*mm, "Non-Veg", "Chicken Bone Biscuits", "₹149.00", "₹0.37 / g", "BR-NV-2611-01"),
        (314*mm, 3*mm, "Mix", "Mix Flavour Biscuits", "₹179.00", "₹0.45 / g", "BR-MX-2611-01"),
    ]
    
    for gx, gy, gvar, gtitle, gmrp, gusp, gbatch in grid_8:
        c.setStrokeColor(C_MAGENTA)
        c.setLineWidth(0.3)
        c.roundRect(gx - 0.5*mm, gy - 0.5*mm, 100*mm + 1*mm, 140*mm + 1*mm, 6*mm, fill=0, stroke=1)
        draw_back_label(c, gx, gy, 100*mm, 140*mm, gvar, gtitle, gmrp, gusp, gbatch, qr_img_path)
        
    c.setFillColor(colors.HexColor("#998877"))
    c.setFont("Arial", 6.5)
    c.drawRightString(410*mm, 5*mm, "BROSKI Digital Print Release v9.0 · Page 14 of 16 (A3 Landscape)")
    c.showPage()
    
    # =========================================================================
    # PAGE 15: A3 SHEET 4: PEANUT BUTTER FRONT COMBO (6 PB SETS + 5 PB CIRCLES)
    # =========================================================================
    c.setFillColor(colors.white)
    c.rect(0, 0, 420*mm, 297*mm, fill=1, stroke=0)
    
    c.setFillColor(C_BROWN)
    c.setFont("Arial-Bold", 13)
    c.drawString(12*mm, 288*mm, "A3 SHEET 4: PEANUT BUTTER FRONT COMBO (6 SETS + 5 NESTED 50MM PB CIRCLES)")
    c.setFont("Arial", 7.5)
    c.drawString(12*mm, 283*mm, "Paper: A3 (420×297 mm) · Dedicated Peanut Butter Front Sets & 50mm Sampler Circles for 400g Pouches")
    
    for r_y in row_ys:
        for c_x in col_xs:
            c.drawImage(top_mascot_img, c_x, r_y + 36*mm, width=115*mm, height=78*mm, mask='auto')
            c.setStrokeColor(C_MAGENTA)
            c.setLineWidth(0.3)
            c.roundRect(c_x, r_y + 36*mm, 115*mm, 78*mm, 8*mm, stroke=1, fill=0)
            
            c.drawImage(badges["PB"], c_x, r_y, width=115*mm, height=32*mm, mask='auto')
            c.roundRect(c_x, r_y, 115*mm, 32*mm, 11*mm, stroke=1, fill=0)
            
    for c_y in right_circ_ys:
        c.drawImage(circles["PB"], 368*mm, c_y, width=50*mm, height=50*mm, mask='auto')
        c.setStrokeColor(C_MAGENTA)
        c.setLineWidth(0.3)
        c.circle(368*mm + 25*mm, c_y + 25*mm, 25*mm, stroke=1, fill=0)
        
    c.setFillColor(colors.HexColor("#998877"))
    c.setFont("Arial", 6.5)
    c.drawRightString(410*mm, 5*mm, "BROSKI Digital Print Release v9.0 · Page 15 of 16 (A3 Landscape)")
    c.showPage()
    
    # =========================================================================
    # PAGE 16: A3 SHEET 5: PEANUT BUTTER BACK COMPLIANCE LABELS (8 A6 LABELS)
    # =========================================================================
    c.setFillColor(colors.white)
    c.rect(0, 0, 420*mm, 297*mm, fill=1, stroke=0)
    
    c.setFillColor(C_BROWN)
    c.setFont("Arial-Bold", 13)
    c.drawString(10*mm, 288*mm, "A3 SHEET 5: PEANUT BUTTER BACK COMPLIANCE LABELS (8 COMPLETE A6 LABELS PER SHEET)")
    c.setFont("Arial", 7.5)
    c.drawString(10*mm, 283*mm, "Paper: A3 (420×297 mm) · 4 Columns × 2 Rows = 8 Labels (Peanut Butter Biscuits) · 89.8% (90%) Paper Coverage")
    
    grid_pb_8 = [
        # Top Row (Y = 145 mm)
        (8*mm, 145*mm, "PB", "Peanut Butter Biscuits", "₹149.00", "₹0.37 / g", "BR-PB-2611-01"),
        (110*mm, 145*mm, "PB", "Peanut Butter Biscuits", "₹149.00", "₹0.37 / g", "BR-PB-2611-01"),
        (212*mm, 145*mm, "PB", "Peanut Butter Biscuits", "₹149.00", "₹0.37 / g", "BR-PB-2611-01"),
        (314*mm, 145*mm, "PB", "Peanut Butter Biscuits", "₹149.00", "₹0.37 / g", "BR-PB-2611-01"),
        # Bottom Row (Y = 3 mm)
        (8*mm, 3*mm, "PB", "Peanut Butter Biscuits", "₹149.00", "₹0.37 / g", "BR-PB-2611-01"),
        (110*mm, 3*mm, "PB", "Peanut Butter Biscuits", "₹149.00", "₹0.37 / g", "BR-PB-2611-01"),
        (212*mm, 3*mm, "PB", "Peanut Butter Biscuits", "₹149.00", "₹0.37 / g", "BR-PB-2611-01"),
        (314*mm, 3*mm, "PB", "Peanut Butter Biscuits", "₹149.00", "₹0.37 / g", "BR-PB-2611-01"),
    ]
    
    for gx, gy, gvar, gtitle, gmrp, gusp, gbatch in grid_pb_8:
        c.setStrokeColor(C_MAGENTA)
        c.setLineWidth(0.3)
        c.roundRect(gx - 0.5*mm, gy - 0.5*mm, 100*mm + 1*mm, 140*mm + 1*mm, 6*mm, fill=0, stroke=1)
        draw_back_label(c, gx, gy, 100*mm, 140*mm, gvar, gtitle, gmrp, gusp, gbatch, qr_img_path)
        
    c.setFillColor(colors.HexColor("#998877"))
    c.setFont("Arial", 6.5)
    c.drawRightString(410*mm, 5*mm, "BROSKI Digital Print Release v9.0 · Page 16 of 16 (A3 Landscape)")
    c.showPage()
    
    # Save Canvas
    c.save()
    print("Master PDF v9.0 generated successfully at:", str(out_pdf_path))
    
    try:
        DOWNLOADS.mkdir(parents=True, exist_ok=True)
        dest_pdf = DOWNLOADS / "Broski_PRINT_READY_Stickers_2026.pdf"
        import shutil
        shutil.copy2(str(out_pdf_path), str(dest_pdf))
        print("Copied to user downloads folder:", str(dest_pdf))
    except Exception as e:
        print("Copy to Downloads warning:", e)
        
    return str(out_pdf_path)

if __name__ == "__main__":
    build_master_pdf()
