export interface ChatMessage {
    user: string;
    agent: string;
}

export interface ChatResponse {
    reply: string;
}

export type ToolName = '' | 'web_search';

interface ChatApiResponse {
    response?: unknown;
}

function parseChatResponse(value: unknown): ChatResponse {
    let parsedValue = value;

    if (typeof value === 'string') {
        try {
            parsedValue = JSON.parse(value) as unknown;
        } catch {
            return { reply: value };
        }
    }

    if (
        typeof parsedValue === 'object' &&
        parsedValue !== null &&
        'reply' in parsedValue &&
        typeof parsedValue.reply === 'string'
    ) {
        return { reply: parsedValue.reply };
    }

    throw new Error('Az API válasza nem tartalmaz érvényes reply mezőt.');
}

export async function makeChat(
    question: string,
    state: ChatMessage[],
    model: string,
    tool: ToolName,
): Promise<ChatResponse> {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

    if (!apiBaseUrl) {
        throw new Error('A VITE_API_BASE_URL nincs beállítva.');
    }

    const apiResponse = await fetch(`${apiBaseUrl}/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            question,
            state,
            model,
            tool,
        }),
    });

    if (!apiResponse.ok) {
        throw new Error(`API hiba: ${apiResponse.status}`);
    }

    const body = (await apiResponse.json()) as ChatApiResponse;

    return parseChatResponse(body.response);
}
