import { useEffect, useRef, useState } from 'react';
import getModel from './GetModel';
import {
    type ChatMessage,
    type ToolName,
    makeChat,
} from './StartChat';

const CHAT_STATE_KEY = 'ai_state';

function getStoredMessages(): ChatMessage[] {
    const storedState = sessionStorage.getItem(CHAT_STATE_KEY);

    if (!storedState) {
        return [];
    }

    try {
        const parsedState: unknown = JSON.parse(storedState);

        if (!Array.isArray(parsedState)) {
            return [];
        }

        return parsedState.filter(
            (message): message is ChatMessage =>
                typeof message === 'object' &&
                message !== null &&
                typeof message.user === 'string' &&
                typeof message.agent === 'string',
        );
    } catch {
        return [];
    }
}

function MainPage() {
    const [messages, setMessages] = useState<ChatMessage[]>(getStoredMessages);
    const [userInput, setUserInput] = useState('');
    const [tool, setTool] = useState<ToolName>('');
    const [model, setModel] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [isModelLoading, setIsModelLoading] = useState(true);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let isMounted = true;

        const loadModel = async () => {
            try {
                const modelName = await getModel();

                if (isMounted) {
                    setModel(modelName);
                }
            } catch (caughtError) {
                if (isMounted) {
                    setError(
                        caughtError instanceof Error
                            ? caughtError.message
                            : 'Ismeretlen hiba történt.',
                    );
                }
            } finally {
                if (isMounted) {
                    setIsModelLoading(false);
                }
            }
        };

        void loadModel();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        sessionStorage.setItem(CHAT_STATE_KEY, JSON.stringify(messages));
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!isChatLoading) {
            document.title = 'gpt-wrapper';
            return;
        }

        let seconds = 0;
        document.title = 'Waiting for response...';

        const intervalId = window.setInterval(() => {
            seconds += 1;
            document.title = `Waiting for response ${seconds}s.`;
        }, 1_000);

        return () => {
            window.clearInterval(intervalId);
            document.title = 'gpt-wrapper';
        };
    }, [isChatLoading]);

    const sendMessage = async () => {
        const question = userInput.trim();

        if (!question || isChatLoading) {
            return;
        }

        const previousMessages = messages;

        setError(null);
        setIsChatLoading(true);
        setUserInput('');
        setMessages((currentMessages) => [
            ...currentMessages,
            { user: question, agent: '' },
        ]);

        try {
            const response = await makeChat(question, previousMessages, tool);

            setMessages((currentMessages) => {
                const updatedMessages = [...currentMessages];
                const pendingMessage = updatedMessages.at(-1);

                if (pendingMessage) {
                    updatedMessages[updatedMessages.length - 1] = {
                        ...pendingMessage,
                        agent: response.reply,
                    };
                }

                return updatedMessages;
            });
        } catch (caughtError) {
            setMessages((currentMessages) =>
                currentMessages.filter(
                    (message, index) =>
                        index !== currentMessages.length - 1 ||
                        message.user !== question ||
                        message.agent !== '',
                ),
            );
            setError(
                caughtError instanceof Error
                    ? caughtError.message
                    : 'Ismeretlen hiba történt.',
            );
        } finally {
            setIsChatLoading(false);
        }
    };

    const startNewChat = () => {
        sessionStorage.removeItem(CHAT_STATE_KEY);
        sessionStorage.removeItem('html_state');
        sessionStorage.removeItem('cont_url');
        setMessages([]);
        setUserInput('');
        setTool('');
        setError(null);
    };

    return (
        <div className="app">
            <nav className="chat-actions">
                <span className="model-name">
                    {isModelLoading
                        ? 'Model betöltése...'
                        : model
                          ? `Model: ${model}`
                          : 'Model nem érhető el'}
                </span>

                <button type="button" id="new_chat" onClick={startNewChat}>
                    <img
                        id="new_chat_img"
                        width="24"
                        height="24"
                        src="https://img.icons8.com/material-outlined/24/plus-2-math--v1.png"
                        alt=""
                    />
                    New chat
                </button>
            </nav>

            <main className="chat" id="chat_div" aria-live="polite">
                {messages.map((message, index) => (
                    <div className="message-pair" key={index}>
                        <p className="user-input">{message.user}</p>

                        {message.agent ? (
                            <p className="agent-response">{message.agent}</p>
                        ) : (
                            isChatLoading &&
                            index === messages.length - 1 && (
                                <p className="agent-response waiting">
                                    Waiting...
                                </p>
                            )
                        )}
                    </div>
                ))}

                {error && (
                    <p className="error-message" role="alert">
                        {error}
                    </p>
                )}

                <div ref={chatEndRef} />
            </main>

            <footer className="input" id="input_div">
                <label className="visually-hidden" htmlFor="input_text">
                    Message the model
                </label>
                <input
                    id="input_text"
                    type="text"
                    autoFocus
                    placeholder="Message the model"
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    value={userInput}
                    disabled={isChatLoading}
                    onChange={(event) => {
                        setUserInput(event.target.value);
                    }}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            void sendMessage();
                        }
                    }}
                />
                <div className="tool-select-wrapper">
                    <label className="visually-hidden" htmlFor="tools">
                        Tool kiválasztása
                    </label>
                    <select
                        id="tools"
                        value={tool}
                        disabled={isChatLoading}
                        onChange={(event) => {
                            setTool(event.target.value as ToolName);
                        }}
                    >
                        <option value="">Add tool</option>
                        <option value="web_search">Web search</option>
                    </select>
                </div>

            </footer>
        </div>
    );
}

export default MainPage;
