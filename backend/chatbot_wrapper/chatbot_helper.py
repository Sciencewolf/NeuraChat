import json
from pathlib import Path


SETTINGS_FILE = Path(__file__).resolve().parent / "chatbot_settings.json"


def get_chatbot_settings() -> dict:
    with SETTINGS_FILE.open("r", encoding="utf-8") as file:
        settings = json.load(file)

    return settings


def save_chatbot_settings(settings: dict) -> None:
    with SETTINGS_FILE.open("w", encoding="utf-8") as file:
        json.dump(
            settings,
            file,
            ensure_ascii=False,
            indent=2
        )


def get_system_prompt() -> str:
    return get_chatbot_settings()["system_prompt"]


def get_model() -> str:
    return get_chatbot_settings()["model"]


def get_bot_name() -> str:
    return get_chatbot_settings()["name"]


def change_bot_name(name: str) -> None:
    settings = get_chatbot_settings()
    settings["name"] = name
    save_chatbot_settings(settings)


def change_model(model: str) -> None:
    settings = get_chatbot_settings()
    settings["model"] = model
    save_chatbot_settings(settings)