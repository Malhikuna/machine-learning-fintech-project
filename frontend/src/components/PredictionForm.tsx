// src/components/PredictionForm.tsx
import { useState } from "react";
import { predictChurn, type CustomerData, type PredictionResponse } from "../services/api";

export default function PredictionForm() {
  const [formData, setFormData] = useState<CustomerData>({
    CreditScore: 650,
    Geography: "France",
    Gender: "Female",
    Age: 35,
    Tenure: 5,
    Balance: 50000,
    NumOfProducts: 2,
    HasCrCard: 1,
    IsActiveMember: 1,
    EstimatedSalary: 75000,
  });

  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "Geography" || name === "Gender" ? value : Number(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null); // Reset hasil sebelumnya
    const response = await predictChurn(formData);
    setResult(response);
    setLoading(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden font-sans text-sm">
      {/* Header Section */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">New Prediction Task</h2>
          <p className="text-slate-500 text-xs mt-0.5">Enter customer metrics to evaluate churn probability.</p>
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setFormData({ CreditScore: 0, Geography: "France", Gender: "Female", Age: 0, Tenure: 0, Balance: 0, NumOfProducts: 1, HasCrCard: 0, IsActiveMember: 0, EstimatedSalary: 0 })}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            Clear Form
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Form Section */}
        <div className="w-full md:w-2/3 p-6">
          <form id="churn-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Demographics Group */}
            <div className="md:col-span-2 border-b border-slate-100 pb-2 mb-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Demographics</h3>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-700 mb-1">Age</label>
              <input
                type="number"
                name="Age"
                value={formData.Age}
                onChange={handleChange}
                required
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-700 mb-1">Gender</label>
              <select
                name="Gender"
                value={formData.Gender}
                onChange={handleChange}
                className="w-full px-3 py-1.5 pr-8 text-sm border border-slate-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%2364748b%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[position:right_0.5rem_center] bg-no-repeat text-slate-700"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-700 mb-1">Geography</label>
              <select
                name="Geography"
                value={formData.Geography}
                onChange={handleChange}
                className="w-full px-3 py-1.5 pr-8 text-sm border border-slate-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%2364748b%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[position:right_0.5rem_center] bg-no-repeat text-slate-700"
              >
                <option value="France">France</option>
                <option value="Germany">Germany</option>
                <option value="Spain">Spain</option>
              </select>
            </div>

            {/* Account Metrics Group */}
            <div className="md:col-span-2 border-b border-slate-100 pb-2 mb-2 mt-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Metrics</h3>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-700 mb-1">Credit Score</label>
              <input
                type="number"
                name="CreditScore"
                value={formData.CreditScore}
                onChange={handleChange}
                required
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-700 mb-1">Account Balance ($)</label>
              <input
                type="number"
                step="10000"
                name="Balance"
                value={formData.Balance}
                onChange={handleChange}
                required
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-700 mb-1">Estimated Salary ($)</label>
              <input
                type="number"
                step="10000"
                name="EstimatedSalary"
                value={formData.EstimatedSalary}
                onChange={handleChange}
                required
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-700 mb-1">Tenure (Years)</label>
              <input
                type="number"
                name="Tenure"
                value={formData.Tenure}
                onChange={handleChange}
                required
                min="0"
                max="10"
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-700 mb-1">Number of Products</label>
              <input
                type="number"
                name="NumOfProducts"
                value={formData.NumOfProducts}
                onChange={handleChange}
                required
                min="1"
                max="4"
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Toggles / Binary Options */}
            <div className="md:col-span-2 flex space-x-6 mt-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="HasCrCard"
                  checked={formData.HasCrCard === 1}
                  onChange={(e) => setFormData((prev) => ({ ...prev, HasCrCard: e.target.checked ? 1 : 0 }))}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Has Credit Card</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="IsActiveMember"
                  checked={formData.IsActiveMember === 1}
                  onChange={(e) => setFormData((prev) => ({ ...prev, IsActiveMember: e.target.checked ? 1 : 0 }))}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Active Member</span>
              </label>
            </div>
          </form>
        </div>

        {/* Results Panel Sidebar */}
        <div className="w-full md:w-1/3 bg-slate-50 border-l border-slate-200 p-6 flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-800">Execution</h3>
            <p className="text-xs text-slate-500">Run model inference</p>
          </div>

          <button
            form="churn-form"
            type="submit"
            disabled={loading}
            className="w-full mb-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded shadow-sm transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              "Run Prediction"
            )}
          </button>

          <div className="flex-grow">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">Output Log</h3>

            {!result && !loading && <div className="text-xs text-slate-400 italic text-center mt-10">Awaiting input parameters...</div>}

            {result && result.status === "error" && (
              <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-xs break-words">
                <span className="font-bold block mb-1">Execution Failed</span>
                {result.message}
              </div>
            )}

            {result && result.status === "success" && (
              <div className="space-y-3">
                <div className={`p-4 rounded border flex flex-col items-center justify-center text-center ${result.prediction === 1 ? "bg-rose-50 border-rose-200" : "bg-emerald-50 border-emerald-200"}`}>
                  <span className={`text-3xl font-bold ${result.prediction === 1 ? "text-rose-600" : "text-emerald-600"}`}>{result.churn_probability}%</span>
                  <span className="text-xs font-medium text-slate-600 mt-1 uppercase tracking-wide">Churn Risk</span>
                </div>

                <div className="bg-white border border-slate-200 rounded p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-500">Status</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${result.prediction === 1 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>{result.prediction === 1 ? "High Risk" : "Retained"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Model</span>
                    <span className="text-xs font-medium text-slate-700">Random Forest v1</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
