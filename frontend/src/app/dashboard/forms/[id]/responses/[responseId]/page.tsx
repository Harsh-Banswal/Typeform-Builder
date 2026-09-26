"use client";
import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, User, Calendar, CheckCircle } from "lucide-react";

export default function ResponseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;
  const responseId = params.responseId as string;
  
  const [form, setForm] = useState<any>(null);
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [formId, responseId]);

  const fetchData = async () => {
    try {
      const [formData, responseData] = await Promise.all([
        api.get(`/forms/${formId}`),
        api.get(`/responses/${responseId}`)
      ]);
      setForm(formData);
      setResponse(responseData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-gray-500 font-sans">Loading details...</div>;
  if (!form || !response) return <div className="p-8 text-red-500 font-sans">Data not found</div>;

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans text-gray-800">
      <header className="h-14 border-b bg-white flex items-center px-4 shrink-0">
        <button onClick={() => router.push(`/dashboard/forms/${formId}/responses`)} className="p-2 hover:bg-gray-100 rounded text-gray-600 mr-4">
          <ArrowLeft size={18} />
        </button>
        <div className="font-semibold text-lg">{form.title} <span className="text-gray-400 font-normal mx-2">/</span> <span className="text-gray-600 font-normal">Response #{response.id}</span></div>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto">
          
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden mb-8">
             <div className="p-6 border-b bg-gray-50 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                   <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                     <User size={20} />
                   </div>
                   <div>
                     <h2 className="font-semibold text-gray-900">Anonymous Respondent</h2>
                     <div className="text-xs text-gray-500 flex items-center mt-1">
                       <Calendar size={12} className="mr-1" />
                       {new Date(response.submitted_at).toLocaleString()}
                     </div>
                   </div>
                </div>
                <div>
                   <span className="flex items-center text-xs font-semibold bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-full">
                     <CheckCircle size={14} className="mr-1.5" />
                     Completed
                   </span>
                </div>
             </div>
             <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <div className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wider">Response ID</div>
                     <div className="font-medium text-gray-800">#{response.id}</div>
                   </div>
                   <div>
                     <div className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wider">Questions Answered</div>
                     <div className="font-medium text-gray-800">{response.answers?.length || 0} / {form.questions?.length || 0}</div>
                   </div>
                </div>
             </div>
          </div>

          <h3 className="text-xl font-semibold mb-4">Answers</h3>
          <div className="space-y-6">
            {form.questions?.map((question: any, idx: number) => {
               const answer = response.answers?.find((a: any) => a.question_id === question.id);
               
               return (
                 <div key={question.id} className="bg-white p-6 rounded-xl border shadow-sm">
                   <h4 className="text-gray-900 font-medium mb-3">{idx + 1}. {question.title}</h4>
                   <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-800">
                     {answer && answer.value ? (
                       <span className="text-[15px]">{answer.value}</span>
                     ) : (
                       <span className="text-gray-400 italic text-sm">Skipped / No answer provided</span>
                     )}
                   </div>
                 </div>
               );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
