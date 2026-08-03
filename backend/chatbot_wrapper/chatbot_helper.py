from typing import Any

from dotenv import load_dotenv
import os

from postgrest import APIResponse
from supabase import Client, create_client

load_dotenv()

db: Client = create_client(
    supabase_url=os.getenv("SUPABASE_URL") or '',
    supabase_key=os.getenv("SUPABASE_KEY") or '',
)


def get_chatbot_settings() -> list[Any]:
    settings: APIResponse = db.table('chatbot').select("*").eq("id", 1).execute()

    return settings.data[0]


def save_chatbot_settings(settings: dict) -> None:
    db.table('chatbot').update({
        "system_prompt": settings["system_prompt"],
        "name": settings["name"],
        "full_model_name": settings["full_model_name"],
        "model": settings["model"],
        "models": settings["models"],
        "version": int(settings["version"]),
    }).eq("id", 1).execute()


def get_system_prompt() -> Any | None:
    return get_chatbot_settings()["system_prompt"]


def get_model() -> str:
    return get_chatbot_settings()["model"]


def get_models() -> list:
    return get_chatbot_settings()["models"]


def get_full_model_name() -> str:
    return get_chatbot_settings()["full_model_name"]


def get_bot_name() -> str:
    return get_chatbot_settings()["name"]


def get_version() -> str:
    return get_chatbot_settings()["version"]


def change_version(version: int) -> None:
    chatbot_settings = get_chatbot_settings()
    chatbot_settings["version"] = version

    save_chatbot_settings(chatbot_settings)


def change_bot_name(name: str) -> None:
    settings = get_chatbot_settings()
    settings["name"] = name

    save_chatbot_settings(settings)


def change_model(model: str) -> None:
    provider, model_name = model.split('/', 1)
    settings = get_chatbot_settings()
    settings["model"] = model_name
    settings["full_model_name"] = f"{provider}/{model_name}"

    save_chatbot_settings(settings)
