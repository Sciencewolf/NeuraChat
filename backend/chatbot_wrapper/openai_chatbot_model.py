from openai import OpenAI
from dotenv import load_dotenv
import os
from chatbot_wrapper.chatbot_helper import get_model, get_system_prompt

load_dotenv()

api_key = os.getenv("OPENAI_KEY")


def create_chatbot():
    return OpenAI(api_key=api_key)


def make_api_call(question: str, state: list, web_search: bool = False) -> str:
    bot = create_chatbot()

    content_to_ai = f"question: {question}\nstate: {state}"

    tools = []
    if web_search:
        tools.append({"type": "web_search_preview"})

    response = bot.responses.create(
        model=get_model(),
        input=[
            {"role": "system", "content": str(get_system_prompt())},
            {"role": "user", "content": content_to_ai},
        ],
        tools=tools,
    )

    return response.output_text or ""


def wrap_response(question: str, state: list, web_search: bool = False) -> str:
    return make_api_call(question, state, web_search)