export interface CustomerData {
  CreditScore: number;
  Geography: string;
  Gender: string;
  Age: number;
  Tenure: number;
  Balance: number;
  NumOfProducts: number;
  HasCrCard: number;
  IsActiveMember: number;
  EstimatedSalary: number;
}

export interface PredictionResponse {
  status: string;
  prediction?: number;
  churn_probability?: number;
  message?: string;
  detail?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const predictChurn = async (data: CustomerData): Promise<PredictionResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Gagal terhubung ke API Server");
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    return { status: "error", message: "Gagal memproses prediksi" };
  }
};
