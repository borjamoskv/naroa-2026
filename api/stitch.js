/**
 * Vercel Serverless Function Proxy for Stitch API
 * Prevents exposing API Key to the client
 */

export default async function handler(request, response) {
    const { method, body } = request;
    const { STITCH_API_KEY } = process.env;

    if (!STITCH_API_KEY) {
        return response.status(500).json({ error: 'STITCH_API_KEY not configured on server' });
    }

    const endpoint = request.url.split('/api/stitch/')[1] || 'generate';
    const baseUrl = 'https://stitch.googleapis.com/v1';

    try {
        const fetchOptions = {
            method: method,
            headers: {
                'Authorization': `Bearer ${STITCH_API_KEY}`,
                'Content-Type': 'application/json'
            }
        };

        if (['POST', 'PUT', 'PATCH'].includes(method)) {
            fetchOptions.body = JSON.stringify(body);
        }

        const externalResponse = await fetch(`${baseUrl}/${endpoint}`, fetchOptions);
        const data = await externalResponse.json();

        return response.status(externalResponse.status).json(data);
    } catch (error) {
        console.error('[Backend Proxy] Stitch Error:', error);
        return response.status(500).json({ error: 'Failed to proxy request to Stitch' });
    }
}
