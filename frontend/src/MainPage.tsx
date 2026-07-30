import { useState } from 'react';
import { type ChatResponse, makeChat } from './StartChat';

function MainPage() {
    const [aiResponse, setAiResponse] = useState<ChatResponse | null>(null);
    const [userInput, setUserInput] = useState('');
    const [lastQuestion, setLastQuestion] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const getAiResponse = async () => {
        const question = userInput.trim();

        if (!question) {
            return;
        }

        try {
            setError(null);
            setIsLoading(true);
            setLastQuestion(question);

            const response = await makeChat();

            console.log('API response:', response);

            setAiResponse(response);
            setUserInput('');
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Ismeretlen hiba történt'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main id="main_content">
            {error && <h4>{error}</h4>}

            <div className="chat_container">
                <p id="user">{lastQuestion}</p>

                <p id="agent">
                    {isLoading
                        ? 'Válasz generálása...'
                        : aiResponse?.reply}
                </p>
            </div>

            <footer className="chat_footer">
                <div className="input_wrapper">
                    <input
                        type="text"
                        id="user_input"
                        value={userInput}
                        onChange={(event) => {
                            setUserInput(event.target.value);
                        }}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                void getAiResponse();
                            }
                        }}
                    />

                    <button
                        type="button"
                        id="btn_send"
                        disabled={isLoading}
                        onClick={() => {
                            void getAiResponse();
                        }}
                    >
                        {isLoading ? 'Sending...' : 'Send'}
                    </button>
                </div>

                <p>{new Date().getFullYear()} ❤️</p>
            </footer>
        </main>
    );
}

export default MainPage;