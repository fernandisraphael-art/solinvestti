
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeEnergyProfile = async (monthlyBill: number, region: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analise um perfil de consumo de energia de R$ ${monthlyBill} na região de ${region}. O desconto médio praticado é de 18%. Calcule a economia_mensal_estimada (monthlyBill * 0.18), o novo_valor_conta (monthlyBill - economia_mensal_estimada), e retorne em JSON junto com roi_percentual (fixo 14 para este exemplo) e uma dica_investimento curta.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            economia_mensal_estimada: { type: Type.NUMBER },
            novo_valor_conta: { type: Type.NUMBER },
            roi_percentual: { type: Type.NUMBER },
            dica_investimento: { type: Type.STRING }
          },
          required: ["economia_mensal_estimada", "novo_valor_conta", "roi_percentual", "dica_investimento"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback logic matemática correta
    const discount = 0.18;
    const savings = monthlyBill * discount;
    return {
      economia_mensal_estimada: savings,
      novo_valor_conta: monthlyBill - savings,
      roi_percentual: 14,
      dica_investimento: "Invista sua economia em usinas solares para retorno garantido."
    };
  }
};
