from flask import Flask, request, jsonify, Blueprint
from chatbot_wrapper.chatbot_model import wrap_response
from api_helper import get_chat_by_id

app = Flask(__name__)

api = Blueprint(
    "api",
    __name__,
    url_prefix="/api/chatbot/v1"
)


@api.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}

    question = data.get("question", "")
    state = data.get("state", [])

    response = wrap_response(question, state)

    return jsonify({
        "response": response
    })


@api.route("/save", methods=["POST"])
def save():
    data = request.get_json(silent=True) or {}

    # todo

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


app.register_blueprint(api)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)