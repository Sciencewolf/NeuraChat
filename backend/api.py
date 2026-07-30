from flask import Flask, request, jsonify, Blueprint
from chatbot_wrapper.chatbot_model import wrap_response
from chatbot_wrapper.chatbot_helper import (
    get_model,
    change_model,
    get_bot_name,
    change_bot_name
)
from api_helper import get_chat_by_id

from flask_cors import CORS


app = Flask(__name__)
app.config["IS_DEBUG"] = True

CORS(app)

api = Blueprint(
    "api",
    __name__,
    url_prefix="/t" if app.config["IS_DEBUG"] else "/api/chatbot/v1"
)

CORS(api)


@api.route("/chat", methods=["POST"])
def start_chat():
    data = request.get_json(silent=True) or {}

    question = data.get("question", "")
    state = data.get("state", [])

    response = wrap_response(question, state)

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
        "model": get_model()
    })


@api.route("/model", methods=["POST"])
def api_change_model():
    data = request.get_json(silent=True) or {}
    model = data.get("model", "")

    if not model:
        return jsonify({
            "error": "A model mező megadása kötelező."
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