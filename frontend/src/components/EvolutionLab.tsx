import React, { useState } from 'react';
import axios from 'axios';
import { Settings, Zap, Play, Database, AlertCircle, CheckCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface EvolutionLabProps {
    onEvolutionComplete: () => void;
}

export const EvolutionLab: React.FC<EvolutionLabProps> = ({ onEvolutionComplete }) => {
    const [attrName, setAttrName] = useState('');
    const [defaultValue, setDefaultValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null, msg: string }>({ type: null, msg: '' });

    const handleEvolve = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!attrName || !defaultValue) return;

        setIsLoading(true);
        setStatus({ type: null, msg: '' });

        try {
            const response = await axios.post(`${API_URL}/api/schema/evolve`, {
                attribute_name: attrName,
                default_value: defaultValue,
                data_type: 'string' // simplified for MVP
            });

            setStatus({ type: 'success', msg: `Schema Successfully Evolved! Added '${attrName}' to 10,000+ documents.` });
            setAttrName('');
            setDefaultValue('');
            onEvolutionComplete(); // Refresh parent view
        } catch (err: any) {
            setStatus({ type: 'error', msg: err.response?.data?.detail || "Schema Evolution Failed" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="p-8 glass-panel rounded-2xl border-t-4 border-t-pink-500 shadow-2xl relative overflow-hidden">

                {/* Background Decoration */}
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl"></div>

                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="p-3 bg-pink-500/20 rounded-xl text-pink-400">
                        <Zap className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Schema Evolution Lab</h2>
                        <p className="text-slate-400">Dynamically inject new attributes into the live hybrid database.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-12 relative z-10">
                    {/* Form Section */}
                    <div>
                        <form onSubmit={handleEvolve} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">New Attribute Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={attrName}
                                        onChange={(e) => setAttrName(e.target.value)}
                                        placeholder="e.g. protein_stability"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all text-white placeholder-slate-600"
                                    />
                                    <Settings className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">Default Value</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={defaultValue}
                                        onChange={(e) => setDefaultValue(e.target.value)}
                                        placeholder="e.g. Unverified"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all text-white placeholder-slate-600"
                                    />
                                    <Database className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    *This value will be backfilled into all existing NoSQL documents.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !attrName || !defaultValue}
                                className="w-full py-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold rounded-xl shadow-lg shadow-pink-500/25 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <span className="animate-pulse">Injecting Field...</span>
                                ) : (
                                    <>
                                        <Play className="w-5 h-5 fill-current" />
                                        Evolve Schema Now
                                    </>
                                )}
                            </button>
                        </form>

                        {status.type && (
                            <div className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}>
                                {status.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                                <span className="font-medium">{status.msg}</span>
                            </div>
                        )}
                    </div>

                    {/* Info Panel */}
                    <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50 flex flex-col justify-center">
                        <h3 className="text-lg font-semibold text-white mb-4">How It Works</h3>
                        <ul className="space-y-4">
                            <li className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">1</div>
                                <p className="text-sm text-slate-400">Registers the new field definition in the <span className="text-blue-300">PostgreSQL Schema Log</span>.</p>
                            </li>
                            <li className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold shrink-0">2</div>
                                <p className="text-sm text-slate-400">Executes a massive <span className="text-green-300">MongoDB Update</span> to inject the field into 10k+ documents instantly.</p>
                            </li>
                            <li className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0">3</div>
                                <p className="text-sm text-slate-400">If the field is "Status", triggers <span className="text-amber-300">Semantic Propagation</span> logic across linked records.</p>
                            </li>
                        </ul>

                        <div className="mt-8 p-4 bg-slate-900/50 rounded-lg border border-slate-800">
                            <div className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">Example Use Case</div>
                            <div className="font-mono text-sm text-pink-300">
                                Field: <span className="text-white">protein_stability</span><br />
                                Default: <span className="text-white">Pending Analysis</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
