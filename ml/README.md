# SmartBioWaste AI - Machine Learning Pipeline

This directory contains the computer vision training and evaluation pipeline for **SmartBioWaste AI**, leveraging transfer learning with **EfficientNet-B0** and **MobileNet-V2**.

---

## 1. Supported Waste Classes (9 Classes)

1. `infectious`: Soiled bandages, bloody cotton, dressings, plaster casts.
2. `sharps`: Syringes with needles, scalpels, surgical blades, lancets.
3. `contaminated_recyclable`: Plastic IV bottles, tubing, catheters, urine bags, gloves.
4. `glassware`: Medicine vials, ampoules, broken glass containers, metal implants.
5. `chemical`: Disinfectants, formalin, laboratory chemical reagents.
6. `pharmaceutical`: Expired tablets, capsules, cytotoxic oncology medicines.
7. `anatomical`: Human tissues, organs, body parts, placenta.
8. `general`: Office paper, cardboard packaging, food peels, clean wrappers.
9. `radiological_hazard`: Radioactive iodine/technetium items (Requires Critical Radiation Protocol).

---

## 2. Dataset Structure

Organize your dataset into standard PyTorch ImageFolder hierarchy:

```text
dataset/
├── train/
│   ├── infectious/
│   ├── sharps/
│   ├── contaminated_recyclable/
│   ├── glassware/
│   ├── chemical/
│   ├── pharmaceutical/
│   ├── anatomical/
│   ├── general/
│   └── radiological_hazard/
├── val/
│   └── ... (same subfolders)
└── test/
    └── ... (same subfolders)
```

---

## 3. Training the Models

### Train EfficientNet-B0 (Primary Model):
```bash
python training/train_efficientnet.py --data_dir ../dataset --epochs 15 --batch_size 16 --output ../models/efficientnet_b0_waste.pth
```

### Train MobileNet-V2 (Edge Comparison Model):
```bash
python training/train_mobilenet.py --data_dir ../dataset --epochs 15 --batch_size 16 --output ../models/mobilenet_v2_waste.pth
```

---

## 4. Model Evaluation

Compute overall Accuracy, Precision, Recall, F1-Score, and print Confusion Matrix:
```bash
python evaluation/evaluate.py --model ../models/efficientnet_b0_waste.pth --test_dir ../dataset/test --arch efficientnet_b0
```

---

## 5. Connecting Model to FastAPI Backend

1. Save the best checkpoint as `SmartBioWasteAI/ml/models/efficientnet_b0_waste.pth`.
2. In `backend/.env`, set:
   ```dotenv
   DEMO_MODE=false
   MODEL_PATH="../../ml/models/efficientnet_b0_waste.pth"
   ```
3. Restart the FastAPI backend. It will automatically load the weights and use real inference and Grad-CAM!
