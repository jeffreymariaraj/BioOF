import { X, Zap, Database } from 'lucide-react'
import { useEffect, useState } from 'react'

interface GeneDetailProps {
    geneId: string;
    onClose: () => void;
    data: any;
}

export function GeneDetailModal({ geneId, onClose, data }: GeneDetailProps) {
    if (!data) return null;

    const isRedis = data.source_badge === 'REDIS_CACHE';

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header with Dynamic Badge */}
                <div className={`p-6 border-b border-slate-700 flex justify-between items-start ${isRedis ? 'bg-yellow-500/10' : 'bg-green-500/10'}`}>
                    <div>
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-2 ${isRedis ? 'bg-yellow-500 text-yellow-950' : 'bg-green-500 text-green-950'}`}>
                            {isRedis ? <Zap size={14} fill="currentColor" /> : <Database size={14} />}
                            {isRedis ? 'SERVED FROM REDIS CACHE' : 'FETCHED FROM MONGODB'}
                        </div>
                        <h2 className="text-2xl font-bold text-white">{data.gene_symbol}</h2>
                        <p className="text-slate-400 text-xs font-mono mt-1">ID: {geneId}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Biotype</label>
                            <p className="text-lg">{data.metadata?.biotype}</p>
                        </div>
                        <div>
                            <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Chromosome</label>
                            <p className="text-lg text-cyan-400">{data.metadata?.chromosome}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Expression Score</label>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-mono font-bold">{data.expression_score?.toFixed(2)}</span>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold">GC Content</label>
                            <p className="text-lg">{data.gc_content?.toFixed(1)}%</p>
                        </div>
                    </div>

                    <div className="col-span-2 mt-2">
                        <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Sequence Snippet</label>
                        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs text-slate-400 break-all mt-1">
                            {data.sequence_snippet}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
