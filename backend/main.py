from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd
import numpy as np

app = FastAPI(title="Fintech Churn API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. Load Model & Preprocessor ---
try:
    rf_model = joblib.load('churn_rf_model.joblib')
    scaler = joblib.load('minmax_scaler.joblib')
    label_encoder = joblib.load('label_encoder.joblib')
    print("Semua model dan preprocessor berhasil dimuat!")
except Exception as e:
    print(f"Gagal memuat file .joblib: {e}")

# --- 2. Skema Input Data Mentah ---
class CustomerData(BaseModel):
    CreditScore: int
    Geography: str
    Gender: str
    Age: int
    Tenure: int
    Balance: float
    NumOfProducts: int
    HasCrCard: int
    IsActiveMember: int
    EstimatedSalary: float

# --- 3. FUNGSI PREPROCESSING UTAMA ---
def preprocess_data(df: pd.DataFrame) -> pd.DataFrame:
    # A. Fitur Numerik Rasio
    df['BalanceToSalaryRatio'] = df['Balance'] / df['EstimatedSalary']
    
    # Hindari pembagian dengan nol jika NumOfProducts = 0
    df['NumOfProducts_Safe'] = df['NumOfProducts'].replace(0, 1)
    df['AverageBalancePerProduct'] = df['Balance'] / df['NumOfProducts_Safe']
    
    # Scale AverageBalancePerProduct menggunakan scaler yang di-load dari Colab
    df[['AverageBalancePerProduct']] = scaler.transform(df[['AverageBalancePerProduct']])
    
    # B. Fitur Kategorikal: AgeGroup (Label Encoding)
    # Asumsi binning umur: Remaja (<20), Dewasa (20-55), Lansia (>55)
    conditions = [
        (df['Age'] < 20),
        (df['Age'] >= 20) & (df['Age'] < 55),
        (df['Age'] >= 55)
    ]
    choices = ['Remaja', 'Dewasa', 'Lansia']
    df['AgeGroup_Text'] = np.select(conditions, choices, default='Dewasa')
    # Ubah teks menjadi angka menggunakan label_encoder dari Colab
    df['AgeGroup'] = label_encoder.transform(df['AgeGroup_Text'])
    
    # C. Fitur Interaksi (Interaction Features)
    mapping_gg = {
        'Female_France': 0, 'Female_Germany': 1, 'Female_Spain': 2,
        'Male_France': 3, 'Male_Germany': 4, 'Male_Spain': 5
    }
    df['Gender_Geography'] = df['Gender'] + '_' + df['Geography']
    df['Gender_Geography'] = df['Gender_Geography'].map(mapping_gg).fillna(0)
    
    df['IsActiveWithCard'] = df['IsActiveMember'] * df['HasCrCard']
    
    # D. Fitur One-Hot Encoding (OHE) manual
    # OHE Geography (Asumsi pengurutan abjad di Colab: France=0, Germany=1, Spain=2)
    df['Geography_0'] = (df['Geography'] == 'France').astype(int)
    df['Geography_1'] = (df['Geography'] == 'Germany').astype(int)
    df['Geography_2'] = (df['Geography'] == 'Spain').astype(int)
    
    # OHE Gender (Asumsi pengurutan abjad: Female=0, Male=1)
    df['Gender_0'] = (df['Gender'] == 'Female').astype(int)
    df['Gender_1'] = (df['Gender'] == 'Male').astype(int)
    
    # E. Fitur Kategori Credit Score (One-Hot Encoding)
    # Asumsi batasan umum: Poor (< 580), Good (580 - 749), Excellent (>= 750)
    df['CreditScoreTier_Poor'] = (df['CreditScore'] < 580).astype(int)
    df['CreditScoreTier_Good'] = ((df['CreditScore'] >= 580) & (df['CreditScore'] < 750)).astype(int)
    df['CreditScoreTier_Excellent'] = (df['CreditScore'] >= 750).astype(int)
    
    # --- 4. PENYELARASAN KOLOM ---
    # Model Random Forest SANGAT KETAT terhadap urutan kolom. 
    # Kita harus mengambil 20 kolom persis seperti urutan pelatihan.
    expected_columns = rf_model.feature_names_in_
    
    return df[expected_columns]

# --- 4. Endpoint API ---
@app.post("/predict")
def predict_churn(data: CustomerData):
    try:
        input_df = pd.DataFrame([data.model_dump()]) # model_dump untuk pydantic v2
        
        processed_df = preprocess_data(input_df)
        
        prediction = rf_model.predict(processed_df)
        probability = rf_model.predict_proba(processed_df)[0][1]
        
        return {
            "status": "success",
            "prediction": int(prediction[0]),
            "churn_probability": round(probability * 100, 2),
            "message": "High Risk of Churn" if prediction[0] == 1 else "Retained Customer"
        }
    except Exception as e:
        print(f"Error detail: {str(e)}") # Untuk debugging di terminal
        raise HTTPException(status_code=500, detail=str(e))