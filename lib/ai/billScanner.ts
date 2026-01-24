
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

interface ScanResult {
    value: number | null;
    confidence: number;
    error?: string;
    rawText?: string;
}

export const scanBillWithAI = async (fileBase64: string, mimeType: string): Promise<ScanResult> => {
    if (!API_KEY) {
        return { value: null, confidence: 0, error: 'API Key missing' };
    }

    try {
        const base64Data = fileBase64.split(',')[1] || fileBase64;

        const prompt = `
            Look at this image. It is an energy bill (or part of it).
            Identify the TOTAL AMOUNT TO PAY (Valor Total / Total a Pagar).
            Respond with ONLY the number. Convert it to a simple format like 123.45.
            Do not include "R$", "Currency", or sentences.
            If you see "370,84", return 370.84.
            If you cannot find a value, return "NOT_FOUND".
        `;

        const requestBody = {
            contents: [{
                parts: [
                    { text: prompt },
                    {
                        inline_data: {
                            mime_type: mimeType,
                            data: base64Data
                        }
                    }
                ]
            }],
            safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
            ]
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`AI API Error: ${response.statusText}`);
        }

        const data = await response.json();

        // Debug logging
        console.log('AI Full Response:', JSON.stringify(data));

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            // Check for safety finish reason
            const finishReason = data.candidates?.[0]?.finishReason;
            if (finishReason === 'SAFETY') {
                return { value: null, confidence: 0, error: 'Blocked by Safety Filters', rawText: 'Safety Block' };
            }
            return { value: null, confidence: 0, rawText: 'Empty Response' };
        }

        const cleanText = text.trim();

        if (cleanText.includes("NOT_FOUND")) {
            return { value: null, confidence: 0, rawText: cleanText };
        }

        // Parse number
        // Remove currency symbols but keep digits, dots and commas
        let numStr = cleanText.replace(/[^\d.,]/g, '');

        // Fix brazilian format 1.234,56 -> 1234.56
        if (numStr.includes(',') && numStr.includes('.')) {
            // Validate position. If dot comes before comma (1.200,00) -> remove dot, replace comma
            if (numStr.indexOf('.') < numStr.indexOf(',')) {
                numStr = numStr.replace(/\./g, '').replace(',', '.');
            } else {
                // 1,200.00 (US) -> remove comma
                numStr = numStr.replace(/,/g, '');
            }
        } else if (numStr.includes(',')) {
            // 123,45 -> 123.45
            numStr = numStr.replace(',', '.');
        }

        const value = parseFloat(numStr);

        if (isNaN(value)) {
            return { value: null, confidence: 0, rawText: text };
        }

        return { value, confidence: 0.9, rawText: text };

    } catch (error: any) {
        console.error('Bill Scan Error:', error);
        return { value: null, confidence: 0, error: error.message };
    }
};
