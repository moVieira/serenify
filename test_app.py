"""
Testes unitários para o servidor Flask (app.py) do Serenify.
"""
import json
import unittest
from pathlib import Path
import sys

# Garante que o diretório correto está no path
ROOT = Path(__file__).parent
sys.path.insert(0, str(ROOT))

from app import app, map_form_to_features


class SerenifyTestCase(unittest.TestCase):

    def setUp(self):
        # Configura o cliente de teste do Flask
        self.app = app.test_client()
        self.app.testing = True

    def test_health_endpoint(self):
        """Verifica se o endpoint /health retorna 200 OK e o JSON correto."""
        response = self.app.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data, {"status": "ok"})

    def test_home_endpoint(self):
        """Verifica se o endpoint inicial (/) carrega corretamente."""
        response = self.app.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"html", response.data.lower())

    def test_predict_endpoint_empty_payload(self):
        """Verifica se o /predict funciona mesmo com JSON vazio, usando fallbacks."""
        response = self.app.post(
            "/predict",
            data=json.dumps({}),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        
        self.assertIn("stress_level", data)
        self.assertIn("label", data)
        self.assertIn("score", data)
        self.assertIn("probabilities", data)
        self.assertIn("features_used", data)

    def test_predict_endpoint_with_valid_data(self):
        """Verifica se o /predict calcula corretamente com dados simulados do formulário."""
        mock_form = {
            "rotina": {
                "study": "3-4h",
                "sleep": "7-8h",
                "screens": "3-5h",
                "exercise": "3-4x"
            },
            "contexto": {
                "p1": "8", # acadêmico
                "p2": "4", # carreira/pressão
                "p3": "9"  # necessidades
            },
            "emocional": {
                "e2": "3",  # ansiedade
                "e3": "2",  # dor de cabeça
                "e4": "4"   # depressão
            },
            "apoio": {
                "a1": "9",
                "a2": "8",
                "a3": "9",
                "a4": "9"
            }
        }
        response = self.app.post(
            "/predict",
            data=json.dumps(mock_form),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        
        self.assertIn("stress_level", data)
        self.assertIn("label", data)
        self.assertIn("score", data)
        self.assertIn("probabilities", data)
        self.assertIn("features_used", data)
        
        # O nível de estresse deve ser uma das opções (0, 1, 2)
        self.assertIn(data["stress_level"], [0, 1, 2])
        self.assertIn(data["label"], ["Baixo", "Moderado", "Alto"])


if __name__ == "__main__":
    unittest.main()
