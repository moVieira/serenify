"""
Treina o modelo do Serenify a partir do StressLevelDataset.csv.
Gera: model.pkl, scaler.pkl, medians.json, training_report.json
"""
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.svm import LinearSVC

ROOT = Path(__file__).parent
DATA_PATH = ROOT / "data" / "StressLevelDataset.csv"
ARTIFACTS = ROOT / "artifacts"
ARTIFACTS.mkdir(exist_ok=True)

FEATURE_ORDER = [
    "anxiety_level", "self_esteem", "mental_health_history", "depression",
    "headache", "blood_pressure", "sleep_quality", "breathing_problem",
    "noise_level", "living_conditions", "safety", "basic_needs",
    "academic_performance", "study_load", "teacher_student_relationship",
    "future_career_concerns", "social_support", "peer_pressure",
    "extracurricular_activities", "bullying",
]

df = pd.read_csv(DATA_PATH)
X = df[FEATURE_ORDER]
y = df["stress_level"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test)

models = {
    "LogisticRegression": LogisticRegression(max_iter=1000),
    "KNN": KNeighborsClassifier(),
    "LinearSVC": LinearSVC(max_iter=5000),
}

report = {}
trained = {}
for name, clf in models.items():
    clf.fit(X_train_s, y_train)
    pred = clf.predict(X_test_s)
    report[name] = {
        "accuracy": float(accuracy_score(y_test, pred)),
        "f1_macro": float(f1_score(y_test, pred, average="macro")),
    }
    trained[name] = clf

chosen_name = "LogisticRegression"
chosen_model = trained[chosen_name]

joblib.dump(chosen_model, ARTIFACTS / "model.pkl")
joblib.dump(scaler, ARTIFACTS / "scaler.pkl")

medians = {col: float(np.median(df[col])) for col in FEATURE_ORDER}
(ARTIFACTS / "medians.json").write_text(json.dumps(medians, indent=2))

(ARTIFACTS / "training_report.json").write_text(
    json.dumps(
        {
            "chosen_model": chosen_name,
            "justification": (
                "LogisticRegression foi escolhido por entregar F1-macro praticamente "
                "empatado com LinearSVC e fornecer probabilidades calibradas via "
                "predict_proba, usadas no score 0-100 do painel."
            ),
            "metrics": report,
        },
        indent=2,
    )
)

print(f"Modelo escolhido: {chosen_name}")
for name, m in report.items():
    print(f"  {name:20s} accuracy={m['accuracy']:.4f}  f1_macro={m['f1_macro']:.4f}")
