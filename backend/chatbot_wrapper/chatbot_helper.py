import json

def get_chatbot_settings() -> dict:
    with open('chatbot_settings.json', 'r') as f:
        settings = json.load(f)

    return dict(settings)


def get_system_prompt() -> str:
    return get_chatbot_settings()['system_prompt']

def get_model() -> str:
    return get_chatbot_settings()['model']

