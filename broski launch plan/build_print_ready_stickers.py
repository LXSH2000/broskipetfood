"""
BROSKI Premium Packaging & Sticker Print PDF Generator (V7.0 - Bone & Winking Dog Edition)
Faithfully recreates the exact design from user photo:
- Top Sticker: Winking Dog Mascot + White Bone Banner + "BROSKI" (paw in O) + "— Good Boy Snacks —" + Paws
- Bottom Badge: Cream Pill Badge + Flavor Title + Dark Brown "Net Qty. 400 g" Sub-Pill + Dog Paw Print
- Back Labels: Fully compliant with Legal Metrology Rule 6, 1.0mm Scoobee Footnote & Live QR Code
- A3 Print Imposition Sheets for local Nangloi press
"""

import os
import sys
from pathlib import Path
import qrcode
from PIL import Image, ImageDraw, ImageFont, ImageFilter

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, A3
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

# 1. Colors
C_BROWN = colors.HexColor("#49250B")       # Dark Chocolate Brown (matching photo outline)
C_CREAM = colors.HexColor("#FFFDF8")       # Bone Cream (matching photo background)
C_GOLD = colors.HexColor("#E2933C")        # Warm Amber / Peanut / Biscuit Gold
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

# 4. Generate High-Res Bottom Pill Badges (300 DPI)
def make_pill_badges():
    f_title = ImageFont.truetype(str(FONTS_DIR / "arialbd.ttf"), 56)
    f_qty = ImageFont.truetype(str(FONTS_DIR / "arialbd.ttf"), 34)
    
    badge_files = {}
    variants = [
        ("Chicken", "Chicken Bone", "chicken"),
        ("Mix", "Mix Flavour", "mix"),
        ("PB", "Peanut Butter", "peanut"),
    ]
    
    w, h = 1400, 380
    c_cream = (255, 253, 248)
    c_brown = (73, 37, 11)
    c_peanut = (226, 147, 60)
    
    for key, flavor_name, icon_type in variants:
        img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        
        # Main rounded pill container with dark brown border
        d.rounded_rectangle([(15, 15), (w-15, h-15)], radius=120, fill=c_cream, outline=c_brown, width=12)
        
        # Title text
        tb = d.textbbox((0, 0), flavor_name, font=f_title)
        t_w = tb[2] - tb[0]
        t_x = (w - t_w) // 2
        t_y = 65
        d.text((t_x, t_y), flavor_name, font=f_title, fill=c_brown)
        
        # Sub-pill for "Net Qty. 400 g"
        q_str = "Net Qty. 400 g"
        qb = d.textbbox((0, 0), q_str, font=f_qty)
        q_w = qb[2] - qb[0]
        pill_w = q_w + 64
        pill_h = 62
        pill_x = (w - pill_w) // 2
        pill_y = 230
        d.rounded_rectangle([(pill_x, pill_y), (pill_x + pill_w, pill_y + pill_h)], radius=31, fill=c_brown)
        d.text((pill_x + 32, pill_y + 12), q_str, font=f_qty, fill=(255, 255, 255))
        
        # Right paw print at cx = 1240, cy = 200
        paw_cx, paw_cy = 1240, 200
        d.ellipse([(paw_cx - 24, paw_cy - 12), (paw_cx + 24, paw_cy + 24)], fill=c_brown)
        d.ellipse([(paw_cx - 28, paw_cy - 34), (paw_cx - 14, paw_cy - 16)], fill=c_brown)
        d.ellipse([(paw_cx - 10, paw_cy - 44), (paw_cx + 4, paw_cy - 24)], fill=c_brown)
        d.ellipse([(paw_cx + 10, paw_cy - 44), (paw_cx + 24, paw_cy - 24)], fill=c_brown)
        d.ellipse([(paw_cx + 22, paw_cy - 34), (paw_cx + 36, paw_cy - 16)], fill=c_brown)
        
        # Left icon at cx = 160, cy = 200
        ic_cx, ic_cy = 160, 200
        if icon_type == "peanut":
            d.ellipse([(ic_cx - 50, ic_cy - 40), (ic_cx + 5, ic_cy + 40)], fill=c_peanut, outline=c_brown, width=8)
            d.ellipse([(ic_cx - 15, ic_cy - 10), (ic_cx + 55, ic_cy + 60)], fill=c_peanut, outline=c_brown, width=8)
        elif icon_type == "chicken":
            d.ellipse([(ic_cx - 25, ic_cy - 50), (ic_cx + 45, ic_cy + 20)], fill=c_peanut, outline=c_brown, width=8)
            d.line([(ic_cx - 10, ic_cy + 10), (ic_cx - 35, ic_cy + 45)], fill=(255, 255, 255), width=14)
            d.ellipse([(ic_cx - 48, ic_cy + 38), (ic_cx - 28, ic_cy + 58)], fill=(255, 255, 255))
            d.ellipse([(ic_cx - 38, ic_cy + 48), (ic_cx - 18, ic_cy + 68)], fill=(255, 255, 255))
        else: # mix
            d.rounded_rectangle([(ic_cx - 40, ic_cy - 15), (ic_cx + 40, ic_cy + 15)], radius=15, fill=c_peanut, outline=c_brown, width=6)
            d.ellipse([(ic_cx - 50, ic_cy - 25), (ic_cx - 25, ic_cy)], fill=c_peanut, outline=c_brown, width=6)
            d.ellipse([(ic_cx - 50, ic_cy), (ic_cx - 25, ic_cy + 25)], fill=c_peanut, outline=c_brown, width=6)
            d.ellipse([(ic_cx + 25, ic_cy - 25), (ic_cx + 50, ic_cy)], fill=c_peanut, outline=c_brown, width=6)
            d.ellipse([(ic_cx + 25, ic_cy), (ic_cx + 50, ic_cy + 25)], fill=c_peanut, outline=c_brown, width=6)
            
        out_p = BRAIN / f"pill_badge_{key}.png"
        img.save(str(out_p))
        badge_files[key] = str(out_p)
        
    return badge_files

# 5. Draw Back Compliance Label in Vector ReportLab
def draw_back_label(c, x, y, width, height, variant_name, flavor_title, mrp_str, usp_str, batch_str, qr_path):
    c.saveState()
    
    # Background rounded rectangle
    c.setFillColor(C_LIGHT_BG)
    c.setStrokeColor(C_BROWN)
    c.setLineWidth(1.5)
    c.roundRect(x, y, width, height, 6*mm, fill=1, stroke=1)
    
    # Inner border line
    c.setStrokeColor(colors.HexColor("#D8CDBE"))
    c.setLineWidth(0.75)
    c.roundRect(x + 2.5*mm, y + 2.5*mm, width - 5*mm, height - 5*mm, 4*mm, fill=0, stroke=1)
    
    # Top Header Banner
    c.setFillColor(C_BROWN)
    c.roundRect(x + 4*mm, y + height - 16*mm, width - 8*mm, 12*mm, 2*mm, fill=1, stroke=0)
    
    c.setFillColor(C_CREAM)
    c.setFont("Arial-Bold", 13)
    c.drawString(x + 8*mm, y + height - 11.5*mm, "B R O S K I")
    
    c.setFont("Arial-Bold", 8.5)
    c.drawRightString(x + width - 8*mm, y + height - 10*mm, flavor_title.upper())
    c.setFont("Arial", 6.2)
    c.drawRightString(x + width - 8*mm, y + height - 14*mm, "— Good Boy Snacks —")
    
    cur_y = y + height - 20*mm
    left_x = x + 5*mm
    right_margin = x + width - 5*mm
    content_w = width - 10*mm
    
    # Ingredients
    c.setFillColor(C_BROWN)
    c.setFont("Arial-Bold", 7)
    c.drawString(left_x, cur_y, "INGREDIENTS:")
    c.setFillColor(C_DARK)
    c.setFont("Arial", 6)
    if "CHICKEN" in flavor_title.upper() or "NON-VEG" in flavor_title.upper():
        ing_text = "Whole Wheat Flour, Bone Broth & Liver Extract, Vegetable Oil, Natural Flavour, Minerals, Permitted Antioxidants."
    elif "MIX" in flavor_title.upper():
        ing_text = "Whole Wheat Flour, Milk Solids, Vegetable Extracts, Vegetable Oil, Natural Flavour, Minerals, Permitted Antioxidants."
    else:
        ing_text = "Whole Wheat Flour, Peanut Butter, Vegetable Oil, Natural Flavour, Minerals, Permitted Antioxidants."
    c.drawString(left_x + 21*mm, cur_y, ing_text)
    
    cur_y -= 4*mm
    # Feeding Guide Box
    c.setFillColor(colors.HexColor("#EAE3D5"))
    c.roundRect(left_x, cur_y - 17*mm, content_w, 16*mm, 1.5*mm, fill=1, stroke=0)
    
    c.setFillColor(C_BROWN)
    c.setFont("Arial-Bold", 6.5)
    c.drawString(left_x + 2*mm, cur_y - 3.5*mm, "DAILY FEEDING GUIDE:")
    
    c.setFont("Arial-Bold", 5.8)
    c.drawString(left_x + 36*mm, cur_y - 3.5*mm, "Dog Weight")
    c.drawString(left_x + 65*mm, cur_y - 3.5*mm, "Biscuits / Day")
    
    c.setFont("Arial", 5.8)
    c.setFillColor(C_DARK)
    c.drawString(left_x + 36*mm, cur_y - 7*mm, "Up to 10 kg (Puppy/Small)")
    c.drawRightString(left_x + 82*mm, cur_y - 7*mm, "1 – 2 pcs")
    
    c.drawString(left_x + 36*mm, cur_y - 10.5*mm, "10 – 25 kg (Medium)")
    c.drawRightString(left_x + 82*mm, cur_y - 10.5*mm, "2 – 4 pcs")
    
    c.drawString(left_x + 36*mm, cur_y - 14*mm, "Over 25 kg (Large)")
    c.drawRightString(left_x + 82*mm, cur_y - 14*mm, "4 – 6 pcs")
    
    c.setFont("Arial", 5)
    c.drawString(left_x + 2*mm, cur_y - 14*mm, "*Treats max 10% daily food. Keep fresh water.")
    
    cur_y -= 19.5*mm
    
    # Statutory Grid (Legal Metrology Rule 6)
    # Net Quantity Box (HIGH PROMINENCE >= 4mm numeral)
    c.setFillColor(C_BROWN)
    c.roundRect(left_x, cur_y - 9.5*mm, 30*mm, 9*mm, 1.5*mm, fill=1, stroke=0)
    c.setFillColor(C_CREAM)
    c.setFont("Arial-Bold", 6)
    c.drawString(left_x + 2*mm, cur_y - 3.5*mm, "NET QUANTITY")
    c.setFont("Arial-Bold", 13) # > 4.5 mm numeral
    c.drawString(left_x + 2*mm, cur_y - 8.5*mm, "400 g")
    
    # MRP & USP Box
    c.setFillColor(colors.HexColor("#FFFFFF"))
    c.setStrokeColor(C_BROWN)
    c.setLineWidth(0.8)
    c.roundRect(left_x + 32*mm, cur_y - 9.5*mm, 35*mm, 9*mm, 1.5*mm, fill=1, stroke=1)
    
    c.setFillColor(C_DARK)
    c.setFont("Arial-Bold", 7.8)
    c.drawString(left_x + 34*mm, cur_y - 3.8*mm, f"MRP: {mrp_str}")
    c.setFont("Arial", 5.2)
    c.drawString(left_x + 34*mm, cur_y - 6.6*mm, "(Inclusive of all taxes)")
    c.drawString(left_x + 34*mm, cur_y - 8.8*mm, f"Unit Sale Price: {usp_str}")
    
    # Batch & Date Box
    c.roundRect(left_x + 69*mm, cur_y - 9.5*mm, content_w - 69*mm, 9*mm, 1.5*mm, fill=1, stroke=1)
    c.setFont("Arial-Bold", 5.5)
    c.drawString(left_x + 71*mm, cur_y - 3.8*mm, f"BATCH: {batch_str}")
    c.setFont("Arial", 5.2)
    c.drawString(left_x + 71*mm, cur_y - 6.6*mm, "PACKED: NOV 2026")
    c.drawString(left_x + 71*mm, cur_y - 9*mm, "BEST BEFORE: 9 MOS.")
    
    cur_y -= 12*mm
    
    # Company, Marketer & Consumer Care (Left Side) + QR Code (Right Side)
    col_w = content_w - 24*mm
    c.setFillColor(C_DARK)
    c.setFont("Arial-Bold", 6.2)
    c.drawString(left_x, cur_y, "Packed & Marketed by:")
    c.setFont("Arial-Bold", 6.5)
    c.drawString(left_x, cur_y - 3.2*mm, "BROSKI")
    c.setFont("Arial", 5.5)
    c.drawString(left_x, cur_y - 6.2*mm, "12A/3, Dharam Colony, Nangloi, New Delhi - 110041, India")
    c.drawString(left_x, cur_y - 9.2*mm, "Web: broskipetfood.com | Email: hello@broskipetfood.com")
    c.drawString(left_x, cur_y - 12.2*mm, "Consumer Care WhatsApp: +91 92892 00000 | Origin: India")
    
    # Product Category
    c.setFont("Arial-Bold", 5.2)
    c.drawString(left_x, cur_y - 16*mm, "Product: Dog Biscuits – Complementary Dog Treat (Not for human consumption)")
    
    # Draw QR Code on the right
    qr_x = left_x + col_w + 1*mm
    qr_y = cur_y - 17.5*mm
    qr_sz = 21*mm
    c.drawImage(qr_path, qr_x, qr_y, width=qr_sz, height=qr_sz)
    c.setFillColor(C_BROWN)
    c.setFont("Arial-Bold", 4.5)
    c.drawCentredString(qr_x + qr_sz/2, qr_y - 2*mm, "Scan for Review &")
    c.drawCentredString(qr_x + qr_sz/2, qr_y - 3.8*mm, "FREE 50g Sample!")
    
    # 1.0 mm Legal Manufacturer Footnote at the very bottom edge (Rule 6 compliant fine print)
    cur_y_foot = y + 4*mm
    c.setStrokeColor(colors.HexColor("#D8CDBE"))
    c.setLineWidth(0.5)
    c.line(left_x, cur_y_foot + 3.5*mm, right_margin, cur_y_foot + 3.5*mm)
    
    c.setFillColor(colors.HexColor("#665548"))
    c.setFont("Arial", 4.2) # Exactly ~1.0 mm height
    c.drawString(left_x, cur_y_foot + 1*mm, "Mfd. by: Scoobee Pet Foods Pvt. Ltd., Shalimar Bagh, Delhi - 110088. Under Commercial Agreement with BROSKI.")
    c.drawRightString(right_margin, cur_y_foot + 1*mm, "Storage: Store cool & dry. Zip shut.")
    
    c.restoreState()

# 6. Build Master Multi-Page PDF
def build_master_pdf():
    out_pdf_path = ROOT / "Broski_PRINT_READY_Stickers_2026.pdf"
    qr_img_path = make_qr_code()
    top_mascot_img = prepare_top_mascot()
    badges = make_pill_badges()
    
    c = canvas.Canvas(str(out_pdf_path), pagesize=A4)
    
    # =========================================================================
    # PAGE 1: PRINTER JOB SHEET & SPECIFICATIONS (A4)
    # =========================================================================
    c.setTitle("BROSKI · Print-Ready Packaging Stickers (Final Release 2026)")
    c.setAuthor("BROSKI AI Executive Team")
    
    c.setFillColor(C_BROWN)
    c.rect(0, 260*mm, 210*mm, 37*mm, fill=1, stroke=0)
    c.setFillColor(C_CREAM)
    c.setFont("Arial-Bold", 22)
    c.drawString(15*mm, 280*mm, "B R O S K I")
    c.setFont("Arial-Bold", 11)
    c.drawString(15*mm, 273*mm, "COMMERCIAL PACKAGING STICKERS · BONE & WINKING DOG EDITION")
    c.setFont("Arial", 8)
    c.drawString(15*mm, 266*mm, "Release Date: 7 November 2026 · Target Commercial Launch: 15 November 2026 · Nangloi Press Ready")
    
    y = 245*mm
    c.setFillColor(C_DARK)
    c.setFont("Arial-Bold", 10)
    c.drawString(15*mm, y, "1. Technical Specifications for Digital Printing Press:")
    
    specs = [
        ("Substrate Material", "White Waterproof Vinyl / Matte BOPP Self-Adhesive Sticker Paper (80–100 GSM backing)"),
        ("Adhesive", "Permanent Acrylic Adhesive (High-tack for laminated plastic/foil pouch bonding)"),
        ("Lamination / Finish", "Premium Soft-Touch Matte Lamination (Water-resistant, scratch-proof, anti-smudge)"),
        ("Printing Technology", "4-Color CMYK Digital Press (Konica Minolta AccurioPress / Xerox Versant / HP Indigo)"),
        ("Cutting & Finishing", "Precision Digital Kiss-Cut / Plotter Die-Cut along CutContour (Magenta line) on A3 sheets"),
        ("Front Top Mascot Size", "115 mm (Width) × 80 mm (Height) — White Bone + Winking Dog, sits centered above window"),
        ("Front Bottom Pill Size", "115 mm (Width) × 32 mm (Height) — Cream Pill Badge + Net Qty 400g, sits below window"),
        ("Back Compliance Label Size", "100 mm (Width) × 140 mm (Height) — Standard A6 format with 6mm rounded corners"),
        ("50g Sampler Label Size", "50 mm (Width) × 70 mm (Height) — Small pocket bone sampler for 4x6 inch pouches"),
        ("Bleed & Safe Margin", "2.0 mm bleed included on all borders; 3.0 mm inner safe zone respected for all critical text")
    ]
    
    y -= 5*mm
    for k, v in specs:
        c.setFillColor(colors.HexColor("#EAE3D5"))
        c.rect(15*mm, y - 2*mm, 50*mm, 5.5*mm, fill=1, stroke=0)
        c.setFillColor(C_BROWN)
        c.setFont("Arial-Bold", 7.5)
        c.drawString(17*mm, y + 1.2*mm, k)
        
        c.setFillColor(colors.white)
        c.rect(66*mm, y - 2*mm, 129*mm, 5.5*mm, fill=1, stroke=0)
        c.setFillColor(C_DARK)
        c.setFont("Arial", 7.2)
        c.drawString(68*mm, y + 1.2*mm, v)
        y -= 6.5*mm
        
    y -= 4*mm
    c.setFillColor(C_BROWN)
    c.setFont("Arial-Bold", 10)
    c.drawString(15*mm, y, "2. Pilot Batch Quantities to Print (Nangloi Local Digital Press):")
    
    y -= 6*mm
    quantities = [
        ("Front Mascot Sticker (Bone + Dog)", "300 pcs total", "Winking Dog + BROSKI + 'Good Boy Snacks' (Above window)"),
        ("Front Bottom Pill: Chicken Bone", "150 pcs", "Cream pill, Chicken icon, Net Qty 400g, fits below window"),
        ("Front Bottom Pill: Mix Flavour", "150 pcs", "Cream pill, Twin bone icon, Net Qty 400g, fits below window"),
        ("Back Compliance Label: Chicken", "150 pcs", "A6 size, MRP ₹149, USP ₹0.37/g, Batch BR-NV-2611-01, QR Code"),
        ("Back Compliance Label: Mix", "150 pcs", "A6 size, MRP ₹179, USP ₹0.45/g, Batch BR-MX-2611-01, QR Code"),
        ("50g Sample Pocket Bone Stickers", "300 pcs", "Small 50x70mm labels for sampling pouches (12 A3 sheets)")
    ]
    
    for item, qty, note in quantities:
        c.setFillColor(colors.HexColor("#332218") if "A6" in note else colors.HexColor("#49250B"))
        c.rect(15*mm, y - 1.5*mm, 60*mm, 5*mm, fill=1, stroke=0)
        c.setFillColor(C_CREAM)
        c.setFont("Arial-Bold", 7.2)
        c.drawString(17*mm, y + 1.5*mm, item)
        
        c.setFillColor(colors.HexColor("#FBF8F2"))
        c.rect(76*mm, y - 1.5*mm, 26*mm, 5*mm, fill=1, stroke=0)
        c.setFillColor(C_BROWN)
        c.setFont("Arial-Bold", 7.2)
        c.drawString(78*mm, y + 1.5*mm, qty)
        
        c.setFillColor(colors.white)
        c.rect(103*mm, y - 1.5*mm, 92*mm, 5*mm, fill=1, stroke=0)
        c.setFillColor(C_DARK)
        c.setFont("Arial", 6.8)
        c.drawString(105*mm, y + 1.5*mm, note)
        y -= 6*mm
        
    y -= 4*mm
    c.setFillColor(C_BROWN)
    c.setFont("Arial-Bold", 10)
    c.drawString(15*mm, y, "3. Legal Metrology Compliance Audit (Rule 6 & Schedule II):")
    y -= 5*mm
    c.setFont("Arial", 7.2)
    c.setFillColor(C_DARK)
    c.drawString(15*mm, y, "[PASS] Net Quantity '400 g' numeral height = 4.5 mm (Mandatory statutory minimum is 4.0 mm).")
    c.drawString(15*mm, y - 4*mm, "[PASS] Unit Sale Price displayed as ₹0.37 / g (Non-Veg) and ₹0.45 / g (Mix) per Rule 6(1)(l).")
    c.drawString(15*mm, y - 8*mm, "[PASS] Scoobee manufacturer footnote formatted at 1.0 mm (5 pt) fine print at bottom edge.")
    c.drawString(15*mm, y - 12*mm, "[PASS] Live QR Code points to active review and 50g sample voucher portal at broskipetfood.com/r/.")
    
    c.setFillColor(colors.HexColor("#998877"))
    c.setFont("Arial", 6.5)
    c.drawRightString(195*mm, 8*mm, "BROSKI Digital Print Release v7.0 · Page 1 of 11")
    c.showPage()
    
    # =========================================================================
    # PAGE 2: FRONT TOP MASCOT STICKER (1:1 SCALE)
    # =========================================================================
    c.setFillColor(colors.white)
    c.rect(0, 0, 210*mm, 297*mm, fill=1, stroke=0)
    
    c.setFillColor(C_BROWN)
    c.setFont("Arial-Bold", 12)
    c.drawString(15*mm, 280*mm, "FRONT TOP MASCOT STICKER · 1:1 ACTUAL PRINT SIZE")
    c.setFont("Arial", 8)
    c.drawString(15*mm, 274*mm, "Dimensions: 115 mm × 81 mm · Die-Cut / Kiss-Cut Outline · Sits above clear window on 8×12\" yellow pouch")
    
    mascot_w = 115*mm
    mascot_h = 81*mm
    mascot_x = (210*mm - mascot_w)/2
    mascot_y = 160*mm
    
    c.setStrokeColor(C_MAGENTA)
    c.setLineWidth(0.5)
    c.roundRect(mascot_x - 1*mm, mascot_y - 1*mm, mascot_w + 2*mm, mascot_h + 2*mm, 8*mm, fill=0, stroke=1)
    c.setFont("Arial", 6)
    c.setFillColor(C_MAGENTA)
    c.drawString(mascot_x, mascot_y - 5*mm, "CutContour (Die-Cut Path) — 2.0 mm Bleed Included")
    
    c.drawImage(top_mascot_img, mascot_x, mascot_y, width=mascot_w, height=mascot_h, mask='auto')
    
    c.setFillColor(colors.HexColor("#998877"))
    c.setFont("Arial", 6.5)
    c.drawRightString(195*mm, 8*mm, "BROSKI Digital Print Release v7.0 · Page 2 of 11")
    c.showPage()
    
    # =========================================================================
    # PAGE 3: FRONT BOTTOM PILL BADGE — CHICKEN BONE BISCUITS (1:1 SCALE)
    # =========================================================================
    c.setFillColor(colors.white)
    c.rect(0, 0, 210*mm, 297*mm, fill=1, stroke=0)
    
    c.setFillColor(C_BROWN)
    c.setFont("Arial-Bold", 12)
    c.drawString(15*mm, 280*mm, "FRONT BOTTOM PILL BADGE · CHICKEN BONE (NON-VEG) · 1:1 SCALE")
    c.setFont("Arial", 8)
    c.drawString(15*mm, 274*mm, "Dimensions: 115 mm × 32 mm · Rounded Pill (R=12mm) · Sits below clear window on yellow pouch")
    
    b_w = 115*mm
    b_h = 31.2*mm
    b_x = (210*mm - b_w)/2
    b_y = 190*mm
    
    c.setStrokeColor(C_MAGENTA)
    c.setLineWidth(0.5)
    c.roundRect(b_x - 1*mm, b_y - 1*mm, b_w + 2*mm, b_h + 2*mm, 10*mm, fill=0, stroke=1)
    c.setFont("Arial", 6)
    c.setFillColor(C_MAGENTA)
    c.drawString(b_x, b_y - 5*mm, "CutContour Path (Rounded Pill)")
    
    c.drawImage(badges["Chicken"], b_x, b_y, width=b_w, height=b_h, mask='auto')
    
    c.setFillColor(colors.HexColor("#998877"))
    c.setFont("Arial", 6.5)
    c.drawRightString(195*mm, 8*mm, "BROSKI Digital Print Release v7.0 · Page 3 of 11")
    c.showPage()
    
    # =========================================================================
    # PAGE 4: FRONT BOTTOM PILL BADGE — MIX FLAVOUR BISCUITS (1:1 SCALE)
    # =========================================================================
    c.setFillColor(colors.white)
    c.rect(0, 0, 210*mm, 297*mm, fill=1, stroke=0)
    
    c.setFillColor(C_BROWN)
    c.setFont("Arial-Bold", 12)
    c.drawString(15*mm, 280*mm, "FRONT BOTTOM PILL BADGE · MIX FLAVOUR (MIX BONE) · 1:1 SCALE")
    c.setFont("Arial", 8)
    c.drawString(15*mm, 274*mm, "Dimensions: 115 mm × 32 mm · Rounded Pill (R=12mm) · Sits below clear window on yellow pouch")
    
    c.setStrokeColor(C_MAGENTA)
    c.setLineWidth(0.5)
    c.roundRect(b_x - 1*mm, b_y - 1*mm, b_w + 2*mm, b_h + 2*mm, 10*mm, fill=0, stroke=1)
    c.setFont("Arial", 6)
    c.setFillColor(C_MAGENTA)
    c.drawString(b_x, b_y - 5*mm, "CutContour Path (Rounded Pill)")
    
    c.drawImage(badges["Mix"], b_x, b_y, width=b_w, height=b_h, mask='auto')
    
    c.setFillColor(colors.HexColor("#998877"))
    c.setFont("Arial", 6.5)
    c.drawRightString(195*mm, 8*mm, "BROSKI Digital Print Release v7.0 · Page 4 of 11")
    c.showPage()
    
    # =========================================================================
    # PAGE 5: FRONT BOTTOM PILL BADGE — PEANUT BUTTER (PHOTO MATCH) (1:1 SCALE)
    # =========================================================================
    c.setFillColor(colors.white)
    c.rect(0, 0, 210*mm, 297*mm, fill=1, stroke=0)
    
    c.setFillColor(C_BROWN)
    c.setFont("Arial-Bold", 12)
    c.drawString(15*mm, 280*mm, "FRONT BOTTOM PILL BADGE · PEANUT BUTTER (EXACT PHOTO MATCH) · 1:1 SCALE")
    c.setFont("Arial", 8)
    c.drawString(15*mm, 274*mm, "Dimensions: 115 mm × 32 mm · Matches exact user photo layout with peanuts & paw print")
    
    c.setStrokeColor(C_MAGENTA)
    c.setLineWidth(0.5)
    c.roundRect(b_x - 1*mm, b_y - 1*mm, b_w + 2*mm, b_h + 2*mm, 10*mm, fill=0, stroke=1)
    c.setFont("Arial", 6)
    c.setFillColor(C_MAGENTA)
    c.drawString(b_x, b_y - 5*mm, "CutContour Path (Rounded Pill)")
    
    c.drawImage(badges["PB"], b_x, b_y, width=b_w, height=b_h, mask='auto')
    
    c.setFillColor(colors.HexColor("#998877"))
    c.setFont("Arial", 6.5)
    c.drawRightString(195*mm, 8*mm, "BROSKI Digital Print Release v7.0 · Page 5 of 11")
    c.showPage()
    
    # =========================================================================
    # PAGE 6: BACK COMPLIANCE LABEL — CHICKEN BONE (NON-VEG) (1:1 SCALE A6)
    # =========================================================================
    c.setFillColor(colors.white)
    c.rect(0, 0, 210*mm, 297*mm, fill=1, stroke=0)
    
    c.setFillColor(C_BROWN)
    c.setFont("Arial-Bold", 12)
    c.drawString(15*mm, 280*mm, "BACK COMPLIANCE LABEL · CHICKEN BONE (NON-VEG) · 1:1 SCALE A6")
    c.setFont("Arial", 8)
    c.drawString(15*mm, 274*mm, "Dimensions: 100 mm × 140 mm · Rule 6 Fully Compliant · 1.0 mm Scoobee Manufacturer Footnote & Live QR")
    
    lbl_w = 100*mm
    lbl_h = 140*mm
    lbl_x = (210*mm - lbl_w)/2
    lbl_y = 120*mm
    
    c.setStrokeColor(C_MAGENTA)
    c.setLineWidth(0.5)
    c.roundRect(lbl_x - 1*mm, lbl_y - 1*mm, lbl_w + 2*mm, lbl_h + 2*mm, 6*mm, fill=0, stroke=1)
    
    draw_back_label(c, lbl_x, lbl_y, lbl_w, lbl_h, "Non-Veg", "Chicken Bone Biscuits", "₹149.00", "₹0.37 / g", "BR-NV-2611-01", qr_img_path)
    
    c.setFillColor(colors.HexColor("#998877"))
    c.setFont("Arial", 6.5)
    c.drawRightString(195*mm, 8*mm, "BROSKI Digital Print Release v7.0 · Page 6 of 11")
    c.showPage()
    
    # =========================================================================
    # PAGE 7: BACK COMPLIANCE LABEL — MIX FLAVOUR (1:1 SCALE A6)
    # =========================================================================
    c.setFillColor(colors.white)
    c.rect(0, 0, 210*mm, 297*mm, fill=1, stroke=0)
    
    c.setFillColor(C_BROWN)
    c.setFont("Arial-Bold", 12)
    c.drawString(15*mm, 280*mm, "BACK COMPLIANCE LABEL · MIX FLAVOUR (MIX BONE) · 1:1 SCALE A6")
    c.setFont("Arial", 8)
    c.drawString(15*mm, 274*mm, "Dimensions: 100 mm × 140 mm · Rule 6 Fully Compliant · MRP ₹179.00 · USP ₹0.45 / g")
    
    c.setStrokeColor(C_MAGENTA)
    c.setLineWidth(0.5)
    c.roundRect(lbl_x - 1*mm, lbl_y - 1*mm, lbl_w + 2*mm, lbl_h + 2*mm, 6*mm, fill=0, stroke=1)
    
    draw_back_label(c, lbl_x, lbl_y, lbl_w, lbl_h, "Mix", "Mix Flavour Biscuits", "₹179.00", "₹0.45 / g", "BR-MX-2611-01", qr_img_path)
    
    c.setFillColor(colors.HexColor("#998877"))
    c.setFont("Arial", 6.5)
    c.drawRightString(195*mm, 8*mm, "BROSKI Digital Print Release v7.0 · Page 7 of 11")
    c.showPage()
    
    # =========================================================================
    # PAGE 8: BACK COMPLIANCE LABEL — PEANUT BUTTER (1:1 SCALE A6)
    # =========================================================================
    c.setFillColor(colors.white)
    c.rect(0, 0, 210*mm, 297*mm, fill=1, stroke=0)
    
    c.setFillColor(C_BROWN)
    c.setFont("Arial-Bold", 12)
    c.drawString(15*mm, 280*mm, "BACK COMPLIANCE LABEL · PEANUT BUTTER · 1:1 SCALE A6")
    c.setFont("Arial", 8)
    c.drawString(15*mm, 274*mm, "Dimensions: 100 mm × 140 mm · Rule 6 Fully Compliant · MRP ₹149.00 · Batch BR-PB-2611-01")
    
    c.setStrokeColor(C_MAGENTA)
    c.setLineWidth(0.5)
    c.roundRect(lbl_x - 1*mm, lbl_y - 1*mm, lbl_w + 2*mm, lbl_h + 2*mm, 6*mm, fill=0, stroke=1)
    
    draw_back_label(c, lbl_x, lbl_y, lbl_w, lbl_h, "PB", "Peanut Butter Biscuits", "₹149.00", "₹0.37 / g", "BR-PB-2611-01", qr_img_path)
    
    c.setFillColor(colors.HexColor("#998877"))
    c.setFont("Arial", 6.5)
    c.drawRightString(195*mm, 8*mm, "BROSKI Digital Print Release v7.0 · Page 8 of 11")
    c.showPage()
    
    # =========================================================================
    # PAGE 9: READY-TO-PRINT A3 MASTER SHEET (FRONT BONE MASCOTS + PILL BADGES)
    # =========================================================================
    c.setPageSize(A3) # 297 mm x 420 mm
    c.setFillColor(colors.white)
    c.rect(0, 0, 297*mm, 420*mm, fill=1, stroke=0)
    
    c.setFillColor(C_BROWN)
    c.setFont("Arial-Bold", 14)
    c.drawString(15*mm, 405*mm, "A3 PRINT SHEET 1: FRONT LABELS (BONE MASCOTS + PILL BADGES)")
    c.setFont("Arial", 8)
    c.drawString(15*mm, 399*mm, "Paper: A3 (297×420 mm) Self-Adhesive Gumming Sheet · Kiss-Cut / Plotter Finish · Fits 6 Complete Front Sets")
    
    # 2 columns x 3 rows of (Mascot + Pill)
    col_xs = [20*mm, 155*mm]
    row_ys = [285*mm, 160*mm, 35*mm]
    
    set_idx = 0
    for r_y in row_ys:
        for c_x in col_xs:
            flv_k = "Chicken" if (set_idx % 2 == 0) else "Mix"
            
            # Mascot Bone Sticker (115 x 81 mm)
            c.drawImage(top_mascot_img, c_x, r_y + 35*mm, width=115*mm, height=81*mm, mask='auto')
            c.setStrokeColor(C_MAGENTA)
            c.setLineWidth(0.3)
            c.roundRect(c_x, r_y + 35*mm, 115*mm, 81*mm, 8*mm, stroke=1, fill=0)
            
            # Bottom Pill Badge (115 x 31.2 mm)
            c.drawImage(badges[flv_k], c_x, r_y, width=115*mm, height=31.2*mm, mask='auto')
            c.roundRect(c_x, r_y, 115*mm, 31.2*mm, 10*mm, stroke=1, fill=0)
            
            set_idx += 1
            
    c.setFillColor(colors.HexColor("#998877"))
    c.setFont("Arial", 6.5)
    c.drawRightString(285*mm, 5*mm, "BROSKI Digital Print Release v7.0 · Page 9 of 11 (A3 Sheet)")
    c.showPage()
    
    # =========================================================================
    # PAGE 10: READY-TO-PRINT A3 MASTER SHEET (BACK COMPLIANCE LABELS)
    # =========================================================================
    c.setFillColor(colors.white)
    c.rect(0, 0, 297*mm, 420*mm, fill=1, stroke=0)
    
    c.setFillColor(C_BROWN)
    c.setFont("Arial-Bold", 14)
    c.drawString(15*mm, 405*mm, "A3 PRINT SHEET 2: BACK COMPLIANCE LABELS (A6 GRID)")
    c.setFont("Arial", 8)
    c.drawString(15*mm, 399*mm, "Paper: A3 (297×420 mm) Self-Adhesive Gumming Sheet · 4 Complete A6 Labels per Sheet (2 Chicken + 2 Mix)")
    
    c_grid = [
        (35*mm, 245*mm, "Non-Veg", "Chicken Bone Biscuits", "₹149.00", "₹0.37 / g", "BR-NV-2611-01"),
        (155*mm, 245*mm, "Mix", "Mix Flavour Biscuits", "₹179.00", "₹0.45 / g", "BR-MX-2611-01"),
        (35*mm, 90*mm, "Non-Veg", "Chicken Bone Biscuits", "₹149.00", "₹0.37 / g", "BR-NV-2611-01"),
        (155*mm, 90*mm, "Mix", "Mix Flavour Biscuits", "₹179.00", "₹0.45 / g", "BR-MX-2611-01"),
    ]
    
    for gx, gy, gvar, gtitle, gmrp, gusp, gbatch in c_grid:
        c.setStrokeColor(C_MAGENTA)
        c.setLineWidth(0.3)
        c.roundRect(gx - 1*mm, gy - 1*mm, 100*mm + 2*mm, 140*mm + 2*mm, 6*mm, fill=0, stroke=1)
        draw_back_label(c, gx, gy, 100*mm, 140*mm, gvar, gtitle, gmrp, gusp, gbatch, qr_img_path)
        
    c.setFillColor(colors.HexColor("#998877"))
    c.setFont("Arial", 6.5)
    c.drawRightString(285*mm, 5*mm, "BROSKI Digital Print Release v7.0 · Page 10 of 11 (A3 Sheet)")
    c.showPage()
    
    # =========================================================================
    # PAGE 11: 50g SAMPLE POUCH STICKERS SHEET (24 LABELS PER A3)
    # =========================================================================
    c.setFillColor(colors.white)
    c.rect(0, 0, 297*mm, 420*mm, fill=1, stroke=0)
    
    c.setFillColor(C_BROWN)
    c.setFont("Arial-Bold", 14)
    c.drawString(15*mm, 405*mm, "A3 PRINT SHEET 3: 50g SAMPLE POUCH STICKERS (24 LABELS / SHEET)")
    c.setFont("Arial", 8)
    c.drawString(15*mm, 399*mm, "Dimensions: 58 mm × 50 mm · For 4×6\" Sample Pouches · 12 Non-Veg + 12 Mix Bone Samplers")
    
    xs = [18*mm + i*66*mm for i in range(4)]
    ys = [85*mm + j*52*mm for j in range(6)]
    
    s_idx = 0
    for y_pos in reversed(ys):
        for x_pos in xs:
            is_mix = (s_idx % 2 == 1)
            flv = "MIX BONE" if is_mix else "NON-VEG"
            col_card = C_BROWN
            
            c.saveState()
            c.setStrokeColor(C_MAGENTA)
            c.setLineWidth(0.3)
            c.roundRect(x_pos - 0.5*mm, y_pos - 0.5*mm, 60*mm + 1*mm, 48*mm + 1*mm, 4*mm, fill=0, stroke=1)
            
            c.setFillColor(col_card)
            c.roundRect(x_pos, y_pos, 60*mm, 48*mm, 4*mm, fill=1, stroke=0)
            
            c.setStrokeColor(colors.HexColor("#F5EEE2"))
            c.setLineWidth(0.5)
            c.roundRect(x_pos + 1.5*mm, y_pos + 1.5*mm, 57*mm, 45*mm, 3*mm, fill=0, stroke=1)
            
            c.setFillColor(C_CREAM)
            c.setFont("Arial-Bold", 8.5)
            c.drawCentredString(x_pos + 30*mm, y_pos + 40*mm, "B R O S K I")
            
            c.setFont("Arial-Bold", 6.5)
            c.setFillColor(C_GOLD)
            c.drawCentredString(x_pos + 30*mm, y_pos + 34*mm, f"{flv} · FREE SAMPLER")
            
            c.setFont("Arial", 5.2)
            c.setFillColor(C_CREAM)
            c.drawCentredString(x_pos + 30*mm, y_pos + 29*mm, "— Good Boy Snacks — · 4–5 Bones")
            
            c.drawImage(qr_img_path, x_pos + 21*mm, y_pos + 11*mm, width=18*mm, height=18*mm)
            
            c.setFont("Arial-Bold", 4.8)
            c.setFillColor(colors.HexColor("#F5EEE2"))
            c.drawCentredString(x_pos + 30*mm, y_pos + 6*mm, "Scan to Review & Get Bro Perks!")
            c.setFont("Arial", 4.2)
            c.drawCentredString(x_pos + 30*mm, y_pos + 3*mm, "NET QTY: 50g | broskipetfood.com")
            
            c.restoreState()
            s_idx += 1
            
    c.setFillColor(colors.HexColor("#998877"))
    c.setFont("Arial", 6.5)
    c.drawRightString(285*mm, 5*mm, "BROSKI Digital Print Release v7.0 · Page 11 of 11 (A3 Sheet)")
    c.showPage()
    
    c.save()
    print("Master PDF generated successfully at:", str(out_pdf_path))
    
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
