from functools import lru_cache
from typing import Any

from dotenv import load_dotenv
import os

from postgrest import APIResponse
from supabase import Client, create_client

load_dotenv()


class BackendConfigurationError(RuntimeError):
    """Raised when a required backend environment variable is missing."""


@lru_cache(maxsize=1)
def get_db() -> Client:
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")

    if not supabase_url or not supabase_key:
        raise BackendConfigurationError(
            "SUPABASE_URL and SUPABASE_KEY must be configured."
        )

    return create_client(
        supabase_url=supabase_url,
        supabase_key=supabase_key,
    )


def get_chatbot_settings() -> dict[str, Any]:
    settings: APIResponse = (
        get_db().table('chatbot').select("*").eq("id", 1).execute()
    )

    if not settings.data:
        raise BackendConfigurationError(
            "The chatbot settings row with id 1 does not exist."
        )

    return settings.data[0]


def save_chatbot_settings(settings: dict[str, Any]) -> None:
    get_db().table('chatbot').update({
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
