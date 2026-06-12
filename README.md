# HealthSense AI — Multiple Disease Prediction System

A clinical-grade mobile application for AI-powered disease risk prediction using five trained ML models.

## 🏗 Architecture

```
yog-pdd/
├── backend/          # FastAPI REST API
│   └── app/
│       ├── routers/  # auth, user, predict, chat, hospitals, report
│       ├── models/   # Pydantic schemas
│       ├── db/       # MongoDB (Motor async)
│       ├── ml/       # Model loader + SHAP predictor
│       ├── core/     # JWT, security, config
│       └── pkl/      # Trained .pkl model files ← place here after Colab
├── mobile/           # React Native (Expo) app
│   └── src/
│       ├── screens/  # All app screens
│       ├── components/ui | charts | forms
│       ├── navigation/
│       ├── store/    # Zustand stores
│       ├── services/ # Axios API layer
│       ├── utils/    # Design tokens / theme
│       └── i18n/     # en, hi, ta
├── notebooks/        # Google Colab training notebook
└── datasets/         # Source CSV datasets
```

## 🤖 ML Models

| Disease | Algorithm | Dataset |
|---|---|---|
| Diabetes | XGBoost | Pima Indians (diabetes.csv) |
| Kidney Disease | SVM-RBF | UCI CKD (kidney_disease.csv) |
| Parkinson's | SVM-Linear | UCI Parkinson's (parkinsons.data) |
| Lung Cancer | Random Forest | Survey (survey lung cancer.csv) |
| Thyroid | Gradient Boosting | thyroidDF.csv |

## 🚀 Quick Start

### Step 1 — Train Models (Google Colab)

1. Open `notebooks/HealthSense_Model_Training.ipynb` in Google Colab
2. Upload all datasets to `/content/datasets/`
3. Run all cells
4. Download `healthsense_models.zip`
5. Extract `.pkl` files to `backend/app/pkl/`

Expected files:
```
backend/app/pkl/
  diabetes_model.pkl       diabetes_scaler.pkl
  kidney_model.pkl         kidney_scaler.pkl
  parkinsons_model.pkl     parkinsons_scaler.pkl
  lung_cancer_model.pkl    lung_cancer_scaler.pkl
  thyroid_model.pkl        thyroid_scaler.pkl
  model_accuracy_report.csv
```

### Step 2 — Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env with your MongoDB URI, secret key, etc.

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs available at: `http://localhost:8000/docs`

### Step 3 — Mobile App Setup

```bash
cd mobile

# Install dependencies
npm install

# Configure API URL
# Edit .env → EXPO_PUBLIC_API_URL=http://<your-local-ip>:8000

# Start Expo
npm start

# Scan QR code with Expo Go (Android/iOS)
```

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `SECRET_KEY` | JWT signing secret (≥32 chars) | `supersecretkey...` |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token TTL | `30` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token TTL | `7` |
| `OPENAI_API_KEY` | GPT-4o API key for AI chat | `sk-...` |

### Mobile (`mobile/.env`)

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_API_URL` | Backend base URL |

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Auth |
|---|---|---|
| POST | `/auth/register` | Public |
| POST | `/auth/login` | Public |
| POST | `/auth/refresh` | Public |

### User
| Method | Endpoint | Auth |
|---|---|---|
| GET | `/user/profile` | JWT |
| PUT | `/user/profile` | JWT |
| GET | `/user/history` | JWT |

### Predictions
| Method | Endpoint | Disease |
|---|---|---|
| POST | `/predict/diabetes` | Diabetes |
| POST | `/predict/kidney` | Kidney Disease |
| POST | `/predict/parkinsons` | Parkinson's |
| POST | `/predict/lung_cancer` | Lung Cancer |
| POST | `/predict/thyroid` | Thyroid |

### Other
| Method | Endpoint | Description |
|---|---|---|
| POST | `/chat` | AI health assistant (GPT-4o) |
| GET | `/hospitals/nearby?lat=&lng=` | Nearby hospitals (OpenStreetMap) |
| POST | `/report/generate` | PDF health report |

## ☁️ Deployment

### Backend → Render

1. Push `backend/` to a GitHub repo
2. Create a new **Web Service** on [Render](https://render.com)
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add all environment variables in Render dashboard
6. Upload `.pkl` files as a persistent disk or use Cloud Storage

### Mobile → Expo EAS

```bash
npm install -g eas-cli
eas login
eas build --platform android  # or ios
```

## 🛡 Security Notes

- Tokens stored in `expo-secure-store` (never AsyncStorage)
- All prediction routes are JWT-protected
- Passwords hashed with bcrypt (passlib)
- AI chat has a strict health-only system prompt

## 📋 MongoDB Schema

See `backend/app/models/schemas.py` for complete Pydantic models.

**Collections:**
- `users` — profile, credentials, health data
- `predictions` — all disease predictions with SHAP values

## 🌐 Localization

Supported languages: **English**, **Hindi**, **Tamil**

Translation files: `mobile/src/i18n/{en,hi,ta}.json`
