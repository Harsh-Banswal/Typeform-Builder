"use client";
import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BarChart2, List } from "lucide-react";

export default function ResponsesPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;
  
  const [form, setForm] = useState<any>(null);
  const [stats, setStats] = useState<any[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"summary" | "responses">("summary");

  useEffect(() => {
    fetchData();
  }, [formId]);

  const fetchData = async () => {
    try {
      const [formData, statsData, responsesData] = await Promise.all([
        api.get(`/forms/${formId}`),
        api.get(`/forms/${formId}/stats`),
        api.get(`/forms/${formId}/responses`)
      ]);
      setForm(formData);
      setStats(statsData);
      setResponses(responsesData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResponse = async (responseId: number) => {
    if (!confirm("Are you sure you want to delete this response?")) return;
    try {
      await api.delete(`/responses/${responseId}`);
      setResponses(responses.filter(r => r.id !== responseId));
      
      // Refresh stats
      const statsData = await api.get(`/forms/${formId}/stats`);
      setStats(statsData);
    } catch (e) {
      console.error(e);
      alert("Failed to delete response.");
    }
  };

  if (loading) return <div className="p-8 text-gray-500 font-sans">Loading results...</div>;
  if (!form) return <div className="p-8 text-red-500 font-sans">Form not found</div>;

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans text-gray-800">
      <header className="h-14 border-b bg-white flex items-center px-4 shrink-0">
        <button onClick={() => router.push('/dashboard')} className="p-2 hover:bg-gray-100 rounded text-gray-600 mr-4">
          <ArrowLeft size={18} />
        </button>
        <div className="font-semibold text-lg">{form.title} <span className="text-gray-400 font-normal ml-2">Results</span></div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar for toggling views */}
        <div className="w-64 bg-white border-r p-4 shrink-0">
          <button 
            onClick={() => setView("summary")}
            className={`w-full flex items-center p-3 rounded-lg text-sm font-medium mb-2 transition ${view === "summary" ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-600'}`}
          >
            <BarChart2 size={18} className="mr-3" /> Summary
          </button>
          <button 
            onClick={() => setView("responses")}
            className={`w-full flex items-center p-3 rounded-lg text-sm font-medium transition ${view === "responses" ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-600'}`}
          >
            <List size={18} className="mr-3" /> Responses
            <span className="ml-auto bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">{responses.length}</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            
            {view === "summary" && (
              <div className="space-y-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold">Summary</h2>
                  <div className="text-sm text-gray-500">{responses.length} total responses</div>
                </div>

                {stats.map((stat, idx) => (
                  <div key={stat.question_id} className="bg-white p-6 rounded-xl border shadow-sm">
                    <h3 className="font-medium text-lg mb-6">{idx + 1}. {stat.question_title}</h3>
                    
                    {stat.type === 'multiple_choice' || stat.type === 'dropdown' || stat.type === 'yes_no' ? (
                       <div className="space-y-4">
                         {Object.entries(stat.frequencies || {}).map(([option, count]: any) => {
                            const percentage = stat.response_count > 0 ? (count / stat.response_count) * 100 : 0;
                            return (
                              <div key={option}>
                                <div className="flex justify-between text-sm mb-1.5">
                                  <span className="text-gray-700 font-medium">{option}</span>
                                  <span className="text-gray-500 font-medium">{count} ({percentage.toFixed(1)}%)</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                                </div>
                              </div>
                            );
                         })}
                         {Object.keys(stat.frequencies || {}).length === 0 && (
                           <div className="text-gray-400 italic text-sm">No answers recorded yet.</div>
                         )}
                       </div>
                    ) : stat.type === 'number' || stat.type === 'rating' ? (
                       <div className="grid grid-cols-4 gap-4">
                         <div className="bg-gray-50 border p-4 rounded-xl text-center">
                           <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Responses</div>
                           <div className="text-2xl font-bold text-gray-800">{stat.response_count}</div>
                         </div>
                         <div className="bg-gray-50 border p-4 rounded-xl text-center">
                           <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Average</div>
                           <div className="text-2xl font-bold text-gray-800">{stat.average !== null ? stat.average.toFixed(2) : '-'}</div>
                         </div>
                         <div className="bg-gray-50 border p-4 rounded-xl text-center">
                           <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Min</div>
                           <div className="text-2xl font-bold text-gray-800">{stat.min !== null ? stat.min : '-'}</div>
                         </div>
                         <div className="bg-gray-50 border p-4 rounded-xl text-center">
                           <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Max</div>
                           <div className="text-2xl font-bold text-gray-800">{stat.max !== null ? stat.max : '-'}</div>
                         </div>
                       </div>
                    ) : (
                       <div className="bg-gray-50 border p-6 rounded-xl flex items-center justify-center space-x-3">
                         <div className="text-3xl font-bold text-gray-800">{stat.response_count}</div>
                         <div className="text-sm font-medium text-gray-500">responses recorded</div>
                       </div>
                    )}
                  </div>
                ))}
                {stats.length === 0 && (
                  <div className="text-center text-gray-500 py-16 bg-white rounded-xl border border-dashed">
                    No stats available yet. Check back when you have responses!
                  </div>
                )}
              </div>
            )}

            {view === "responses" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold">Individual Responses</h2>
                  <button
                    onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/forms/${formId}/export`, '_blank')}
                    className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Export CSV
                  </button>
                </div>
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">ID</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted At</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {responses.map((resp: any) => (
                        <tr key={resp.id} className="hover:bg-gray-50 transition group">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">#{resp.id}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(resp.submitted_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                             <span className="bg-green-50 border border-green-200 text-green-700 px-2.5 py-1 rounded-md text-xs font-semibold">Completed</span>
                          </td>
                          <td className="px-6 py-4 text-right flex justify-end gap-4 items-center">
                             <button 
                               onClick={() => router.push(`/dashboard/forms/${formId}/responses/${resp.id}`)}
                               className="text-blue-600 hover:text-blue-800 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                             >
                               View details
                             </button>
                             <button 
                               onClick={() => handleDeleteResponse(resp.id)}
                               className="text-red-600 hover:text-red-800 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                             >
                               Delete
                             </button>
                          </td>
                        </tr>
                      ))}
                      {responses.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                            No responses yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
