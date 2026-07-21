# ATLAS ML Microservice — Setup

Real scikit-learn models: RUL regression, risk classification, and
anomaly detection — trained on synthetic data and served over HTTP.

## 1. Create a virtual environment

```bash
cd ml-service
python -m venv venv
```

Activate it:
- **Windows (PowerShell):** `venv\Scripts\activate`
- **Mac/Linux:** `source venv/bin/activate`

You should see `(venv)` appear at the start of your terminal prompt.

## 2. Install dependencies

```bash
pip install -r requirements.txt
```

## 3. Train the models

```bash
python train.py
```

This generates 8,000 synthetic samples and trains all three models.
You should see output like:

```
Generated 8000 samples
Class balance: {'critical': 159, 'normal': 6703, 'warning': 1138}
RUL Regressor — MAE: 4.24 days
Risk Classifier — Accuracy: 0.988
Anomaly Detector — training on 5965 nominal-only samples
Anomaly threshold (decision_function): -0.0000

Models saved to models/
```

A `models/` folder will appear with 5 `.joblib` files — these are your
trained models. You only need to run this once (re-run any time you want
fresh randomized training data).

## 4. Start the service

```bash
uvicorn app:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

Leave this running in its own terminal — it needs to stay open alongside
your `npm run dev` terminal.

## 5. Verify it works

Open a new terminal (or your browser) and check:
```
http://localhost:8000/health
```
Should return:
```json
{"status":"ok","models_loaded":true,"feature_names":["temp_ratio","pressure_ratio","vibration_ratio","gas_ratio"]}
```

## How it connects to the frontend

The frontend's Predictive Engine page (`http://localhost:5173/predictive-engine`)
calls this service automatically every few seconds for whichever asset
you have selected. If this service isn't running, that page will show a
clear "ML service offline" message with these exact setup steps — it
won't crash or hang.

## What each model actually does

- **RUL Regressor** (`RandomForestRegressor`) — predicts remaining useful
  life in days from 4 normalized sensor ratios
- **Risk Classifier** (`RandomForestClassifier`) — predicts
  normal / warning / critical with probability breakdowns
- **Anomaly Detector** (`IsolationForest`) — trained *only* on nominal
  operating data, so it learns the "normal envelope" and flags anything
  that falls outside it. This is a genuinely different ML technique from
  the other two (unsupervised vs. supervised) — worth mentioning if judges
  ask about your ML approach specifically, since it shows real technique
  diversity rather than three variations of the same idea.

## Retraining with different data

Everything about the synthetic data generation lives in `train.py` in the
`generate_samples()` function — if you want to tune how aggressive the
degradation curves are, or add more feature channels later, that's the
one function to edit. Re-run `python train.py` afterward to regenerate
the `.joblib` files.