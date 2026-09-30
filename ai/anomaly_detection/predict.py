from pathlib import Path
import joblib
import pandas as pd
from flask import Flask, request, jsonify

ROOT = Path(__file__).resolve().parent
MODEL = ROOT / "model.pkl"
app = Flask(__name__)

def load_model():
  if not MODEL.exists():
    raise RuntimeError("Train the model first with python train.py")
  return joblib.load(MODEL)

@app.post("/predict")
def predict():
  payload = request.get_json(force=True)
  frame = pd.DataFrame([{
    "amount": float(payload.get("amount", 0)),
    "category_code": int(payload.get("category_code", 8)),
    "vendor_history_days": int(payload.get("vendor_history_days", 0)),
    "is_approved": int(payload.get("is_approved", 0))
  }])
  score = load_model().decision_function(frame)[0]
  flagged = bool(load_model().predict(frame)[0] == -1)
  return jsonify({"flagged": flagged, "riskScore": round((1 - score) * 50, 2)})

if __name__ == "__main__":
  app.run(port=7000, debug=True)
