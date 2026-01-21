import { useState } from 'react'
import axios from 'axios'
import { Search, Database, Dna, LayoutDashboard, BarChart2, SearchCode } from 'lucide-react'
import clsx from 'clsx'
import { AnalyticsDashboard } from './components/AnalyticsDashboard'
import { GeneDetailModal } from './components/GeneDetailModal'
import { SimilarityModal } from './components/SimilarityModal'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ProjectMetadata {
    name: string;
    description: string;
    source: string;
    experiment_count: number;
}

interface GeneRecord {
    _id: string;
    experiment_id: number;
    gene_symbol: string;
    sequence_snippet: string;
    expression_score: number;
    experiment_name: string;
    source_tag: string;
    gc_content: number;
}

interface QueryResult {
    project_metadata: ProjectMetadata;
    gene_data: GeneRecord[];
    query_details: {
        threshold: number;
        match_count: number;
    };
}

function App() {
    const [activeTab, setActiveTab] = useState<'hybrid' | 'analytics'>('hybrid')

    // Search State
    const [projectId, setProjectId] = useState<string>('1')
    const [threshold, setThreshold] = useState<string>('70')
    const [data, setData] = useState<QueryResult | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Modal State
    const [selectedGene, setSelectedGene] = useState<any>(null)
    const [modalOpen, setModalOpen] = useState(false)

    // Similarity Search State
    const [simModalOpen, setSimModalOpen] = useState(false)
    const [simLoading, setSimLoading] = useState(false)
    const [simRecommendations, setSimRecommendations] = useState<any[]>([])
    const [targetGeneSim, setTargetGeneSim] = useState<string>('')

    const handleSimClick = async (e: React.MouseEvent, geneId: string, geneSymbol: string) => {
        e.stopPropagation()
        setTargetGeneSim(geneSymbol)
        setSimModalOpen(true)
        setSimLoading(true)
        setSimRecommendations([])

        try {
            const res = await axios.get(`${API_URL}/api/genes/recommend/${geneId}`)
            setSimRecommendations(res.data.recommendations)
        } catch (err) {
            console.error("Vector Search Failed", err)
        } finally {
            setSimLoading(false)
        }
    }

    const handleSearch = async () => {
        setLoading(true)
        setError(null)
        setData(null)
        try {
            const response = await axios.get(`${API_URL}/api/hybrid-query`, {
                params: {
                    project_id: projectId,
                    min_score: threshold
                }
            })
            setData(response.data)
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to fetch data. Ensure backend is running.")
        } finally {
            setLoading(false)
        }
    }

    const handleGeneClick = async (id: string) => {
        try {
            // Direct Fetch to demonstrate Cache
            const res = await axios.get(`${API_URL}/api/gene/${id}`);
            setSelectedGene(res.data);
            setModalOpen(true);
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className="min-h-screen bg-bio-dark text-slate-100 p-8 pb-20">
            {/* Header */}
            <header className="mb-8 text-center">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-2">
                    BioOF: Optimization-Centric Database System
                </h1>
                <p className="text-slate-400 text-lg">Hybrid Architecture [PostgreSQL + MongoDB + Redis]</p>
            </header>

            {/* Modern Tabs */}
            <div className="max-w-xl mx-auto mb-10 bg-slate-900/50 p-1 rounded-xl flex">
                <button
                    onClick={() => setActiveTab('hybrid')}
                    className={clsx(
                        "flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all",
                        activeTab === 'hybrid' ? "bg-cyan-500/20 text-cyan-400 shadow-sm ring-1 ring-cyan-500/50" : "text-slate-500 hover:text-slate-300"
                    )}
                >
                    <LayoutDashboard size={18} />
                    Hybrid Query
                </button>
                <button
                    onClick={() => setActiveTab('analytics')}
                    className={clsx(
                        "flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all",
                        activeTab === 'analytics' ? "bg-blue-500/20 text-blue-400 shadow-sm ring-1 ring-blue-500/50" : "text-slate-500 hover:text-slate-300"
                    )}
                >
                    <BarChart2 size={18} />
                    OLAP Analytics
                </button>
            </div>

            <div className="max-w-6xl mx-auto">
                {activeTab === 'analytics' ? (
                    <AnalyticsDashboard />
                ) : (
                    /* Hybrid Query View */
                    <>
                        <div className="max-w-4xl mx-auto mb-10 p-6 glass-panel rounded-2xl flex flex-col md:flex-row gap-6 items-end justify-between">
                            <div className="flex gap-6 w-full md:w-auto">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-slate-400">Project ID (SQL)</label>
                                    <input
                                        type="number"
                                        value={projectId}
                                        onChange={(e) => setProjectId(e.target.value)}
                                        className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 w-32"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-slate-400">Score Threshold (NoSQL)</label>
                                    <input
                                        type="number"
                                        value={threshold}
                                        onChange={(e) => setThreshold(e.target.value)}
                                        className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 w-32"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSearch}
                                disabled={loading}
                                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-lg font-bold shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 w-full md:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processing...' : (
                                    <>
                                        <Search size={20} />
                                        Run Hybrid Query
                                    </>
                                )}
                            </button>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-center mb-8">
                                {error}
                            </div>
                        )}

                        {data && (
                            <div className="fade-in">
                                {/* Metadata Card */}
                                <div className="grid md:grid-cols-3 gap-6 mb-8">
                                    <div className="col-span-2 p-6 glass-panel rounded-xl border-l-4 border-l-blue-500">
                                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                            <Database size={20} className="text-blue-400" />
                                            Project Metadata
                                            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded ml-2">{data.project_metadata.source}</span>
                                        </h3>
                                        <p className="text-slate-300 text-lg">{data.project_metadata.name}</p>
                                        <p className="text-slate-500">{data.project_metadata.description}</p>
                                    </div>
                                    <div className="p-6 glass-panel rounded-xl border-l-4 border-l-green-500 flex flex-col justify-center items-center text-center">
                                        <span className="text-sm text-slate-400 mb-1">Genes Found (Score &gt; {data.query_details.threshold})</span>
                                        <span className="text-4xl font-bold text-green-400">{data.query_details.match_count}</span>
                                    </div>
                                </div>

                                {/* Data Table */}
                                <div className="glass-panel rounded-xl overflow-hidden">
                                    <div className="p-4 bg-slate-900/50 border-b border-slate-700 flex justify-between items-center">
                                        <h3 className="font-bold flex items-center gap-2 text-green-400">
                                            <Dna size={20} />
                                            Genomic Data Results
                                            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded ml-2">[NoSQL]</span>
                                        </h3>
                                        <div className="text-xs text-slate-500">Click a row to view details & Cache status</div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm text-slate-300">
                                            <thead className="bg-slate-800 text-slate-400 uppercase tracking-wider">
                                                <tr>
                                                    <th className="p-4">Gene Symbol</th>
                                                    <th className="p-4">Experiment (Joined)</th>
                                                    <th className="p-4">Expression Score</th>
                                                    <th className="p-4">GC Content</th>
                                                    <th className="p-4">Sequence Snippet</th>
                                                    <th className="p-4 text-center">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-700/50">
                                                {data.gene_data.map((gene) => (
                                                    <tr
                                                        key={gene._id}
                                                        onClick={() => handleGeneClick(gene._id)}
                                                        className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                                                    >
                                                        <td className="p-4 font-bold text-cyan-300 group-hover:text-cyan-200">{gene.gene_symbol}</td>
                                                        <td className="p-4">
                                                            <span className="flex items-center gap-2">
                                                                {gene.experiment_name}
                                                                <span className="text-[10px] bg-slate-700 text-slate-400 px-1 rounded">SQL Joined</span>
                                                            </span>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                                                                        style={{ width: `${Math.min(gene.expression_score, 100)}%` }}
                                                                    />
                                                                </div>
                                                                <span className="font-mono">{gene.expression_score.toFixed(2)}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 font-mono text-slate-400">{gene.gc_content.toFixed(1)}%</td>
                                                        <td className="p-4 font-mono text-xs text-slate-500 truncate max-w-[200px]">
                                                            {gene.sequence_snippet}
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <button
                                                                onClick={(e) => handleSimClick(e, gene._id, gene.gene_symbol)}
                                                                className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all opacity-0 group-hover:opacity-100 flex items-center gap-1 mx-auto text-xs font-bold"
                                                                title="Find Similar Genes (Vector Search)"
                                                            >
                                                                <SearchCode size={14} />
                                                                Find Similar
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {modalOpen && (
                <GeneDetailModal
                    geneId={selectedGene?._id}
                    data={selectedGene}
                    onClose={() => setModalOpen(false)}
                />
            )}

            <SimilarityModal
                isOpen={simModalOpen}
                onClose={() => setSimModalOpen(false)}
                targetGene={targetGeneSim}
                recommendations={simRecommendations}
                isLoading={simLoading}
            />
        </div>
    )
}

export default App
