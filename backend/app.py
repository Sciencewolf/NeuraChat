from flask import Flask, request, Blueprint
from flask_cors import CORS

from api_helper import chat_api, save_chat_api, model_api, botname_api, origin_api


app = Flask(__name__)

ALLOWED_ORIGINS = ["https://neurachatui.vercel.app", "http://localhost:5173"]

CORS(app)


api = Blueprint(
    "api",
    __name__,
    url_prefix="/api/v1",
)

CORS(
    api,
    origins=ALLOWED_ORIGINS,
    methods=["GET", "POST", "OPTIONS", "HEAD"],
    allow_headers=["Content-Type"],
)


@api.before_request
def restrict_origin():
    return origin_api(request, ALLOWED_ORIGINS)


@api.route("/chat", methods=["GET", "POST"])
def start_chat():
    return chat_api(request)


@api.route("/save", methods=["POST"])
def save_chat():
    return save_chat_api(request)


@api.route("/model", methods=["GET", "POST"])
def api_model():
    return model_api(request)


@api.route("/botname", methods=["GET", "POST"])
def api_bot_name():
    return botname_api(request)


app.register_blueprint(api)


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000
    )
