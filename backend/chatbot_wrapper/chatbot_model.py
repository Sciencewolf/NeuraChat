from openai import OpenAI
from dotenv import load_dotenv
import os
from chatbot_wrapper.chatbot_helper import get_model, get_system_prompt

load_dotenv()

api_key = os.getenv("OPENAI_KEY")


def create_chatbot():
    chatbot = OpenAI(api_key=api_key)

    return chatbot


def make_api_call(question: str, state: list) -> str:
    bot = create_chatbot()

    content_to_ai = f"question: {question}\nstate: {state}"

    response = bot.chat.completions.create(
        model=get_model(),
        messages=[
            {"role": "system", "content": str(get_system_prompt())},
            {"role": "user", "content": content_to_ai},
        ]
    )

    return response.output_text


def wrap_response(question: str, state: list) -> str:
    return make_api_call(question, state)