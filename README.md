# Serenify

MVP de monitoramento de bem-estar e nível de estresse de estudantes universitários.
Front-end estático em HTML/CSS/JS + backend Python (Flask) integrado a um modelo de
classificação treinado no dataset público **Student Stress Factors** (Kaggle).

Projeto da disciplina de Machine Learning — UNINASSAU Aracaju, 2026.1.
Alinhado ao **ODS 3 — Saúde e Bem-Estar**.

**Equipe:** Moisés Vieira Freire, Juan Pablo Dantas Oliveira, Geovana Cristina Souza
Moreira, Leonardo Silva Carvalho dos Santos.

## Stack

- Front: HTML, CSS, JavaScript (sem framework)
- Backend: Python 3.11 + Flask + Gunicorn
- ML: scikit-learn (Logistic Regression como modelo final, KNN e LinearSVC comparados)
- Dataset: [Student Stress Factors — Kaggle](https://www.kaggle.com/datasets/rxnach/student-stress-factors-a-comprehensive-analysis) (1100 amostras, 20 features, target multiclasse 0/1/2)

## Estrutura

```
serenify/
├── app.py               # Flask: serve o front e expoe /predict
├── train_model.py       # Treina os 3 modelos e salva artifacts/
├── requirements.txt
├── Procfile
├── render.yaml          # Configuracao do Render (deploy automatico)
├── data/
│   └── StressLevelDataset.csv
├── artifacts/           # Gerado pelo train_model.py (model.pkl, scaler.pkl, medians.json)
├── eda_serenify.ipynb   # EDA + treinamento documentado
├── index.html
├── css/, js/, assets/, pages/
```

## Rodando localmente

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python train_model.py        # gera artifacts/
python app.py                # http://localhost:5000
```

## Deploy no Render

1. **Suba o repositorio para o GitHub** (o Render le direto do GitHub).
2. Acesse [render.com](https://render.com) e clique em **New + → Blueprint**.
3. Conecte seu GitHub e selecione o repo `serenify`.
4. O Render vai detectar o `render.yaml` e propor o servico **serenify** no plano free.
5. Clique em **Apply** — o build vai rodar `pip install -r requirements.txt && python train_model.py`
   e o start vai subir `gunicorn app:app`.
6. Em ~3 minutos a app estara em `https://serenify.onrender.com` (o nome final depende
   do que o Render reservar).

> **Observacao:** o plano free do Render dorme apos 15 minutos sem trafego e leva
> ~30s para acordar na primeira requisicao. Para a apresentacao, abra o link uma vez
> antes de comecar a demo.

## Como o front se conecta ao modelo

1. Cada uma das 6 telas salva as respostas em `localStorage` sob a chave
   `serenify_form` (secoes: `perfil`, `rotina`, `contexto`, `emocional`, `apoio`, `avaliacao`).
2. Em `pages/painel.html`, o `js/painel.js` faz `POST /predict` enviando o objeto
   completo.
3. O backend (`app.py`, funcao `map_form_to_features`) converte os campos do
   formulario nas 20 features do dataset:
   - 13 features sao derivadas das respostas do usuario (com escalonamento adequado).
   - 7 features sem correspondente direto no front sao preenchidas com a **mediana**
     do dataset (registrada em `artifacts/medians.json`).
4. O modelo retorna a classe (0/1/2) e um score 0–100 baseado em
   `predict_proba`, exibidos nos gauges do painel.

## Endpoints

| Metodo | Rota             | Descricao |
|--------|------------------|-----------|
| GET    | `/`              | index.html |
| GET    | `/pages/<file>`  | telas do fluxo |
| GET    | `/css/...`, `/js/...`, `/assets/...` | estaticos |
| POST   | `/predict`       | recebe JSON do formulario, retorna `{stress_level, label, score, probabilities}` |
| GET    | `/health`        | healthcheck |

## Metricas dos modelos

Resultados em `artifacts/training_report.json` (split estratificado 80/20, `random_state=42`):

| Algoritmo            | Accuracy | F1-macro |
|----------------------|----------|----------|
| Logistic Regression  | 0.882    | 0.882    |
| KNN                  | 0.850    | 0.850    |
| LinearSVC            | 0.886    | 0.886    |

**Modelo escolhido:** Logistic Regression — F1 praticamente empatado com LinearSVC e
fornece probabilidades calibradas via `predict_proba`, usadas no score 0–100 do painel.


