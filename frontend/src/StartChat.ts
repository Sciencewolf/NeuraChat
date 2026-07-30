export interface ChatResponse {
    reply?: string;
    [key: string]: unknown;
}

function getUserState() {
    const userInput = document.getElementById("user_input") as HTMLInputElement;

    const state = sessionStorage.getItem("state") as string | null;

    return [userInput.value, state]
}

function setState(s: object) {
    sessionStorage.setItem("state", JSON.stringify(s))
}

export async function makeChat(): Promise<ChatResponse> {
    const [userVal, state] = getUserState()

    const makeCall = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/chat`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                question: userVal,
                state: state,
            }),
        }
    );

    if (!makeCall.ok) {
        throw new Error(`API hiba: ${makeCall.status}`);
    }

    return await makeCall.json().then(r => r.response).then(r => JSON.parse(r)) as ChatResponse;
}