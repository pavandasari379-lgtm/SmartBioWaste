# SmartBioWaste AI

### AI-Powered Biomedical Waste Classification, Segregation, Safe Handling and Collection Management System

**SmartBioWaste AI** is a full-stack, institutional-grade clinical waste decision support and facility management platform built for healthcare organizations, infection control teams, and environmental safety officers.

The system combines computer vision (**EfficientNet-B0** with **Grad-CAM** visual explainability), an institutional **Bio-Safety Rule Engine**, **PostgreSQL** persistence, real-time hospital bin tracking, scikit-learn waste load forecasting, incident triage, and hands-free voice assistance in **English, Tamil (தமிழ்), and Hindi (हिंदी)**.

---

## 1. System Architecture

```text
               +---------------------------------------------------+
               |               React + Vite Frontend               |
               | (Dashboard, Detection, Camera, Voice, Analytics)  |
               +-------------------------+-------------------------+
                                         | REST APIs (HTTP / JSON)
                                         v
               +---------------------------------------------------+
               |               FastAPI Python Backend              |
               +---------+-----------------+-----------------+-----+
                         |                 |                 |
                         v                 v                 v
                 +---------------+  +--------------+  +--------------+
                 | PyTorch ML    |  | Bio-Safety   |  | PostgreSQL   |
                 | EfficientNet  |  | Rule Engine  |  | Database     |
                 | & Grad-CAM    |  | & SOPs       |  | (SQLAlchemy) |
                 +---------------+  +--------------+  +--------------+
```

---

## 2. Technology Stack

- **Frontend**: React 19, Vite, React Router 7, Tailwind CSS v4, Lucide React, Recharts.
- **Backend**: Python 3.14 / 3.11+, FastAPI, Uvicorn, SQLAlchemy ORM, Pydantic v2, PyJWT, Passlib / Bcrypt, python-multipart.
- **Computer Vision & ML**: PyTorch 2.x, Torchvision, OpenCV, Pillow, Grad-CAM.
- **Analytics & Forecasting**: Pandas, NumPy, Scikit-learn (Ridge Regression).
- **Database**: PostgreSQL 18 / 16 (with automatic local fallback).
- **Audio & Accessibility**: Web Speech Recognition API & Web SpeechSynthesis API.

---

## 3. Project Structure

```text
SmartBioWasteAI/
├── frontend/
│   ├── src/
│   │   ├── components/         # BinBadge, Header, Sidebar, CameraModal, GradCamViewer, StatCard
│   │   ├── pages/              # 16 Complete Pages (Dashboard, Detection, Result, Voice, etc.)
│   │   ├── layouts/            # MainLayout, ProtectedRoute
│   │   ├── services/           # api.js (Centralized REST API service)
│   │   ├── hooks/              # useAuth.jsx, useLanguage.jsx
│   │   ├── translations/       # en.json, ta.json (Tamil), hi.json (Hindi)
│   │   ├── App.jsx             # React Router routing table
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Tailwind CSS styles & themes
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── app/
│   │   ├── api/                # auth, prediction, waste, safety, analytics, collection, incidents, knowledge, voice, admin
│   │   ├── database/           # database.py, models.py (10 SQLAlchemy tables)
│   │   ├── ml/                 # model.py, preprocessing.py, prediction.py, gradcam.py, model_loader.py
│   │   ├── rules/              # waste_rules.py (WHO/CDC medical segregation rules)
│   │   ├── schemas/            # schemas.py (Pydantic validation models)
│   │   ├── services/           # analytics_service.py (forecasting & stats)
│   │   ├── auth/               # security.py (Bcrypt & JWT tokens)
│   │   ├── utils/              # seed_data.py (Initial hospital data & users)
│   │   ├── config.py           # Application settings
│   │   └── main.py             # FastAPI entrypoint
│   ├── setup_postgres.py       # One-click PostgreSQL setup script
│   ├── test_api.py             # 11-test end-to-end verification suite
│   ├── requirements.txt
│   ├── .env.example
│   └── .env
│
├── ml/
│   ├── dataset/                # Dataset directory structure
│   ├── training/               # train_efficientnet.py, train_mobilenet.py
│   ├── evaluation/             # evaluate.py (Accuracy, F1, Confusion Matrix)
│   └── models/                 # Model checkpoints (.pth)
│
├── uploads/                    # Uploaded waste photos
│   └── gradcam/                # Grad-CAM generated heatmaps
│
├── README.md
└── .gitignore
```

---

## 4. Setup & Running Locally in VS Code

### Prerequisites
- **Python 3.10+** (Python 3.14 verified)
- **Node.js 18+** (Node.js 24 verified)
- **PostgreSQL 14+** (PostgreSQL 18 running locally)

---

### Step 1: Backend Setup

Open a terminal in VS Code:

```bash
cd .\backend
```

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Configure PostgreSQL Database:
   - Run the automated setup helper:
     ```bash
     python setup_postgres.py
     ```
   - Or manually edit `backend/.env`:
     ```dotenv
     DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/smartbiowaste"
     SECRET_KEY="smartbiowaste-ai-production-super-secret-key-2026"
     DEMO_MODE=true
     MODEL_PATH="../../ml/models/efficientnet_b0_waste.pth"
     ```

3. Start the FastAPI backend:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

The backend will start at `http://localhost:8000`.
Interactive API documentation: `http://localhost:8000/docs`.

---

### Step 2: Frontend Setup

Open a second terminal in VS Code:

```bash
cd .\frontend
```

1. Install NPM packages:
   ```bash
   npm install
   ```

2. Start the Vite React development server:
   ```bash
   npm run dev
   ```

The frontend will open at `http://localhost:5173`.

---

## 5. Default Test Accounts (Pre-Seeded)

The system automatically initializes default hospital staff accounts on first launch:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Administrator** | `admin@smartbiowaste.ai` | `Admin@12345` | Full access (Admin console, user management, rule configuration) |
| **Healthcare Staff** | `staff@smartbiowaste.ai` | `Staff@12345` | AI detection, incident filing, scan history, knowledge base |
| **Waste Collector** | `collector@smartbiowaste.ai` | `Collector@12345` | Collection safety checklist, bin monitoring, task execution |

*You can also click the quick-login test buttons on the login page.*

---

## 6. Machine Learning Pipeline (EfficientNet-B0)

### Supported Classes (9 Classes)
1. `infectious` (Yellow Bin)
2. `sharps` (White Puncture-Proof Bin)
3. `contaminated_recyclable` (Red Bin)
4. `glassware` (Blue Box)
5. `chemical` (Yellow Bin / Hazardous Protocol)
6. `pharmaceutical` (Yellow Bin)
7. `anatomical` (Yellow Bin)
8. `general` (Black / Green Non-Biomedical Bin)
9. `radiological_hazard` (**Critical Alert Protocol: DO NOT TOUCH / RSO notification**)

### Training the Model:
```bash
cd .\ml
python training/train_efficientnet.py --data_dir dataset --epochs 15 --batch_size 16 --output models/efficientnet_b0_waste.pth
```

### Comparing with MobileNet-V2:
```bash
python training/train_mobilenet.py --data_dir dataset --epochs 15 --batch_size 16 --output models/mobilenet_v2_waste.pth
```

### Evaluating Model:
```bash
python evaluation/evaluate.py --model models/efficientnet_b0_waste.pth --test_dir dataset/test --arch efficientnet_b0
```

### Switching to Production Real Inference:
In `backend/.env`:
```dotenv
DEMO_MODE=false
MODEL_PATH="../../ml/models/efficientnet_b0_waste.pth"
```
Restart the backend, and the application will load the weights and execute live layer-wise Grad-CAM backpropagation!

---

## 7. Verifying the System

Run the complete 11-step verification test suite:

```bash
cd SmartBioWasteAI/backend
python test_api.py
```

All 11 tests will execute and confirm:
- Health check
- JWT Authentication & Profile
- Blur, brightness, and resolution inspection
- AI prediction & Grad-CAM heatmap generation
- Rule Engine bin allocation & PPE retrieval
- Real-time hospital analytics & trends
- Smart collection bin status
- Incident logging and triage
- Grounded Voice Assistant answering
- Scikit-learn waste load regression modeling

---

## 8. Safety & Compliance Notice

SmartBioWaste AI is an advanced decision-support system. All hospital staff must adhere to institutional infection control SOPs and regulatory guidelines. For low-confidence (<60%) predictions, ambiguous items, or suspected radiation hazards, the system explicitly requires human verification by an Infection Control or Radiation Safety Officer.
