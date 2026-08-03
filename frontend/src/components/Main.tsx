import type { RefObject } from 'react';
import type { ChatMessage } from '../apihandler/StartChat.ts';

interface MainProps {
    messages: ChatMessage[];
    isChatLoading: boolean;
    error: string | null;
    chatEndRef: RefObject<HTMLDivElement | null>;
}

function Main({ messages, isChatLoading, error, chatEndRef }: MainProps) {
    return (
        <main className="chat" id="chat_div" aria-live="polite">
            {messages.map((message, index) => (
                <div className="message-pair" key={index}>
                    <div className="user-message">
                        <span className="response-model">You</span>
                        <p className="user-input">{message.user}</p>
                    </div>

                    {message.agent ? (
                        <div className="assistant-message">
                            {message.model && (
                                <span className="response-model">
                                    {message.is_web_search ? message.model + " | Web Search" : message.model}
                                </span>
                            )}
                            <p className="agent-response">
                                {message.agent}
                            </p>
                        </div>
                    ) : (
                        isChatLoading &&
                        index === messages.length - 1 && (
                            <div className="assistant-message">
                                <p className="agent-response waiting">
                                    <img
                                        src="/loading.gif"
                                        alt="Waiting for response"
                                    />
                                </p>
                            </div>
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
    );
}

export default Main;
