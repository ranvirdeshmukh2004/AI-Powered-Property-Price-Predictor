import { Database, UploadCloud, AlertTriangle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { useState, useRef } from 'react';

const API_BASE = 'http://localhost:8000/api';

export default function AdminPage() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [message, setMessage] = useState('');
  const [metrics, setMetrics] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus('error');
      setMessage('Please select a CSV file first.');
      return;
    }

    setStatus('uploading');
    setMessage('Uploading dataset and retraining model. This may take up to a minute...');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE}/retrain`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Training failed due to invalid data format.');
      }

      setStatus('success');
      setMessage('Model retrained successfully. Live endpoints are now using the new model.');
      setMetrics(data.metrics);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setStatus('error');
      // The Safe Fallback mechanism keeps the server running
      setMessage(err.message + ' — Safe Fallback activated. The previous model is still online.');
    }
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="section-title flex items-center gap-2">
          <Database className="w-6 h-6 text-brand-400" />
          Model Administration
        </h2>
        <p className="section-subtitle">
          Dynamically retrain the XGBoost prediction engine with real-world property characteristics and price transactions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Upload Card */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-6 border border-brand-500/20">
            <h3 className="text-lg font-bold text-white mb-4">Retrain with Custom Dataset</h3>
            
            <div 
              className="border-2 border-dashed border-surface-600 hover:border-brand-500/50 rounded-xl p-8 mb-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-surface-800/30"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                accept=".csv" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <UploadCloud className="w-10 h-10 text-brand-400 mb-3" />
              <p className="text-white font-medium mb-1">
                {file ? file.name : "Click to upload a CSV dataset"}
              </p>
              <p className="text-xs text-surface-400">
                {file ? `${(file.size / 1024).toFixed(1)} KB` : "Must contain required feature columns and price_lakhs"}
              </p>
            </div>

            <button 
              onClick={handleUpload}
              disabled={status === 'uploading' || !file}
              className="btn-primary w-full py-3"
            >
              {status === 'uploading' ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-2"/> Retraining XGBoost Model...</>
              ) : (
                <><Database className="w-4 h-4 mr-2"/> Initiate Training Pipeline <ArrowRight className="w-4 h-4 ml-2"/></>
              )}
            </button>
          </div>

          {/* Status Messages */}
          {status === 'error' && (
            <div className="glass-card border-red-500/30 bg-red-950/20 p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-red-300">Training Failed</h4>
                <p className="text-sm text-red-200/80 mt-1">{message}</p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="glass-card border-accent-500/30 bg-accent-950/20 p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-accent-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-accent-300">Pipeline Success</h4>
                <p className="text-sm text-accent-200/80 mt-1">{message}</p>
                
                {metrics && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="bg-surface-900/50 p-3 rounded-lg border border-accent-500/20">
                      <div className="text-xs text-surface-400">Test R² Score</div>
                      <div className="text-xl font-bold text-accent-400">{(metrics.test_r2 * 100).toFixed(1)}%</div>
                    </div>
                    <div className="bg-surface-900/50 p-3 rounded-lg border border-accent-500/20">
                      <div className="text-xs text-surface-400">Test RMSE</div>
                      <div className="text-xl font-bold text-accent-400">₹{metrics.test_rmse_lakhs}L</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
           <div className="glass-card p-5">
             <h4 className="font-bold text-sm text-brand-300 mb-2 uppercase tracking-wider">Safe Fallback System</h4>
             <p className="text-xs text-surface-300 leading-relaxed">
               When you retrain the model, the backend uses a staging environment first. If the process crashes or validation fails, it safely falls back to the current live model to guarantee zero downtime.
             </p>
           </div>
           
           <div className="glass-card p-5">
             <h4 className="font-bold text-sm text-white mb-2">Required CSV Schema</h4>
             <ul className="text-xs text-surface-400 space-y-1.5 list-disc list-inside">
               <li>corridor (text)</li>
               <li>locality (text)</li>
               <li>bhk (numeric)</li>
               <li>sqft (numeric)</li>
               <li>bathrooms (numeric)</li>
               <li>floor (numeric)</li>
               <li>parking (0/1)</li>
               <li>gym, swimming_pool, garden, security, clubhouse (all 0/1)</li>
               <li className="text-brand-300 font-semibold mt-2 list-none border-t border-surface-700 pt-2">price_lakhs (numeric target loop)</li>
             </ul>
           </div>
        </div>

      </div>
    </div>
  );
}
