import { useEffect, useRef, useState } from 'react';
import getModel, { changeModel } from './apihandler/GetModel.ts';
import {
    type ChatMessage,
    type ToolName,
    makeChat,
} from './apihandler/StartChat.ts';

import { Analytics } from "@vercel/analytics/react"

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
    const [models, setModels] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [isModelLoading, setIsModelLoading] = useState(true);
    const [isModelChanging, setIsModelChanging] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const composerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        let isMounted = true;

        const loadModel = async () => {
            try {
                const modelCatalog = await getModel();

                if (isMounted) {
                    setModels(modelCatalog.models);
                    setModel(modelCatalog.currentModel);
                }
            } catch (caughtError) {
                if (isMounted) {
                    setError(
                        caughtError instanceof Error
                            ? caughtError.message
                            : 'An unknown error occurred.',
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
        const input = inputRef.current;

        if (!input) {
            return;
        }

        input.style.height = 'auto';
        input.style.height = `${input.scrollHeight}px`;
    }, [userInput]);

    useEffect(() => {
        const composer = composerRef.current;

        if (!composer) {
            return;
        }

        const updateComposerHeight = () => {
            document.documentElement.style.setProperty(
                '--composer-height',
                `${composer.offsetHeight}px`,
            );
        };

        const resizeObserver = new ResizeObserver(updateComposerHeight);

        resizeObserver.observe(composer);
        updateComposerHeight();

        return () => {
            resizeObserver.disconnect();
            document.documentElement.style.removeProperty('--composer-height');
        };
    }, []);

    useEffect(() => {
        if (!isChatLoading) {
            document.title = 'NeuraChat';
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
            document.title = 'NeuraChat';
        };
    }, [isChatLoading]);

    const sendMessage = async () => {
        const question = userInput.trim();

        if (!question || !model || isChatLoading || isModelChanging) {
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
            const response = await makeChat(
                question,
                previousMessages,
                model,
                tool,
            );

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
                    : 'An unknown error occurred.',
            );
        } finally {
            setIsChatLoading(false);
        }
    };

    const selectModel = async (selectedModel: string) => {
        if (
            !selectedModel ||
            selectedModel === model ||
            isModelChanging ||
            isChatLoading
        ) {
            return;
        }

        try {
            setError(null);
            setIsModelChanging(true);

            const savedModel = await changeModel(selectedModel);

            setModel(savedModel);

            if (!savedModel.startsWith('openai/')) {
                setTool('');
            }
        } catch (caughtError) {
            setError(
                caughtError instanceof Error
                    ? caughtError.message
                    : 'Failed to change the model.',
            );
        } finally {
            setIsModelChanging(false);
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
        <>
            <div className="app">
                <nav className="chat-actions">
                    <div className="brand">
                        <img
                            className="brand-logo"
                            src="/neurachat-icon.png"
                            alt="NeuraChat logo"
                        />
                        <span className="brand-name">NeuraChat</span>
                    </div>

                    <div className="model-select-wrapper">
                        <label className="model-label" htmlFor="model_select">
                        {isModelChanging ? 'Saving...' : 'Model'}
                        </label>
                        <select
                            id="model_select"
                            value={model}
                            disabled={
                                isModelLoading || isModelChanging || isChatLoading
                            }
                            onChange={(event) => {
                                void selectModel(event.target.value);
                            }}
                        >
                            {isModelLoading && (
                            <option value="">Loading...</option>
                            )}
                            {!isModelLoading && models.length === 0 && (
                            <option value="">No models available</option>
                            )}
                            {models.map((modelName) => (
                                <option value={modelName} key={modelName}>
                                    {modelName.replace('/', ' - ')}
                                </option>
                            ))}
                        </select>
                    </div>

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

                <footer
                    className="input"
                    id="input_div"
                    ref={composerRef}
                >
                    <label className="visually-hidden" htmlFor="input_text">
                        Message the model
                    </label>
                    <textarea
                        ref={inputRef}
                        id="input_text"
                        rows={1}
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
                            if (event.key === 'Tab') {
                                event.preventDefault();

                                const input = event.currentTarget;
                                const selectionStart = input.selectionStart;
                                const selectionEnd = input.selectionEnd;
                                const cursorPosition = selectionStart + 1;

                                setUserInput((currentValue) =>
                                    `${currentValue.slice(0, selectionStart)}\t${currentValue.slice(selectionEnd)}`,
                                );

                                window.requestAnimationFrame(() => {
                                    inputRef.current?.setSelectionRange(
                                        cursorPosition,
                                        cursorPosition,
                                    );
                                });

                                return;
                            }

                            if (
                                event.key === 'Enter' &&
                                (event.ctrlKey || event.metaKey)
                            ) {
                                event.preventDefault();
                                void sendMessage();
                            }
                        }}
                    />
                    <div className="tool-select-wrapper">
                        <label className="visually-hidden" htmlFor="tools">
                            Select a tool
                        </label>
                        <select
                            id="tools"
                            value={tool}
                            disabled={
                                isChatLoading ||
                                isModelChanging ||
                                !model.startsWith('openai/')
                            }
                            onChange={(event) => {
                                setTool(event.target.value as ToolName);
                            }}
                        >
                            <option value="">
                                {model.startsWith('openai/')
                                    ? 'Add tool'
                                    : 'No tools available'}
                            </option>
                            <option value="web_search">Web search</option>
                        </select>
                    </div>

                    <button
                        type="button"
                        id="btn_send"
                        title="Send message (Ctrl+Enter)"
                        disabled={
                            isChatLoading ||
                            isModelChanging ||
                            !model ||
                            !userInput.trim()
                        }
                        onClick={() => {
                            void sendMessage();
                        }}
                    >
                        {isChatLoading ? 'Sending...' : 'Send'}
                    </button>

                </footer>
            </div>

            <Analytics />
        </>
    );
}

export default MainPage;
