from flask import Request, jsonify, Response

from chatbot_wrapper.chatbot_helper import get_full_model_name, get_models, change_model, change_bot_name, get_bot_name
from chatbot_wrapper.google_chatbot_model import google_wrap_response
from chatbot_wrapper.openai_chatbot_model import openai_wrap_response


def origin_api(request: Request, allowed_origins: list) -> tuple[Response, int] | None:
    origin = request.headers.get("Origin")

    if origin is not None and origin not in allowed_origins:
        return jsonify({
            "error": "Requests from this origin are not allowed."
        }), 403

    return None


def chat_api(request: Request) -> tuple[Response, int] | Response:
    if request.method == "GET":
        return jsonify({
            "response": "Not implemented."
        }), 501

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


def save_chat_api(request: Request) -> tuple[Response, int] | Response:
    return jsonify({
        "response": "Not implemented."
    }), 501


def model_api(request: Request) -> tuple[Response, int] | Response:
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


def botname_api(request: Request) -> tuple[Response, int] | Response:
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
