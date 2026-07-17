"""
ai_engine_mock.py

ARCHITECTURAL BRIDGE — placeholder for the "AI Detection & Behavioral
Analysis Layer" from the IDPS blueprint (Random Forest / Isolation Forest /
Deep Neural Network / LSTM models trained on packet rate, connection
duration, protocol type, and failed-login features).

This module exists so main.py can call a STABLE function signature today,
before the real trained model exists. The contract is:

    predict_attack(packet_data: dict) -> bool

PLUG-AND-PLAY SWAP INSTRUCTIONS:
  1. Build your real model module (e.g. ai_engine.py) exposing a function
     with this exact same name and signature.
  2. In main.py, change:
         from ai_engine_mock import predict_attack
     to:
         from ai_engine import predict_attack
  3. Nothing else in main.py needs to change — the calling code only ever
     depends on the function name and its bool return value.
"""


def predict_attack(packet_data: dict) -> bool:
    """
    PLACEHOLDER for a trained Random Forest / Deep Neural Network classifier.

    Real implementation will:
      - Accept extracted traffic features in `packet_data` (e.g. packet
        rate, connection count, protocol distribution, entropy).
      - Run inference through a trained sklearn / TensorFlow / PyTorch
        model loaded at startup.
      - Return True if the model classifies current traffic as an attack,
        False otherwise.

    Mock behavior: always returns True. This lets the alerting → blocking
    → blockchain-logging pipeline downstream be exercised end-to-end right
    now, without waiting on the real model.
    """
    # TODO: replace with real model inference once trained model is ready
    return True
