from flask import Flask, request, jsonify, Blueprint
from chatbot_wrapper.openai_chatbot_model import openai_wrap_response

from chatbot_wrapper.chatbot_helper import (
    get_full_model_name,
    get_models,
    change_model,
    get_bot_name,
    change_bot_name
)

from chatbot_wrapper.google_chatbot_model import google_wrap_response

from api_helper import get_chat_by_id

from flask_cors import CORS


app = Flask(__name__)

CORS(app)

api = Blueprint(
    "api",
    __name__,
    url_prefix="/api/v1/"
)

CORS(api)


@api.route("/chat", methods=["POST"])
def start_chat():
    data = request.get_json(silent=True) or {}

    model = data.get("model", get_full_model_name())
    question = data.get("question", "")
    state = data.get("state", [])
    web_search = data.get("tool") == 'web_search'

    if model not in get_models():
        return jsonify({
            "error": "Nem támogatott modell."
        }), 400

    provider, model_name = model.split('/', 1)
    response: str | None

    match provider:
        case "openai":
            response = openai_wrap_response(
                question,
                state,
                model_name,
                web_search=web_search
            )
        case "google":
            response = google_wrap_response(question, state, model_name)
        case _:
            return jsonify({
                "error": "Nem támogatott modellszolgáltató."
            }), 400

    return jsonify({
        "response": response
    })


@api.route("/save", methods=["POST"])
def save_chat():
    data = request.get_json(silent=True) or {}

    return jsonify({
        "success": True
    })


@api.route("/get-chat", methods=["GET"])
def get_chat():
    chat_id = request.args.get("id", "")
    chat_content = get_chat_by_id(chat_id)

    return jsonify({
        "response": chat_content
    })


@api.route("/model", methods=["GET"])
def api_get_model():
    return jsonify({
        "model": get_full_model_name(),
        "models": get_models()
    })


@api.route("/model", methods=["POST"])
def api_change_model():
    data = request.get_json(silent=True) or {}
    model = data.get("model", "")

    if model not in get_models():
        return jsonify({
            "error": "Nem támogatott modell."
        }), 400

    change_model(model)

    return jsonify({
        "model": model
    })


@api.route("/botname", methods=["GET"])
def api_get_bot_name():
    return jsonify({
        "bot_name": get_bot_name()
    })


@api.route("/botname", methods=["POST"])
def api_change_bot_name():
    data = request.get_json(silent=True) or {}
    bot_name = data.get("bot_name", "")

    if not bot_name:
        return jsonify({
            "error": "A bot_name mező megadása kötelező."
        }), 400

    change_bot_name(bot_name)

    return jsonify({
        "bot_name": bot_name
    })


app.register_blueprint(api)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
