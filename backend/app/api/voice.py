from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import KnowledgeBase
from app.schemas.schemas import VoiceQueryRequest, VoiceQueryResponse
from app.rules.waste_rules import WASTE_RULES

router = APIRouter(prefix="/voice", tags=["Voice Assistant"])

KEYWORD_MAPPINGS = {
    "sharps": ["syringe", "needle", "scalpel", "blade", "lancet", "catheter needle", "trocar", "ஊசி", "சுई"],
    "infectious": ["cotton", "gauze", "blood", "dressing", "soiled", "bandage", "pus", "plaster", "பஞ்சு", "पट्टी"],
    "contaminated_recyclable": ["iv bottle", "saline", "tubing", "catheter", "urine bag", "glove", "plastic", "குழாய்", "दस्ताने"],
    "glassware": ["glass", "vial", "ampoule", "beaker", "slide", "broken bottle", "கண்ணாடி", "शीशी"],
    "chemical": ["chemical", "formalin", "reagent", "acid", "disinfectant", "ether", "வேதியியல்", "रसायन"],
    "pharmaceutical": ["medicine", "tablet", "pill", "capsule", "drug", "expired", "மருந்து", "दवा"],
    "anatomical": ["tissue", "organ", "body part", "placenta", "fetus", "biopsy", "உறுப்பு", "अंग"],
    "general": ["paper", "cardboard", "wrapper", "peel", "food", "cup", "தாள்", "कागज"],
    "radiological_hazard": ["radiation", "radioactive", "iodine 131", "technetium", "nuclear", "கதிர்வீச்சு", "विकिरण"]
}

@router.post("/query", response_model=VoiceQueryResponse)
def handle_voice_query(req: VoiceQueryRequest, db: Session = Depends(get_db)):
    q = req.query.lower().strip()
    lang = req.language.lower()

    detected_category = None
    for category, kws in KEYWORD_MAPPINGS.items():
        for kw in kws:
            if kw in q:
                detected_category = category
                break
        if detected_category:
            break

    if detected_category:
        rule = WASTE_RULES.get(detected_category, {})
        bin_col = rule.get("recommended_bin", "YELLOW")
        disp_name = rule.get("display_name", detected_category)

        if lang == "ta":
            if detected_category == "radiological_hazard":
                resp_text = "எச்சரிக்கை! கதிர்வீச்சு அபாயம் உள்ள பொருளைத் தொடாதீர்கள். உடனே பாதுகாப்பு அலுவலரைத் தொடர்பு கொள்ளவும்."
            else:
                resp_text = f"இது {disp_name} வகையைச் சார்ந்தது. இதனை {bin_col} நிற தொட்டியில் போடவும். முறையான பாதுகாப்பு கையுறைகளைப் பயன்படுத்தவும்."
        elif lang == "hi":
            if detected_category == "radiological_hazard":
                resp_text = "सावधान! संदिग्ध विकिरण सामग्री को न छुएं। तुरंत विकिरण सुरक्षा अधिकारी से संपर्क करें।"
            else:
                resp_text = f"यह {disp_name} श्रेणी का कचरा है। इसे {bin_col} डिब्बे में डालें और सुरक्षा नियमों का पालन करें।"
        else:
            if detected_category == "radiological_hazard":
                resp_text = "CRITICAL ALERT: Suspected radiation hazard! DO NOT TOUCH OR MOVE. Do not place in normal waste bins. Immediately contact your Radiation Safety Officer."
            elif detected_category == "sharps":
                resp_text = f"A used syringe or sharp item is classified as {disp_name}. Never recap or bend needles. Place it immediately into the puncture-proof {bin_col} container."
            else:
                resp_text = f"This item is classified as {disp_name}. Segregate it immediately into the approved {bin_col} container. {rule.get('handling_method', '')}"

        return VoiceQueryResponse(
            query=req.query,
            response_text=resp_text,
            detected_category=detected_category,
            recommended_bin=bin_col,
            safety_summary=f"Required PPE: {', '.join(rule.get('ppe', [])[:3])}.",
            source="Rule Engine & Verified Knowledge Base"
        )

    # Search in knowledge base if not directly matched by keyword
    kb_match = (
        db.query(KnowledgeBase)
        .filter(KnowledgeBase.title.ilike(f"%{q}%") | KnowledgeBase.content.ilike(f"%{q}%"))
        .first()
    )
    if kb_match:
        summary = kb_match.content.strip().split("\n")[0]
        return VoiceQueryResponse(
            query=req.query,
            response_text=f"According to hospital protocol '{kb_match.title}': {summary[:180]}...",
            detected_category="guideline",
            recommended_bin="FACILITY_SOP",
            safety_summary="Follow standard hospital precautions.",
            source="Knowledge Base"
        )

    # Default general guidance
    if lang == "ta":
        default_resp = "மன்னிக்கவும், அந்த கழிவு வகை தெளிவாகப் புரியவில்லை. தயவுசெய்து மஞ்சள் அல்லது சிவப்பு அல்லது வெள்ளை தொட்டி வழிகாட்டலைப் பார்க்கவும்."
    elif lang == "hi":
        default_resp = "माफ़ कीजिये, यह स्पष्ट नहीं हो पाया। कृपया बायोमेडिकल अपशिष्ट दिशानिर्देश देखें या सुरक्षा अधिकारी से संपर्क करें।"
    else:
        default_resp = "I could not identify the specific waste item with complete certainty. In biomedical facilities, when uncertain, never place items in general bins. Consult your Infection Control Officer or check the Knowledge Base."

    return VoiceQueryResponse(
        query=req.query,
        response_text=default_resp,
        detected_category=None,
        recommended_bin=None,
        safety_summary="When in doubt, apply maximum precautionary PPE.",
        source="Biomedical Decision Support Policy"
    )
