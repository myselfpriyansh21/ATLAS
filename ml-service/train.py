"""
Generates synthetic training data and trains three models:

1. RUL Regressor       — RandomForestRegressor predicting remaining useful
                          life (days) from normalized sensor ratios.
2. Risk Classifier     — RandomForestClassifier predicting
                          normal / warning / critical.
3. Anomaly Detector    — IsolationForest trained ONLY on nominal-operation
                          samples, so it learns the "normal envelope" and
                          flags anything that falls outside it — a
                          genuinely different ML technique from the other
                          two, not just a third classifier.

Why synthetic data: this is a hackathon prototype with no historical plant
data to train on. The data is generated to mirror the same threshold
structure used in the frontend simulation engine (see
src/lib/simulation/seedData.ts) — normalized ratios of sensor value to
each metric's "safe max" threshold — so the model's input space matches
what the frontend will actually send at inference time.

Run: python train.py
Output: models/rul_regressor.joblib, models/risk_classifier.joblib,
        models/anomaly_detector.joblib, models/anomaly_threshold.joblib
"""

import numpy as np
import joblib
from pathlib import Path
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier, IsolationForest
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, accuracy_score

RNG = np.random.default_rng(42)
N_SAMPLES = 8000
MODELS_DIR = Path(__file__).parent / "models"
MODELS_DIR.mkdir(exist_ok=True)

FEATURE_NAMES = ["temp_ratio", "pressure_ratio", "vibration_ratio", "gas_ratio"]


def generate_samples(n: int):
    """
    Each sample represents one asset's sensor reading, expressed as ratios
    of (value / safe_max_threshold) for up to 4 channels. A ratio of 1.0
    means "right at the safe limit"; higher means past it.

    We sample an overall "severity" per asset, then distribute it across
    a random subset of channels (mimicking a single degrading component
    rather than uniform wear), and randomly zero out channels to mimic
    sensors that don't apply to a given asset type (e.g. tanks have no
    gas sensor).
    """
    severities = RNG.beta(1.6, 3.5, n) * 2.2  # skewed toward lower severity, long tail to ~2.2

    features = np.zeros((n, len(FEATURE_NAMES)))
    for i in range(n):
        severity = severities[i]
        n_channels = RNG.integers(1, len(FEATURE_NAMES) + 1)
        active = RNG.choice(len(FEATURE_NAMES), size=n_channels, replace=False)

        # Dominant channel carries most of the severity; others get a
        # smaller share, all with noise.
        weights = RNG.dirichlet(np.ones(n_channels))
        for idx, w in zip(active, weights):
            noise = RNG.normal(0, 0.05)
            features[i, idx] = max(0, severity * w * n_channels / len(FEATURE_NAMES) * 1.4 + noise)

        # small ambient noise even on inactive/zeroed channels, except
        # true "no sensor" cases (~30% chance per inactive channel stay exactly 0)
        for idx in range(len(FEATURE_NAMES)):
            if idx not in active and RNG.random() > 0.3:
                features[i, idx] = max(0, RNG.normal(0.15, 0.08))

    max_ratio = features.max(axis=1)
    mean_ratio = features.mean(axis=1)
    severity_score = 0.7 * max_ratio + 0.3 * mean_ratio

    # RUL: healthy assets can have long life; severity compresses it
    # sharply. This models "given current degradation trend, how long
    # until failure" rather than an asset's total lifetime.
    rul = np.clip(200 * np.exp(-3.3 * severity_score) + RNG.normal(0, 4, n), 0.3, 200)

    risk_class = np.where(
        severity_score < 0.55, "normal",
        np.where(severity_score < 0.95, "warning", "critical")
    )

    return features, rul, risk_class, severity_score


def main():
    features, rul, risk_class, severity_score = generate_samples(N_SAMPLES)

    print(f"Generated {N_SAMPLES} samples")
    unique, counts = np.unique(risk_class, return_counts=True)
    print("Class balance:", dict(zip(unique, counts)))

    X_train, X_test, y_rul_train, y_rul_test, y_cls_train, y_cls_test = train_test_split(
        features, rul, risk_class, test_size=0.2, random_state=42
    )

    # ── 1. RUL Regressor ──────────────────────────────────────
    rul_model = RandomForestRegressor(n_estimators=200, max_depth=10, random_state=42, n_jobs=-1)
    rul_model.fit(X_train, y_rul_train)
    rul_pred = rul_model.predict(X_test)
    print(f"RUL Regressor — MAE: {mean_absolute_error(y_rul_test, rul_pred):.2f} days")

    # ── 2. Risk Classifier ────────────────────────────────────
    cls_model = RandomForestClassifier(n_estimators=200, max_depth=8, random_state=42, n_jobs=-1)
    cls_model.fit(X_train, y_cls_train)
    cls_pred = cls_model.predict(X_test)
    print(f"Risk Classifier — Accuracy: {accuracy_score(y_cls_test, cls_pred):.3f}")

    # ── 3. Anomaly Detector — trained ONLY on nominal samples ─
    nominal_mask = severity_score < 0.45
    nominal_features = features[nominal_mask]
    print(f"Anomaly Detector — training on {len(nominal_features)} nominal-only samples")

    anomaly_model = IsolationForest(n_estimators=200, contamination=0.05, random_state=42, n_jobs=-1)
    anomaly_model.fit(nominal_features)

    # Threshold: 5th percentile of decision_function scores on nominal
    # training data. Anything scoring below this at inference is flagged.
    nominal_scores = anomaly_model.decision_function(nominal_features)
    anomaly_threshold = float(np.percentile(nominal_scores, 5))
    print(f"Anomaly threshold (decision_function): {anomaly_threshold:.4f}")

    # ── Save everything ────────────────────────────────────────
    joblib.dump(rul_model, MODELS_DIR / "rul_regressor.joblib")
    joblib.dump(cls_model, MODELS_DIR / "risk_classifier.joblib")
    joblib.dump(anomaly_model, MODELS_DIR / "anomaly_detector.joblib")
    joblib.dump(anomaly_threshold, MODELS_DIR / "anomaly_threshold.joblib")
    joblib.dump(FEATURE_NAMES, MODELS_DIR / "feature_names.joblib")

    print(f"\nModels saved to {MODELS_DIR}/")


if __name__ == "__main__":
    main()