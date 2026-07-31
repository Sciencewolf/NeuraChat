from openai import OpenAI
from dotenv import load_dotenv
import os
from chatbot_wrapper.chatbot_helper import get_system_prompt

load_dotenv()

api_key = os.getenv("OPENAI_KEY")


def create_chatbot():
    return OpenAI(api_key=api_key)


def message_bot(
    question: str,
    state: list,
    model: str,
    web_search: bool = False
) -> str:
    bot = create_chatbot()

    content_to_ai = f"question: {question}\nstate: {state}"

    tools = []
    if web_search:
        tools.append({"type": "web_search_preview"})

    response = bot.responses.create(
        model=model,
        input=[
            {"role": "system", "content": str(get_system_prompt())},
            {"role": "user", "content": content_to_ai},
        ],
        tools=tools,
    )

    return response.output_text or ""


def openai_wrap_response(
    question: str,
    state: list,
    model: str,
    web_search: bool = False
) -> str:
    return message_bot(question, state, model, web_search)
