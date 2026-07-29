import json
import uuid


def save_chat(content: str) -> None:
    chat_content = {'chat_id': str(uuid.uuid7()), 'content': content}


    with open('chat_history/chats.json', 'a+') as f:
        json.dump(chat_content, f)


def get_chat_by_id(chat_id: str) -> str:
    if chat_id == "":
        return "No such data"

    with open('chat_history/chats.json', 'r+') as f:
        chat_history = json.load(f)

        try: return chat_history[chat_id]
        except: return "No such data"

def get_chat_history() -> dict:
    with open('chat_history/chats.json', 'r+') as f:
        chat_history = json.load(f)

        return chat_history


def update_chat(chat_id: str, content: str) -> None:
    with open('chat_history/chats.json', 'r+') as f:
        chat_history = json.load(f)

        chat_history[chat_id] = content

        with open('chat_history/chats.json', 'w+') as file:
            json.dump(chat_history, file)


def delete_chat(chat_id: str) -> None:
    if chat_id == "":
        return

    with open('chat_history/chats.json', 'r+') as f:
        chat_history = json.load(f)

        for chat in chat_history:
            if chat['chat_id'] == chat_id:
                del chat_history[chat_id]

        with open('chat_history/chats.json', 'w+') as file:
            json.dump(chat_history, file)
