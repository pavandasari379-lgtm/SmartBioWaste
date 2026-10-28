"""
Biomedical Waste Segregation & Safety Rule Engine
Compliant with WHO, CDC, and National Biomedical Waste Management Guidelines.
"""

from typing import Dict, Any, List

WASTE_RULES: Dict[str, Dict[str, Any]] = {
    "infectious": {
        "class_name": "infectious",
        "display_name": "Infectious / Soiled Waste",
        "recommended_bin": "YELLOW",
        "bin_color_hex": "#EAB308",
        "risk_level": "High",
        "segregation_method": "Segregate immediately at point of generation into non-chlorinated yellow bags bearing international biohazard symbol. Never mix with general municipal waste or sharps.",
        "handling_method": "Handle bag by tied top only. Do not overfill beyond 3/4 capacity. Seal securely using cable ties or barcoded hospital closure. Never compress or squeeze bags manually.",
        "disposal_method": "High-temperature incineration (>1100°C) or validated autoclaving / microwaving followed by shredding. Follow approved biomedical waste treatment facility (CBMWTF) handover.",
        "ppe": [
            "Heavy-duty nitrile gloves",
            "Impermeable fluid-resistant apron / gown",
            "N95 / surgical mask",
            "Protective eye goggles or face shield",
            "Closed puncture-resistant safety boots"
        ],
        "safety_precautions": [
            "Always inspect yellow bag for punctures or leakage before lifting",
            "Keep hands away from body while carrying waste",
            "Wash hands thoroughly with chlorhexidine soap after removing PPE",
            "Decontaminate exterior bag surfaces if contact with bodily fluid occurred"
        ],
        "emergency_action": "In case of bag rupture or bodily fluid splash: Immediately isolate area, alert surrounding personnel, apply 1% sodium hypochlorite for 20 minutes, absorb with paper towels, and dispose of clean-up materials in fresh yellow bag."
    },
    "sharps": {
        "class_name": "sharps",
        "display_name": "Sharps Waste (Needles, Scalpels, Lancets)",
        "recommended_bin": "WHITE",
        "bin_color_hex": "#F8FAFC",
        "risk_level": "High",
        "segregation_method": "Immediately drop all contaminated needles, scalpels, blades, and trocars directly into puncture-proof, tamper-evident white translucent containers. Never recap, bend, or hand-strip needles.",
        "handling_method": "Use needle burner / syringe destroyer at point of use whenever possible. Transport container using integrated safety carry handle only. Lock container permanently when 3/4 full.",
        "disposal_method": "Autoclaving or dry heat sterilization followed by shredding / mutilation or encapsulation in cement-concrete matrix before sanitary landfill disposal.",
        "ppe": [
            "Puncture-resistant heavy-duty utility gloves",
            "Lab coat / fluid-resistant gown",
            "Safety goggles with side shields",
            "Closed-toe puncture-proof shoes"
        ],
        "safety_precautions": [
            "NEVER manually recap needles under any circumstance",
            "NEVER reach into waste bins or attempt to retrieve fallen items",
            "Keep puncture-proof container within arm's reach during clinical procedures",
            "Report any defective or overfilled container immediately"
        ],
        "emergency_action": "NEEDLE-STICK INJURY PROTOCOL: Wash immediately under cold running water with soap for 5 minutes. DO NOT squeeze or scrub wound. Apply antiseptic, record source patient details, report to Infection Control Officer within 1 hour, and initiate post-exposure prophylaxis (PEP) within 2 hours."
    },
    "contaminated_recyclable": {
        "class_name": "contaminated_recyclable",
        "display_name": "Contaminated Recyclable Plastic Waste",
        "recommended_bin": "RED",
        "bin_color_hex": "#EF4444",
        "risk_level": "Moderate",
        "segregation_method": "Place tubing, IV bottles, catheters, urine bags, disposable gloves, and syringes without needles into red non-chlorinated plastic bags or bins.",
        "handling_method": "Ensure liquids and urine bags are completely drained into sanitary sewer system before bagging. Close and double-tie red bag when 3/4 capacity is reached.",
        "disposal_method": "Autoclaving / hydro-claving followed by shredding / granulation and recycling through authorized plastic recyclers. Strictly prohibited from landfilling or municipal disposal.",
        "ppe": [
            "Nitrile examination gloves",
            "Standard clinic protective gown",
            "Surgical face mask",
            "Eye protection glasses"
        ],
        "safety_precautions": [
            "Verify that no needles or sharp metal lancets are accidentally present in red bin",
            "Check that liquid containers are drained prior to disposal",
            "Do not drag red bags across hospital floors"
        ],
        "emergency_action": "If red bag leaks liquid: Cordon off area, apply absorbent pads soaked in 0.5% sodium hypochlorite solution for 15 minutes, re-bag in clean red bag."
    },
    "glassware": {
        "class_name": "glassware",
        "display_name": "Glassware & Metallic Implants",
        "recommended_bin": "BLUE",
        "bin_color_hex": "#3B82F6",
        "risk_level": "Moderate",
        "segregation_method": "Discard broken or intact medicine vials, ampoules, microscope slides, and orthopedic implants into puncture-resistant blue cardboard boxes or blue rigid containers with plastic liners.",
        "handling_method": "Never handle broken glass with bare hands. Use mechanical forceps, tongs, or brush and dustpan. Ensure box is taped securely before transit.",
        "disposal_method": "Disinfection through soaking in 1-2% sodium hypochlorite solution or autoclaving, followed by recycling through licensed glass processing facilities.",
        "ppe": [
            "Cut-resistant protective gloves",
            "Safety goggles",
            "Protective coat",
            "Sturdy protective footwear"
        ],
        "safety_precautions": [
            "Inspect container integrity to ensure glass edges do not penetrate walls",
            "Do not shake blue container",
            "Keep ampoule heads and broken vials separated from soft plastics"
        ],
        "emergency_action": "If glass shatters on floor: Alert staff, don cut-resistant gloves, use forceps to pick up large shards, sweep fine splinters with dustpan, decontaminate floor with disinfectant."
    },
    "chemical": {
        "class_name": "chemical",
        "display_name": "Chemical & Solvent Waste",
        "recommended_bin": "YELLOW",
        "bin_color_hex": "#EAB308",
        "risk_level": "High",
        "segregation_method": "Collect in amber glass or chemical-resistant HDPE containers labeled with exact chemical name, concentration, and date. Store in dedicated yellow chemical waste storage area.",
        "handling_method": "Handle under chemical fume hood. Do not mix incompatible chemicals (e.g., acids with cyanides or bleach). Keep secondary containment trays beneath all chemical bottles.",
        "disposal_method": "Chemical neutralization, recovery of solvents, or high-temperature hazardous waste incineration through authorized TSDF (Treatment, Storage, and Disposal Facility).",
        "ppe": [
            "Chemical-resistant neoprene / butyl gloves",
            "Full face shield + chemical splash goggles",
            "Vapor respirator (organic vapor / acid cartridge)",
            "Heavy chemical apron"
        ],
        "safety_precautions": [
            "Store away from direct sunlight, heat, and ignition sources",
            "Never pour hazardous hospital chemicals down laboratory sinks or drains",
            "Check SDS (Safety Data Sheet) before handling unknown chemical reagents"
        ],
        "emergency_action": "CHEMICAL SPILL: Evacuate room if vapor is pungent. Deploy specialized chemical spill kit (neutralizing absorbent pads). In case of eye contact, flush in eye-wash fountain for 15 minutes continuously."
    },
    "pharmaceutical": {
        "class_name": "pharmaceutical",
        "display_name": "Expired / Discarded Pharmaceutical Waste",
        "recommended_bin": "YELLOW",
        "bin_color_hex": "#EAB308",
        "risk_level": "High",
        "segregation_method": "Segregate expired medicines, discarded drugs, cytotoxic oncology drugs, and contaminated pharmaceutical packaging into designated yellow containers labeled 'CYTOTOXIC / PHARMA WASTE'.",
        "handling_method": "Cytotoxic drugs require purple-striped cytotoxic seal. Keep locked in pharmacy holding area until dispatch to licensed disposal operator.",
        "disposal_method": "High-temperature incineration at >1200°C for cytotoxic drugs; encapsulation or inertization for non-cytotoxic pharmaceuticals; return to manufacturer if recall program exists.",
        "ppe": [
            "Double chemotherapy-tested nitrile gloves",
            "Impermeable non-linting protective gown",
            "N95 respiratory mask",
            "Eye goggles"
        ],
        "safety_precautions": [
            "Never crush discarded tablets manually without respiratory ventilation",
            "Ensure controlled drug register log is signed off prior to disposal",
            "Never dispose of antibiotics down hospital plumbing"
        ],
        "emergency_action": "Cytotoxic spill: Utilize designated cytotoxic spill kit, absorb liquid, neutralize if instructed on drug monograph, double bag in cytotoxic yellow container."
    },
    "anatomical": {
        "class_name": "anatomical",
        "display_name": "Human Anatomical / Pathological Waste",
        "recommended_bin": "YELLOW",
        "bin_color_hex": "#EAB308",
        "risk_level": "Critical",
        "segregation_method": "Place human tissues, organs, body parts, fetuses, and placenta into leak-proof, heavy-gauge yellow biohazard bags.",
        "handling_method": "Refrigerate at 2°C - 8°C if storage exceeds 24 hours. Keep storage room secured and restricted to authorized personnel only. Never store longer than 48 hours.",
        "disposal_method": "Incineration or deep burial in authorized sanitary pits according to Bio-Medical Waste Management Rules.",
        "ppe": [
            "Double heavy nitrile / latex surgical gloves",
            "Waterproof surgical apron / fluid-shield gown",
            "Face shield + N95 particulate mask",
            "Fluid-impermeable boot covers"
        ],
        "safety_precautions": [
            "Ensure bag is double-bagged to prevent leakage during handling",
            "Do not transport anatomical waste through public patient corridors",
            "Maintain chain of custody and signed manifest documentation"
        ],
        "emergency_action": "If anatomical bag ruptures: Immediately cordon off area with hazard tape. Decontaminate with 10% sodium hypochlorite for 30 minutes, re-bag in clean yellow biohazard container, notify Hospital Safety Officer."
    },
    "general": {
        "class_name": "general",
        "display_name": "General Non-Infectious Municipal Waste",
        "recommended_bin": "BLACK",
        "bin_color_hex": "#334155",
        "risk_level": "Low",
        "segregation_method": "Place non-contaminated office paper, dry food packaging, fruit peels, cardboard boxes, and hand-drying paper towels in black or green municipal waste bins.",
        "handling_method": "Ensure no contact with patients or clinical fluids has occurred. Empty into municipal disposal bins daily.",
        "disposal_method": "Municipal composting for biodegradable food waste; municipal recycling sorting for clean paper and cardboard; standard sanitary landfill for residue.",
        "ppe": [
            "Standard household / cotton gloves",
            "Normal work uniform"
        ],
        "safety_precautions": [
            "NEVER place items with even minor blood or bodily fluid traces in general waste",
            "If doubtful, classify as infectious waste rather than general waste",
            "Keep general bins covered to prevent pest infestation"
        ],
        "emergency_action": "If clinical waste is mistakenly found in general bin: Treat the entire bin as INFECTIOUS, seal and transfer into Yellow Biohazard Bin. Do not pick through mixed contents."
    },
    "radiological_hazard": {
        "class_name": "radiological_hazard",
        "display_name": "Suspected Radiological / Radioactive Hazard",
        "recommended_bin": "RADIATION_ALERT",
        "bin_color_hex": "#854D0E",
        "risk_level": "Critical",
        "segregation_method": "CRITICAL PROTOCOL: DO NOT TOUCH. DO NOT MOVE. DO NOT PLACE IN NORMAL BIOMEDICAL-WASTE BIN (Yellow, Red, White, or Blue). Must be managed in lead-shielded containers with radiation trefoil symbol.",
        "handling_method": "Evacuate personnel from immediate perimeter. Strictly maintain time, distance, and shielding principles. Allow only licensed Radiation Safety Officer (RSO) to access.",
        "disposal_method": "Store in designated radioactive decay storage room until radioactivity drops below clearance levels, or dispatch to Atomic Energy Regulatory Board (AERB) approved radioactive waste disposal repository.",
        "ppe": [
            "Radiation dosimetry badge (TLD badge)",
            "Lead apron (0.5 mm lead equivalence)",
            "Lead thyroid shield",
            "Disposable lead-lined gloves"
        ],
        "safety_precautions": [
            "IMMEDIATE STOP: Keep at least 3 meters away from suspected radioactive source",
            "Post radiation hazard warning tape and sign around the area",
            "Do NOT attempt to clean, wipe, or incinerate radioactive items",
            "Measure radiation levels using a calibrated Geiger-Muller counter"
        ],
        "emergency_action": "RADIATION INCIDENT PROTOCOL: Immediately notify Radiation Safety Officer (RSO) and Hospital Emergency Operations Center. Seal off HVAC ventilation if airborne particulate is suspected. Record names of all personnel in proximity for dosimetric assessment."
    }
}

CONFIDENCE_THRESHOLDS = {
    "HIGH": 0.85,
    "MODERATE": 0.60
}

def get_confidence_level(confidence: float) -> str:
    if confidence >= CONFIDENCE_THRESHOLDS["HIGH"]:
        return "High"
    elif confidence >= CONFIDENCE_THRESHOLDS["MODERATE"]:
        return "Moderate"
    else:
        return "Low"

def get_waste_rule(category_name: str) -> Dict[str, Any]:
    cat = category_name.lower().strip()
    if cat in WASTE_RULES:
        return WASTE_RULES[cat]
    # Default fallback
    return {
        "class_name": cat,
        "display_name": cat.replace("_", " ").title() + " Waste",
        "recommended_bin": "YELLOW",
        "bin_color_hex": "#EAB308",
        "risk_level": "High",
        "segregation_method": "Place in approved yellow biohazard bag for standard biomedical waste management.",
        "handling_method": "Handle using standard hospital protective procedures. Seal bag when 3/4 full.",
        "disposal_method": "Autoclaving or high-temperature incineration via approved biomedical waste facility.",
        "ppe": ["Nitrile gloves", "Protective coat", "Face mask"],
        "safety_precautions": ["Follow standard precautions. Avoid direct skin contact."],
        "emergency_action": "Isolate item, disinfect perimeter with 1% hypochlorite, and notify supervisor."
    }
