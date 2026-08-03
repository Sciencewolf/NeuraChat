from flask import Flask, request, jsonify, Blueprint
from flask_cors import CORS

from chatbot_wrapper.openai_chatbot_model import openai_wrap_response
from chatbot_wrapper.google_chatbot_model import google_wrap_response

from chatbot_wrapper.chatbot_helper import (
    get_full_model_name,
    get_models,
    change_model,
    get_bot_name,
    change_bot_name,
)

from api_helper import get_chat_by_id


app = Flask(__name__)

ALLOWED_ORIGIN = ["https://neurachatui.vercel.app", "http://localhost:5173"]
CORS(
    app,
)


api = Blueprint(
    "api",
    __name__,
    url_prefix="/api/v1",
)


# Only this origin is allowed to access the API.
CORS(
    api,
    origins=ALLOWED_ORIGIN,
    methods=["GET", "POST", "OPTIONS", "HEAD"],
    allow_headers=["Content-Type"],
)


# The backend also rejects requests sent from any other origin.
@api.before_request
def restrict_origin():
    origin = request.headers.get("Origin")

    if origin not in ALLOWED_ORIGIN:
        return jsonify({
            "error": "Requests from this origin are not allowed."
        }), 403

    return None


@api.route("/chat", methods=["GET", "POST"])
def start_chat():
    if request.method == "GET":
        chat_id = request.args.get("id", "")
        chat_content = get_chat_by_id(chat_id)

        return jsonify({
            "response": chat_content
        })


    data = request.get_json(silent=True) or {}

    model = data.get("model", get_full_model_name())
    question = data.get("question", "")
    state = data.get("state", [])
    web_search = data.get("tool") == "web_search"

    if model not in get_models():
        return jsonify({
            "error": "Unsupported model."
        }), 400

    provider, model_name = model.split("/", 1)
    response: str | None

    match provider:
        case "openai":
            response = openai_wrap_response(
                question,
                state,
                model_name,
                web_search=web_search,
            )

        case "google":
            response = google_wrap_response(
                question,
                state,
                model_name,
            )

        case _:
            return jsonify({
                "error": "Unsupported model provider."
            }), 400

    return jsonify({
        "response": response,
        "model": model_name,
        "is_web_search": web_search
    })


@api.route("/save", methods=["POST"])
def save_chat():
    data = request.get_json(silent=True) or {}

    return jsonify({
        "success": True
    })


@api.route("/model", methods=["GET", "POST"])
def api_model():
    if request.method == 'GET':
        return jsonify({
            "model": get_full_model_name(),
            "models": get_models(),
        })

    data = request.get_json(silent=True) or {}
    model = data.get("model", "")

    if model not in get_models():
        return jsonify({
            "error": "Unsupported model."
        }), 400

    change_model(model)

    return jsonify({
        "model": model
    })


@api.route("/botname", methods=["GET", "POST"])
def api_bot_name():
    if request.method == 'GET':
        return jsonify({
            "bot_name": get_bot_name()
        })

    data = request.get_json(silent=True) or {}
    bot_name = data.get("bot_name", "")

    if not bot_name:
        return jsonify({
            "error": "The bot_name field is required."
        }), 400

    change_bot_name(bot_name)

    return jsonify({
        "bot_name": bot_name
    })


app.register_blueprint(api)


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000
    )
