interface NavProps {
    model: string;
    models: string[];
    isChatLoading: boolean;
    isModelLoading: boolean;
    isModelChanging: boolean;
    onModelChange: (model: string) => Promise<void>;
    onNewChat: () => void;
}

function Nav({
    model,
    models,
    isChatLoading,
    isModelLoading,
    isModelChanging,
    onModelChange,
    onNewChat,
}: NavProps) {
    return (
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
                    {isModelChanging ? 'Saving...' : ''}
                </label>
                <select
                    id="model_select"
                    value={model}
                    disabled={
                        isModelLoading || isModelChanging || isChatLoading
                    }
                    onChange={(event) => {
                        void onModelChange(event.target.value);
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
                            {modelName.replace('/', ' / ')}
                        </option>
                    ))}
                </select>
            </div>

            <button type="button" id="new_chat" onClick={onNewChat}>
                <span className="new-chat-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                </span>
                <span>New chat</span>
            </button>
        </nav>
    );
}

export default Nav;
