import { useState, useRef, useEffect } from "react";
import { predictChurn, type CustomerData, type PredictionResponse } from "../services/api";

// --- Custom Select Component ---
interface CustomSelectProps {
  label: string;
  name: string;
  value: string;
  options: string[];
  onChange: (name: string, value: string) => void;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ label, name, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col relative w-full" ref={selectRef}>
      <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      <div 
        className={`w-full px-3 py-1.5 text-sm border rounded-md bg-white cursor-pointer relative transition-all duration-150 select-none flex items-center justify-between ${isOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-300 hover:border-slate-400 shadow-sm'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="block truncate text-slate-800 font-medium">{value}</span>
        <svg className={`w-4 h-4 text-slate-400 transition-transform duration-150 ${isOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
      
      <div className={`absolute z-30 w-full top-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg transition-all duration-150 origin-top ${isOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-95 pointer-events-none'}`}>
        <ul className="py-1 overflow-auto text-sm max-h-60">
          {options.map((option) => (
            <li 
              key={option}
              className={`px-3 py-1.5 cursor-pointer select-none transition-colors duration-100 flex items-center justify-between ${value === option ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'}`}
              onClick={() => {
                onChange(name, option);
                setIsOpen(false);
              }}
            >
              <span className={value === option ? 'font-medium' : ''}>{option}</span>
              {value === option && (
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

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

  const handleCustomSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : Number(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const response = await predictChurn(formData);
    setResult(response);
    setLoading(false);
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row antialiased">
      {/* Form Section */}
      <div className="w-full md:w-[65%] p-6 md:p-8 relative">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Prediction Parameters</h2>
            <p className="text-xs text-slate-500 mt-1">Configure customer metrics to evaluate churn probability.</p>
          </div>
          <button
            type="button"
            onClick={() => setFormData({ CreditScore: 0, Geography: "France", Gender: "Female", Age: 0, Tenure: 0, Balance: 0, NumOfProducts: 1, HasCrCard: 0, IsActiveMember: 0, EstimatedSalary: 0 })}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            Clear
          </button>
        </div>

        <form id="churn-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Demographics Group */}
          <div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Demographics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">Age</label>
                <input
                  type="number"
                  name="Age"
                  value={formData.Age}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-1.5 text-sm font-medium text-slate-800 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400"
                />
              </div>

              <CustomSelect
                label="Gender"
                name="Gender"
                value={formData.Gender}
                options={["Female", "Male"]}
                onChange={handleCustomSelectChange}
              />

              <CustomSelect
                label="Geography"
                name="Geography"
                value={formData.Geography}
                options={["France", "Germany", "Spain"]}
                onChange={handleCustomSelectChange}
              />
            </div>
          </div>

          <div className="h-px w-full bg-slate-100"></div>

          {/* Account Metrics Group */}
          <div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Account Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">Credit Score</label>
                <input
                  type="number"
                  name="CreditScore"
                  value={formData.CreditScore}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-1.5 text-sm font-medium text-slate-800 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="flex flex-col relative">
                <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">Account Balance</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400 text-sm font-medium pointer-events-none">$</span>
                  <input
                    type="number"
                    step="10000"
                    name="Balance"
                    value={formData.Balance}
                    onChange={handleChange}
                    required
                    className="w-full pl-7 pr-3 py-1.5 text-sm font-medium text-slate-800 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col relative">
                <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">Estimated Salary</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400 text-sm font-medium pointer-events-none">$</span>
                  <input
                    type="number"
                    step="10000"
                    name="EstimatedSalary"
                    value={formData.EstimatedSalary}
                    onChange={handleChange}
                    required
                    className="w-full pl-7 pr-3 py-1.5 text-sm font-medium text-slate-800 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">Tenure (Years)</label>
                <input
                  type="number"
                  name="Tenure"
                  value={formData.Tenure}
                  onChange={handleChange}
                  required
                  min="0"
                  max="10"
                  className="w-full px-3 py-1.5 text-sm font-medium text-slate-800 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">Number of Products</label>
                <input
                  type="number"
                  name="NumOfProducts"
                  value={formData.NumOfProducts}
                  onChange={handleChange}
                  required
                  min="1"
                  max="4"
                  className="w-full px-3 py-1.5 text-sm font-medium text-slate-800 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Custom Checkboxes */}
            <div className="flex items-center space-x-6 mt-5 p-3.5 bg-slate-50/50 rounded-lg border border-slate-100">
              <label className="flex items-center space-x-2.5 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    name="HasCrCard"
                    checked={formData.HasCrCard === 1}
                    onChange={handleChange}
                    className="peer sr-only"
                  />
                  <div className="w-4 h-4 border border-slate-300 rounded bg-white peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors shadow-sm"></div>
                  <svg className="absolute w-4 h-4 text-white scale-0 peer-checked:scale-100 transition-transform pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900 transition-colors">Has Credit Card</span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    name="IsActiveMember"
                    checked={formData.IsActiveMember === 1}
                    onChange={handleChange}
                    className="peer sr-only"
                  />
                  <div className="w-4 h-4 border border-slate-300 rounded bg-white peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors shadow-sm"></div>
                  <svg className="absolute w-4 h-4 text-white scale-0 peer-checked:scale-100 transition-transform pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900 transition-colors">Active Member</span>
              </label>
            </div>
          </div>
        </form>
      </div>

      {/* Execution Panel Sidebar */}
      <div className="w-full md:w-[35%] bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200 p-6 md:p-8 flex flex-col">
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Execution Console</h3>
          <p className="text-xs text-slate-500 mt-0.5">Initialize model inference</p>
        </div>

        <button
          form="churn-form"
          type="submit"
          disabled={loading}
          className="w-full mb-8 bg-[#0f172a] hover:bg-[#1e293b] text-white text-sm font-medium py-2 px-4 rounded-md shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center group focus:outline-none focus:ring-2 focus:ring-slate-900/20"
        >
          {loading ? (
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <span className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Run Prediction</span>
            </span>
          )}
        </button>

        <div className="flex-grow flex flex-col">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Output Log</h3>
          
          <div className="flex-grow bg-white border border-slate-200 rounded-lg p-5 shadow-sm relative overflow-hidden flex flex-col">
            {!result && !loading && (
              <div className="flex-grow flex flex-col items-center justify-center text-slate-400">
                <svg className="w-6 h-6 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-[11px] font-medium tracking-wide">AWAITING PARAMETERS</span>
              </div>
            )}

            {loading && (
              <div className="flex-grow flex flex-col items-center justify-center text-slate-400">
                <div className="flex space-x-1.5 mb-3">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-[11px] font-medium tracking-wide">PROCESSING...</span>
              </div>
            )}

            {result && result.status === "error" && (
              <div className="h-full flex flex-col text-rose-600 bg-rose-50/50 p-4 -m-1 rounded-md border border-rose-100 justify-center">
                <span className="text-xs font-bold mb-1.5 flex items-center justify-center">
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Execution Failed
                </span>
                <span className="text-[11px] text-center font-mono break-words opacity-80">{result.message}</span>
              </div>
            )}

            {result && result.status === "success" && (
              <div className="h-full flex flex-col w-full animate-[fadeIn_0.3s_ease-in-out]">
                <div className="flex-grow flex flex-col items-center justify-center py-2">
                  <div className={`relative flex items-center justify-center w-28 h-28 rounded-full border-4 ${result.prediction === 1 ? 'border-rose-100 bg-rose-50/30' : 'border-emerald-100 bg-emerald-50/30'} mb-4`}>
                    <span className={`text-3xl font-bold tracking-tight ${result.prediction === 1 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {result.churn_probability}%
                    </span>
                  </div>
                  <span className={`text-[11px] font-bold uppercase tracking-widest ${result.prediction === 1 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    Churn Risk
                  </span>
                </div>

                <div className="mt-auto space-y-2.5 border-t border-slate-100 pt-4 w-full">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Status</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${result.prediction === 1 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {result.prediction === 1 ? "High Risk" : "Retained"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Model</span>
                    <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">RF_v1</span>
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
