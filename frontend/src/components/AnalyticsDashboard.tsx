import { useState, useEffect } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Server, Database } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface SqlStat {
    chromosome: string;
    count: number;
    avg_length: number;
}

interface NosqlStat {
    range: string;
    count: number;
    bucket_start: number;
}

export function AnalyticsDashboard() {
    const [sqlData, setSqlData] = useState<SqlStat[]>([]);
    const [nosqlData, setNosqlData] = useState<NosqlStat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [sqlRes, nosqlRes] = await Promise.all([
                    axios.get(`${API_URL}/api/stats/sql`),
                    axios.get(`${API_URL}/api/stats/nosql`)
                ]);
                setSqlData(sqlRes.data);
                setNosqlData(nosqlRes.data);
            } catch (err) {
                console.error("Failed to load analytics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="text-center p-10">Loading Analytics...</div>

    return (
        <div className="space-y-8 fade-in">
            <div className="bg-slate-800/50 p-6 rounded-xl border border-blue-500/30">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Database className="text-blue-400" />
                    SQL Aggregation: Chromosome Distribution (OLAP)
                </h2>
                <p className="text-slate-400 mb-4 text-sm">
                    A complex SQL query computing counts and averages across thousands of rows.
                    Query: <code>GROUP BY chromosome HAVING count &gt; 0</code>
                </p>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sqlData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="chromosome" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                                itemStyle={{ color: '#e2e8f0' }}
                            />
                            <Legend />
                            <Bar dataKey="count" name="Gene Count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="avg_length" name="Avg Seq Length" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-xl border border-green-500/30">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Server className="text-green-400" />
                    NoSQL Aggregation: GC Content Histogram
                </h2>
                <p className="text-slate-400 mb-4 text-sm">
                    A MongoDB Aggregation Pipeline using <code>$bucket</code> to analyze sequence composition density.
                </p>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={nosqlData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="range" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                                itemStyle={{ color: '#e2e8f0' }}
                            />
                            <Area type="monotone" dataKey="count" name="Gene Frequency" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
