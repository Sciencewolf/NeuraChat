export interface ChatMessage {
    user: string;
    agent: string;
    model?: string;
    is_web_search?: boolean;
}

export interface ChatResponse {
    reply: string;
    model: string;
    is_web_search?: boolean;
}

export type ToolName = '' | 'web_search';

interface ChatApiResponse {
    response?: unknown;
    model?: unknown;
    is_web_search?: boolean;
}

function parseReply(value: unknown): string {
    let parsedValue = value;

    if (typeof value === 'string') {
        try {
            parsedValue = JSON.parse(value) as unknown;
        } catch {
            return value;
        }
    }

    if (
        typeof parsedValue === 'object' &&
        parsedValue !== null &&
        'reply' in parsedValue &&
        typeof parsedValue.reply === 'string'
    ) {
        return parsedValue.reply;
    }

    throw new Error('The API response does not contain a valid reply field.');
}

export async function makeChat(
    question: string,
    state: ChatMessage[],
    model: string,
    tool: ToolName,
): Promise<ChatResponse> {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

    if (!apiBaseUrl) {
        throw new Error('VITE_API_BASE_URL is not configured.');
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
        throw new Error(`API error: ${apiResponse.status}`);
    }

    const body = (await apiResponse.json()) as ChatApiResponse;

    if (typeof body.model !== 'string') {
        throw new Error('The API response does not contain a valid model name.');
    }

    return {
        reply: parseReply(body.response),
        model: body.model,
        is_web_search: body.is_web_search
    };
}
