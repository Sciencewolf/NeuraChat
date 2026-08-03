import { useEffect, useRef, useState } from 'react';
import getModel, { changeModel } from './apihandler/Model.ts';
import {
    type ChatMessage,
    type ToolName,
    makeChat,
} from './apihandler/StartChat.ts';

import { Analytics } from '@vercel/analytics/react';
import Footer from './components/Footer.tsx';
import Main from './components/Main.tsx';
import Nav from './components/Nav.tsx';

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
                typeof message.agent === 'string' &&
                (message.model === undefined ||
                    typeof message.model === 'string'),
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
                        model: response.model,
                        is_web_search: response.is_web_search,
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
        setMessages([]);
        setUserInput('');
        setTool('');
        setError(null);
    };

    return (
        <>
            <div className="app">
                <Nav
                    model={model}
                    models={models}
                    isChatLoading={isChatLoading}
                    isModelLoading={isModelLoading}
                    isModelChanging={isModelChanging}
                    onModelChange={selectModel}
                    onNewChat={startNewChat}
                />

                <Main
                    messages={messages}
                    isChatLoading={isChatLoading}
                    error={error}
                    chatEndRef={chatEndRef}
                />

                <Footer
                    composerRef={composerRef}
                    inputRef={inputRef}
                    userInput={userInput}
                    tool={tool}
                    model={model}
                    isChatLoading={isChatLoading}
                    isModelChanging={isModelChanging}
                    onUserInputChange={setUserInput}
                    onToolChange={setTool}
                    onSend={sendMessage}
                />
            </div>

            <Analytics />
        </>
    );
}

export default MainPage;
