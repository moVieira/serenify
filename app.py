"""
Serenify - Flask app
Serve o front estatico e expoe /predict que mapeia as respostas do formulario
para as 20 features do StressLevelDataset e devolve a previsao do modelo.
"""
import json
import subprocess
import sys
from pathlib import Path

import joblib
import pandas as pd
from flask import Flask, jsonify, request, send_from_directory

ROOT = Path(__file__).parent
ARTIFACTS = ROOT / "artifacts"

app = Flask(__name__, static_folder=str(ROOT), static_url_path="")

if not (ARTIFACTS / "model.pkl").exists():
    print("[serenify] artifacts ausentes, executando train_model.py ...", flush=True)
    subprocess.check_call([sys.executable, str(ROOT / "train_model.py")])

model = joblib.load(ARTIFACTS / "model.pkl")
scaler = joblib.load(ARTIFACTS / "scaler.pkl")
medians = json.loads((ARTIFACTS / "medians.json").read_text())

FEATURE_ORDER = [
    "anxiety_level", "self_esteem", "mental_health_history", "depression",
    "headache", "blood_pressure", "sleep_quality", "breathing_problem",
    "noise_level", "living_conditions", "safety", "basic_needs",
    "academic_performance", "study_load", "teacher_student_relationship",
    "future_career_concerns", "social_support", "peer_pressure",
    "extracurricular_activities", "bullying",
]

STUDY_TO_LOAD = {"1-2h": 1, "3-4h": 2, "5-6h": 4, "7h+": 5}
SLEEP_TO_QUALITY = {"<5h": 1, "5-6h": 2, "6-7h": 3, "7-8h": 4, "8h+": 5}
SCREENS_TO_NOISE = {"1-2h": 2, "3-5h": 3, "6-8h": 4, "8h+": 5}
EXERCISE_TO_EXTRA = {"nunca": 5, "1-2x": 3, "3-4x": 1, "5x+": 0}


def _scale(value, src_max, dst_max):
    if value is None:
        return None
    return round(float(value) * dst_max / src_max)


def _invert(value, src_max, dst_max):
    if value is None:
        return None
    return round((src_max - float(value)) * dst_max / src_max)


def map_form_to_features(form: dict) -> dict:
    """Converte os campos coletados pelas 6 telas nas 20 features do dataset.
    Campos sem correspondente direto recebem estimativas dinâmicas baseadas
    nas respostas ou a mediana do dataset como fallback."""
    f = {col: medians[col] for col in FEATURE_ORDER}

    rotina = form.get("rotina", {})
    if rotina.get("study") in STUDY_TO_LOAD:
        f["study_load"] = STUDY_TO_LOAD[rotina["study"]]
    if rotina.get("sleep") in SLEEP_TO_QUALITY:
        f["sleep_quality"] = SLEEP_TO_QUALITY[rotina["sleep"]]
    if rotina.get("screens") in SCREENS_TO_NOISE:
        f["noise_level"] = SCREENS_TO_NOISE[rotina["screens"]]
    if rotina.get("exercise") in EXERCISE_TO_EXTRA:
        f["extracurricular_activities"] = EXERCISE_TO_EXTRA[rotina["exercise"]]

    contexto = form.get("contexto", {})
    p1 = _invert(contexto.get("p1"), 10, 5)
    if p1 is not None:
        f["academic_performance"] = p1
    p2 = _scale(contexto.get("p2"), 10, 5)
    if p2 is not None:
        f["future_career_concerns"] = p2
        f["peer_pressure"] = p2
    p3 = _invert(contexto.get("p3"), 10, 5)
    if p3 is not None:
        f["basic_needs"] = p3
        f["living_conditions"] = p3

    emocional = form.get("emocional", {})
    e2 = _scale(emocional.get("e2"), 10, 21)
    if e2 is not None:
        f["anxiety_level"] = e2
        f["breathing_problem"] = _scale(emocional.get("e2"), 10, 5)
        f["blood_pressure"] = 1 if e2 <= 6 else (3 if e2 >= 15 else 2)
    e3 = _scale(emocional.get("e3"), 10, 5)
    if e3 is not None:
        f["headache"] = e3
    e4 = _scale(emocional.get("e4"), 10, 27)
    if e4 is not None:
        f["depression"] = e4

    if e2 is not None and e4 is not None:
        avg_neg_state = (e2/21.0 + e4/27.0) / 2.0
        f["self_esteem"] = round((1.0 - avg_neg_state) * 30)
        f["mental_health_history"] = 1 if avg_neg_state >= 0.6 else 0

    apoio = form.get("apoio", {})
    a1 = apoio.get("a1")
    a2 = apoio.get("a2")
    a3 = apoio.get("a3")
    a4 = apoio.get("a4")

    if a1 is not None and a3 is not None:
        f["social_support"] = _scale((float(a1) + float(a3)) / 2.0, 10, 3)
    elif a1 is not None:
        f["social_support"] = _scale(float(a1), 10, 3)

    supports = [float(val) for val in [a1, a2, a3] if val is not None]
    if supports:
        f["safety"] = _scale(sum(supports) / len(supports), 10, 5)

    if a4 is not None:
        f["teacher_student_relationship"] = _scale(float(a4), 10, 5)
        f["bullying"] = _invert(float(a4), 10, 5)

    return f


@app.route("/")
def home():
    return send_from_directory(str(ROOT), "index.html")


@app.route("/pages/<path:filename>")
def pages(filename):
    return send_from_directory(str(ROOT / "pages"), filename)


@app.route("/predict", methods=["POST"])
def predict():
    form = request.get_json(silent=True) or {}
    features = map_form_to_features(form)
    row = pd.DataFrame([[features[c] for c in FEATURE_ORDER]], columns=FEATURE_ORDER)
    row_scaled = scaler.transform(row)

    pred_class = int(model.predict(row_scaled)[0])
    proba = model.predict_proba(row_scaled)[0]
    weighted = float(sum(p * i for i, p in enumerate(proba)) / (len(proba) - 1))
    score = round(weighted * 100, 1)

    labels = {0: "Baixo", 1: "Moderado", 2: "Alto"}
    return jsonify(
        {
            "stress_level": pred_class,
            "label": labels[pred_class],
            "score": score,
            "probabilities": {labels[i]: round(float(p), 4) for i, p in enumerate(proba)},
            "features_used": features,
        }
    )


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
