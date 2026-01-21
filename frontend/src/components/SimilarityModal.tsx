import React from 'react';
import { X, RefreshCw, Cuboid as Cube } from 'lucide-react';

interface RecommendedGene {
    _id: string;
    gene_symbol: string;
    similarity_score: number;
    experiment_id: number;
    expression_score: number;
    gc_content: number;
    metadata: {
        biotype: string;
        chromosome: string;
    };
}

interface SimilarityModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetGene: string;
    recommendations: RecommendedGene[];
    isLoading: boolean;
}

export const SimilarityModal: React.FC<SimilarityModalProps> = ({
    isOpen,
    onClose,
    targetGene,
    recommendations,
    isLoading
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div
                className="w-full max-w-2xl bg-slate-900/90 border border-slate-700/50 rounded-2xl shadow-2xl p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-xl font-bold text-white">Vector Similarity Search</h2>
                            <span className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium flex items-center gap-1">
                                <Cube className="w-3 h-3" />
                                HNSW Index
                            </span>
                        </div>
                        <p className="text-slate-400 text-sm">
                            Finding biological neighbors for <span className="text-cyan-400 font-mono font-semibold">{targetGene}</span> using 3D vector embeddings (Expression, GC, Complexity).
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-3">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
                            <RefreshCw className="w-8 h-8 animate-spin text-violet-500" />
                            <p>Calculating Cosine Similarity...</p>
                        </div>
                    ) : (
                        recommendations.map((gene) => (
                            <div
                                key={gene._id}
                                className="group relative overflow-hidden p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/80 hover:border-violet-500/30 transition-all duration-300"
                            >
                                {/* Similarity Score Bar */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-500 to-cyan-500 opacity-60"></div>

                                <div className="flex justify-between items-center pl-3">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-bold text-white font-mono">{gene.gene_symbol}</span>
                                            <span className="px-2 py-0.5 bg-slate-700 rounded-md text-xs text-slate-300">
                                                {gene.metadata.chromosome}
                                            </span>
                                        </div>
                                        <div className="flex gap-4 mt-1 text-xs text-slate-400">
                                            <span>Expr: {gene.expression_score.toFixed(1)}</span>
                                            <span>GC: {gene.gc_content.toFixed(1)}%</span>
                                            <span>Biotype: {gene.metadata.biotype}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-1">
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold">
                                            <span>{(gene.similarity_score * 100).toFixed(1)}% Match</span>
                                        </div>
                                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Cosine Distance</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {!isLoading && recommendations.length === 0 && (
                        <div className="text-center p-8 text-slate-400">
                            No vectors found. Ensure database is seeded.
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                            Vector Embeddings (pgvector)
                        </span>
                        <span className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                            Hybrid Retrieval
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
