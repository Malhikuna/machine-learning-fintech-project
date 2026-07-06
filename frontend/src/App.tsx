import PredictionForm from "./components/PredictionForm";

function App() {
  return (
    <div className="min-h-screen bg-slate-100 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Fintech Analytics</h1>
            <p className="text-sm text-slate-500 mt-1">Customer Churn Prediction Dashboard</p>
          </div>
        </div>

        <PredictionForm />
      </div>
    </div>
  );
}

export default App;
