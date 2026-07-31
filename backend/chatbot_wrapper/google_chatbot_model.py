from google import genai
from chatbot_wrapper.chatbot_helper import get_system_prompt

from dotenv import load_dotenv
import os

load_dotenv()


def create_bot():
    bot = genai.Client(
        api_key=os.getenv("GOOGLE_KEY"),
    )

    return bot


def message_bot(question: str, state: list, model: str) -> str | None:
    bot = create_bot()

    try:
        msg = bot.interactions.create(
            model=model,
            system_instruction=get_system_prompt(),
            input=f"question: {question}, state: {state}",
        )
    except Exception:
        return f"error at {model}"

    return msg.output_text


def google_wrap_response(q: str, s: list, model: str) -> str | None:
    return message_bot(q, s, model)
