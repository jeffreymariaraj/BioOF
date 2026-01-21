import React from 'react';
import { X, Network, Database, RefreshCcw, Layers } from 'lucide-react';

interface EvolutionArchitectureModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const EvolutionArchitectureModal: React.FC<EvolutionArchitectureModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div
                className="w-full max-w-4xl bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl p-8 relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute right-6 top-6 p-2 rounded-full hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-8">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-500 flex items-center gap-3">
                        <Network className="w-8 h-8 text-pink-500" />
                        Hybrid Schema Evolution Architecture
                    </h2>
                    <p className="text-slate-400 mt-2 text-lg">How BioOF achieves zero-downtime schema upgrades.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 relative z-10">
                    {/* Step 1: SQL Registry */}
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all group">
                        <div className="w-12 h-12 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Database className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">1. SQL Meta-Registry</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            The new attribute definition (name, type, default) is first recorded in the PostgreSQL <code className="text-blue-300">schema_evolution_log</code>. This acts as the strict "System Catalog" for validation.
                        </p>
                    </div>

                    {/* Step 2: NoSQL Injection */}
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 hover:border-green-500/50 transition-all group">
                        <div className="w-12 h-12 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Layers className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">2. Dynamic Injection</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            The backend executes a MongoDB <code className="text-green-300">updateMany($set)</code> command. This instantly injects the new field into all 10,000+ JSON documents without table locking or migration.
                        </p>
                    </div>

                    {/* Step 3: Semantic Propagation */}
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 hover:border-amber-500/50 transition-all group">
                        <div className="w-12 h-12 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <RefreshCcw className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">3. Semantic Propagation</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Business rules trigger automatic data enrichments. For example, adding a "Status" field might auto-propagate a "Validated" flag to linked experimental records.
                        </p>
                    </div>
                </div>

                {/* Connecting Lines (Visual Decoration) */}
                <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-blue-500/20 via-green-500/20 to-amber-500/20 -z-0 transform -translate-y-4"></div>
            </div>
        </div>
    );
};
