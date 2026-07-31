interface ModelResponse {
    model?: unknown;
    models?: unknown;
    error?: unknown;
}

export interface ModelCatalog {
    currentModel: string;
    models: string[];
}

async function getModel(): Promise<ModelCatalog> {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

    if (!apiBaseUrl) {
        throw new Error('A VITE_API_BASE_URL nincs beállítva.');
    }

    const apiResponse = await fetch(`${apiBaseUrl}/model`);

    if (!apiResponse.ok) {
        throw new Error(`A modell lekérése sikertelen: ${apiResponse.status}`);
    }

    const body = (await apiResponse.json()) as ModelResponse;

    if (
        typeof body.model !== 'string' ||
        !Array.isArray(body.models) ||
        !body.models.every((model) => typeof model === 'string')
    ) {
        throw new Error('Az API nem adott vissza érvényes modelllistát.');
    }

    return {
        currentModel: body.model,
        models: body.models,
    };
}

export async function changeModel(model: string): Promise<string> {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

    if (!apiBaseUrl) {
        throw new Error('A VITE_API_BASE_URL nincs beállítva.');
    }

    const apiResponse = await fetch(`${apiBaseUrl}/model`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model }),
    });

    const body = (await apiResponse.json().catch(() => ({}))) as ModelResponse;

    if (!apiResponse.ok) {
        throw new Error(
            typeof body.error === 'string'
                ? body.error
                : `A modellváltás sikertelen: ${apiResponse.status}`,
        );
    }

    if (typeof body.model !== 'string') {
        throw new Error('Az API nem igazolta vissza a kiválasztott modellt.');
    }

    return body.model;
}

export default getModel;
