import datetime
from sqlalchemy.orm import Session
from app.database.models import (
    User, WasteCategory, SafetyInstruction, BinStatus,
    CollectionRecord, Incident, KnowledgeBase, Notification, WasteScan
)
from app.auth.security import get_password_hash
from app.rules.waste_rules import WASTE_RULES

def seed_database(db: Session):
    """Populates database with initial administrative accounts, categories, rules, and realistic hospital seed data."""
    # 1. Users
    if db.query(User).count() == 0:
        admin = User(
            email="admin@smartbiowaste.ai",
            full_name="Dr. Sarah Jenkins (Chief Safety Officer)",
            hashed_password=get_password_hash("Admin@12345"),
            role="ADMIN",
            department="Infection Control & Safety",
            is_active=True
        )
        staff = User(
            email="staff@smartbiowaste.ai",
            full_name="Nurse Rajesh Kumar",
            hashed_password=get_password_hash("Staff@12345"),
            role="HEALTHCARE_STAFF",
            department="Intensive Care Unit (ICU)",
            is_active=True
        )
        collector = User(
            email="collector@smartbiowaste.ai",
            full_name="Murugan P.",
            hashed_password=get_password_hash("Collector@12345"),
            role="WASTE_COLLECTOR",
            department="Facility Bio-Management",
            is_active=True
        )
        db.add_all([admin, staff, collector])
        db.commit()

    admin_user = db.query(User).filter(User.email == "admin@smartbiowaste.ai").first()
    staff_user = db.query(User).filter(User.email == "staff@smartbiowaste.ai").first()
    collector_user = db.query(User).filter(User.email == "collector@smartbiowaste.ai").first()

    # 2. Categories
    if db.query(WasteCategory).count() == 0:
        for cat_key, info in WASTE_RULES.items():
            cat = WasteCategory(
                name=cat_key,
                display_name=info["display_name"],
                description=info["segregation_method"][:200] + "...",
                default_bin=info["recommended_bin"],
                risk_level=info["risk_level"],
                segregation_guide=info["segregation_method"],
                handling_guide=info["handling_method"],
                disposal_guide=info["disposal_method"],
                emergency_action=info.get("emergency_action"),
                ppe_requirements=info.get("ppe", []),
                safety_precautions=info.get("safety_precautions", [])
            )
            db.add(cat)
        db.commit()

    # 3. Hospital Bins
    if db.query(BinStatus).count() == 0:
        bins = [
            BinStatus(bin_name="ICU Yellow Infectious Bin", bin_type="YELLOW", location="ICU Block B - Ward 4", capacity_percentage=82.0, status="NEAR_CAPACITY"),
            BinStatus(bin_name="OT Sharps Container", bin_type="WHITE", location="Operation Theatre Suite 2", capacity_percentage=94.5, status="COLLECTION_REQUIRED"),
            BinStatus(bin_name="Emergency Red Recyclables", bin_type="RED", location="Emergency Department Trauma Bay", capacity_percentage=45.0, status="NORMAL"),
            BinStatus(bin_name="Pathology Glassware Box", bin_type="BLUE", location="Central Pathology Laboratory", capacity_percentage=30.0, status="NORMAL"),
            BinStatus(bin_name="Oncology Cytotoxic Yellow Bin", bin_type="YELLOW", location="Chemotherapy Daycare Unit", capacity_percentage=88.0, status="COLLECTION_REQUIRED"),
            BinStatus(bin_name="General Ward Plastic Bin", bin_type="RED", location="General Medical Ward 3", capacity_percentage=62.0, status="NORMAL"),
            BinStatus(bin_name="Pediatric Sharps Collector", bin_type="WHITE", location="Pediatric Intensive Care", capacity_percentage=76.0, status="NEAR_CAPACITY"),
            BinStatus(bin_name="Pharmacy Return Bin", bin_type="YELLOW", location="Inpatient Central Pharmacy", capacity_percentage=55.0, status="NORMAL")
        ]
        db.add_all(bins)
        db.commit()

    # 4. Collection Records
    if db.query(CollectionRecord).count() == 0:
        ot_bin = db.query(BinStatus).filter(BinStatus.bin_name.like("%OT Sharps%")).first()
        icu_bin = db.query(BinStatus).filter(BinStatus.bin_name.like("%ICU Yellow%")).first()
        
        if ot_bin and icu_bin:
            records = [
                CollectionRecord(
                    bin_id=ot_bin.id,
                    collector_id=collector_user.id if collector_user else None,
                    scheduled_date=datetime.datetime.utcnow(),
                    status="SCHEDULED",
                    notes="High priority: Puncture-proof container > 90% capacity."
                ),
                CollectionRecord(
                    bin_id=icu_bin.id,
                    collector_id=collector_user.id if collector_user else None,
                    scheduled_date=datetime.datetime.utcnow() + datetime.timedelta(hours=2),
                    status="PENDING",
                    notes="Daily afternoon clearance."
                )
            ]
            db.add_all(records)
            db.commit()

    # 5. Incidents
    if db.query(Incident).count() == 0:
        incidents = [
            Incident(
                user_id=staff_user.id if staff_user else None,
                type="Needle-stick injury",
                category="sharps",
                location="ICU Ward Bed 12",
                description="Minor finger puncture during IV cannula insertion. Immediate wound washing completed, PEP protocol initiated.",
                priority="CRITICAL",
                status="UNDER_REVIEW"
            ),
            Incident(
                user_id=staff_user.id if staff_user else None,
                type="Incorrect segregation",
                category="glassware",
                location="OPD Injection Room 3",
                description="Glass medicine ampoule found in Red plastic bag instead of Blue cardboard container.",
                priority="HIGH",
                status="RESOLVED",
                resolution_notes="Staff re-briefed on glassware protocol. Ampoule transferred using forceps."
            ),
            Incident(
                user_id=staff_user.id if staff_user else None,
                type="Spill",
                category="chemical",
                location="Biochemistry Lab 1",
                description="Formalin 10% solution splash on counter floor (approx 200 ml). Neutralized with absorbent spill kit.",
                priority="MEDIUM",
                status="CLOSED",
                resolution_notes="Area cleared and verified odorless after 1 hour."
            )
        ]
        db.add_all(incidents)
        db.commit()

    # 6. Knowledge Base Articles
    if db.query(KnowledgeBase).count() == 0:
        articles = [
            KnowledgeBase(
                title="WHO & National Color Coding Guidelines for Biomedical Waste",
                category="Segregation",
                language="en",
                content="""
# Biomedical Waste Color Coding Standard

### 1. Yellow Category (Incineration / Deep Burial / Autoclave)
- **Included Waste:** Human anatomical parts, tissues, organs, animal anatomical waste, soiled cotton, plaster casts, expired pharmaceuticals, cytotoxic drugs, chemical liquid waste.
- **Packaging:** Non-chlorinated yellow plastic bags or containers marked with biohazard symbol.

### 2. Red Category (Autoclaving / Shredding / Recycling)
- **Included Waste:** Contaminated recyclable plastics: disposable tubing, IV bottles, catheters, urine bags, disposable gloves, syringes without needles.
- **Packaging:** Red colored non-chlorinated plastic bags.

### 3. White Category (Puncture-Proof Sharps)
- **Included Waste:** Waste sharps including needles, syringes with fixed needles, scalpels, surgical blades, and contaminated glass fragments that can cause puncture/cut.
- **Packaging:** Puncture-proof, tamper-proof, translucent containers.

### 4. Blue Category (Disinfection / Recycling)
- **Included Waste:** Broken or intact medicine vials, ampoules, glassware, and orthopedic metal implants.
- **Packaging:** Puncture-resistant blue cardboard boxes or rigid blue bins.
                """,
                tags=["color-coding", "segregation", "who-guidelines"]
            ),
            KnowledgeBase(
                title="Post-Exposure Prophylaxis (PEP) Protocol for Needle-Stick Injuries",
                category="Sharps safety",
                language="en",
                content="""
# Needle-Stick Injury Immediate Emergency Action

### Step 1: First Aid at Incident Site (0 to 5 minutes)
- Wash the injury site immediately with mild soap and water under cold running water.
- **DO NOT squeeze or scrub** the puncture site. Squeezing promotes tissue micro-tearing.
- Do NOT apply strong caustic agents (bleach or iodine tincture) directly into the puncture wound.

### Step 2: Reporting (Within 1 hour)
- Report immediately to the Nursing Supervisor and Hospital Infection Control Officer (HICO).
- Document source patient identity, HIV/HBV/HCV serostatus if known.

### Step 3: Medical Evaluation & PEP (Within 2 hours)
- High efficacy requires starting PEP within 2 hours of exposure (maximum window 72 hours).
- Baseline blood samples collected for recipient and source.
                """,
                tags=["sharps", "needle-stick", "pep", "emergency"]
            ),
            KnowledgeBase(
                title="பயோமெடிக்கல் கழிவு மேலாண்மை - வழிகாட்டுதல் (Biomedical Waste Segregation)",
                category="Segregation",
                language="ta",
                content="""
# மருத்துவ கழிவு மேலாண்மை வழிகாட்டல்

### மஞ்சள் தொட்டி (Yellow Bin)
உடற்கூறியல் கழிவுகள், ரத்தம் படிந்த பஞ்சு, கெட்டுப்போன மருந்துகள், நச்சு கழிவுகள்.

### சிவப்பு தொட்டி (Red Bin)
மறுசுழற்சி செய்யக்கூடிய பிளாஸ்டிக் கழிவுகள்: ஐவி குழாய்கள், யூரின் பைகள், கையுறைகள்.

### வெள்ளை தொட்டி (White Bin)
ஊசிகள், அறுவைசிகிச்சை கத்திகள், ஊடுருவ முடியாத கொள்கலன்கள்.

### நீல தொட்டி (Blue Bin)
உடைந்த மற்றும் உடையாத கண்ணாடி மருந்துக் குப்பிகள் (Vials and Ampoules).
                """,
                tags=["tamil", "segregation", "bins"]
            ),
            KnowledgeBase(
                title="जैव चिकित्सा अपशिष्ट पृथक्करण दिशानिर्देश (Biomedical Waste Segregation)",
                category="Segregation",
                language="hi",
                content="""
# जैव चिकित्सा अपशिष्ट प्रबंधन निर्देश

### पीला डिब्बा (Yellow Bin)
संक्रमित कचरा, रक्त से सने कपड़े, मानव अंग, समाप्त दवाएं।

### लाल डिब्बा (Red Bin)
संक्रमित प्लास्टिक कचरा: आईवी बोतलें, कैथेटर, दस्ताने।

### सफेद डिब्बा (White Translucent)
नुकीला कचरा: सुई, सीरिंज, स्केलपेल (Puncture-proof container).

### नीला डिब्बा (Blue Bin)
कांच की शीशियां, दवा की शीशियां और धातु प्रत्यारोपण।
                """,
                tags=["hindi", "segregation", "bins"]
            )
        ]
        db.add_all(articles)
        db.commit()

    # 7. Notifications
    if db.query(Notification).count() == 0:
        notifs = [
            Notification(
                title="High-Capacity Alert: OT Sharps Bin",
                message="Operation Theatre Suite 2 sharps container has reached 94.5% capacity. Collection required.",
                type="ALERT",
                is_read=False,
                link="/smart-collection"
            ),
            Notification(
                title="Critical Incident Under Review",
                message="Needle-stick incident logged in ICU Ward Bed 12. Infection control review in progress.",
                type="WARNING",
                is_read=False,
                link="/incidents"
            ),
            Notification(
                title="SmartBioWaste AI System Ready",
                message="AI detection and rule engine initialized. System operating in demo/production ready mode.",
                type="INFO",
                is_read=True,
                link="/dashboard"
            )
        ]
        db.add_all(notifs)
        db.commit()

    # 8. Pre-seed Past Week Scans for Analytics
    if db.query(WasteScan).count() == 0:
        sample_scans = [
            ("sharps", "Sharps Waste", 0.972, "High", "High", "WHITE", 6),
            ("infectious", "Infectious Soiled Waste", 0.941, "High", "High", "YELLOW", 5),
            ("contaminated_recyclable", "Contaminated Plastic IV Tubing", 0.885, "High", "Moderate", "RED", 5),
            ("glassware", "Glass Ampoule / Vial", 0.912, "High", "Moderate", "BLUE", 4),
            ("chemical", "Disinfectant Chemical Bottle", 0.865, "High", "High", "YELLOW", 4),
            ("general", "Clean Paper Packaging", 0.954, "High", "Low", "BLACK", 3),
            ("pharmaceutical", "Discarded Antibiotic Tablets", 0.892, "High", "High", "YELLOW", 3),
            ("infectious", "Blood-Soiled Gauze Pack", 0.938, "High", "High", "YELLOW", 2),
            ("sharps", "Disposable Syringe with Needle", 0.965, "High", "High", "WHITE", 2),
            ("contaminated_recyclable", "Disposable Nitrile Gloves", 0.910, "High", "Moderate", "RED", 1),
            ("sharps", "Used Surgical Scalpel Blade", 0.981, "High", "High", "WHITE", 1),
            ("infectious", "Drainage Fluid Soiled Cotton", 0.925, "High", "High", "YELLOW", 0),
            ("glassware", "Laboratory Test Tube Fragment", 0.899, "High", "Moderate", "BLUE", 0),
        ]

        now = datetime.datetime.utcnow()
        for cat, display, conf, conf_lvl, risk, bin_col, days_ago in sample_scans:
            rule = WASTE_RULES.get(cat, {})
            scan = WasteScan(
                user_id=staff_user.id if staff_user else None,
                image_path="/uploads/sample_scan.jpg",
                predicted_class=cat,
                display_name=display,
                confidence=conf,
                confidence_level=conf_lvl,
                risk_level=risk,
                recommended_bin=bin_col,
                segregation_method=rule.get("segregation_method"),
                handling_method=rule.get("handling_method"),
                disposal_method=rule.get("disposal_method"),
                ppe_used=rule.get("ppe", []),
                safety_precautions=rule.get("safety_precautions", []),
                emergency_action=rule.get("emergency_action"),
                gradcam_path="/uploads/gradcam/sample_gradcam.jpg",
                is_demo=True,
                created_at=now - datetime.timedelta(days=days_ago, hours=2)
            )
            db.add(scan)
        db.commit()
