import type { RefObject } from 'react';
import type { ToolName } from '../apihandler/StartChat.ts';

interface FooterProps {
    composerRef: RefObject<HTMLElement | null>;
    inputRef: RefObject<HTMLTextAreaElement | null>;
    userInput: string;
    tool: ToolName;
    model: string;
    isChatLoading: boolean;
    isModelChanging: boolean;
    onUserInputChange: (value: string) => void;
    onToolChange: (tool: ToolName) => void;
    onSend: () => Promise<void>;
}

function Footer({
    composerRef,
    inputRef,
    userInput,
    tool,
    model,
    isChatLoading,
    isModelChanging,
    onUserInputChange,
    onToolChange,
    onSend,
}: FooterProps) {
    return (
        <footer className="footer" ref={composerRef}>
            <div className="input" id="input_div">
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
                        onUserInputChange(event.target.value);
                    }}
                    onKeyDown={(event) => {
                        if (event.key === 'Tab') {
                            event.preventDefault();

                            const input = event.currentTarget;
                            const selectionStart = input.selectionStart;
                            const selectionEnd = input.selectionEnd;
                            const cursorPosition = selectionStart + 1;

                            onUserInputChange(
                                `${userInput.slice(0, selectionStart)}\t${userInput.slice(selectionEnd)}`,
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
                            void onSend();
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
                            onToolChange(event.target.value as ToolName);
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
                        void onSend();
                    }}
                >
                    <img
                        width="24"
                        height="24"
                        src="https://img.icons8.com/forma-thin-filled/24/FFFFFF/sent.png"
                        alt="Send message"
                    />
                </button>
            </div>

            <p id="dev_text">
                Developed with ❤️ by{' '}
                <a
                    href="https://github.com/Sciencewolf"
                    id="dev_link"
                    target="_blank"
                    rel="noreferrer"
                >
                    {'<Márton Áron>'}
                </a>
            </p>
        </footer>
    );
}

export default Footer;
