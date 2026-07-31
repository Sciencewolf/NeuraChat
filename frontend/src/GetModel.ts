interface ModelResponse {
    model?: unknown;
}

async function getModel(): Promise<string> {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

    if (!apiBaseUrl) {
        throw new Error('A VITE_API_BASE_URL nincs beállítva.');
    }

    const apiResponse = await fetch(`${apiBaseUrl}/model`);

    if (!apiResponse.ok) {
        throw new Error(`A modell lekérése sikertelen: ${apiResponse.status}`);
    }

    const body = (await apiResponse.json()) as ModelResponse;

    if (typeof body.model !== 'string') {
        throw new Error('Az API nem adott vissza érvényes modellnevet.');
    }

    return body.model;
}

export default getModel;
