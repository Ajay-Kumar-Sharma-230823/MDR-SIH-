# backend/ml_engine.py
import joblib
import os
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load models safely
def load_model(path):
    try:
        return joblib.load(path)
    except:
        return None

INTENT_MODEL = load_model(os.path.join(BASE_DIR, "ml_models", "intent_model.pkl"))
AB_MODEL = load_model(os.path.join(BASE_DIR, "ml_models", "antibiotic_model.pkl"))
MDR_MODEL = load_model(os.path.join(BASE_DIR, "ml_models", "mdr_model.pkl"))

# -----------------------------
# ML Antibiotic Effectiveness
# -----------------------------
def ml_predict_antibiotic(ast_row):
    """
    ast_row = {"antibiotic": "Meropenem", "mic":..., "zone":..., "result":...}
    Returns: "S", "I", "R" or effectiveness score
    """
    if not AB_MODEL:
        return None  # use rule-based if ML missing

    features = [
        float(ast_row.get("mic") or 0),
        float(ast_row.get("zone") or 0)
    ]
    features = np.array(features).reshape(1, -1)
    pred = AB_MODEL.predict(features)[0]
    return pred

# -----------------------------
# ML Intent classification
# -----------------------------
def ml_intent(text: str):
    if not INTENT_MODEL:
        return None
    return INTENT_MODEL.predict([text])[0]

# ------------------------------
# ML MDR probability prediction
# ------------------------------
def ml_mdr_probability(features: dict):
    if not MDR_MODEL:
        return None
    X = np.array(list(features.values())).reshape(1, -1)
    return MDR_MODEL.predict_proba(X)[0][1] * 100

def ml_predict_spread(features: dict) -> float | None:
    """
    Predict ward spread risk using ML model (if available).
    Returns a score 0–10.
    """
    try:
        model = _load_model("spread_model.pkl")
        x = np.array([[
            features.get("r_count", 0),
            features.get("ndm", 0),
            features.get("oxa", 0),
            features.get("kpc", 0),
            features.get("esbl", 0),
        ]])
        pred = model.predict(x)[0]
        # Keep it in 0–10 scale
        return float(max(0, min(10, pred)))
    except Exception as e:
        print("Spread ML failed:", e)
        return None
