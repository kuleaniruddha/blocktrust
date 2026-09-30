import joblib
import pandas as pd
from pathlib import Path
from sklearn.ensemble import IsolationForest

ROOT = Path(__file__).resolve().parent
data = pd.read_csv(ROOT / "dataset.csv")
features = data[["amount", "category_code", "vendor_history_days", "is_approved"]]
model = IsolationForest(contamination=0.2, random_state=42)
model.fit(features)
joblib.dump(model, ROOT / "model.pkl")
print("Saved anomaly model to", ROOT / "model.pkl")
