"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [forms, setForms] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalId, setDeleteModalId] = useState<number | null>(null);
  const [renameModal, setRenameModal] = useState<{ id: number; title: string } | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchForms();
    // Close menu on outside click
    const handleClick = () => setMenuOpenId(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const fetchForms = async () => {
    try {
      const data = await api.get("/forms");
      setForms(data);
    } catch { toast.error("Failed to load forms"); }
  };

  const createForm = async () => {
    if (!newTitle.trim()) return;
    try {
      const data = await api.post("/forms", { title: newTitle.trim() });
      toast.success("Form created");
      setIsModalOpen(false);
      setNewTitle("");
      router.push(`/dashboard/forms/${data.id}/edit`);
    } catch { toast.error("Failed to create form"); }
  };

  const deleteForm = async () => {
    if (!deleteModalId) return;
    try {
      await api.delete(`/forms/${deleteModalId}`);
      toast.success("Form deleted");
      fetchForms();
    } catch { toast.error("Failed to delete"); }
    finally { setDeleteModalId(null); }
  };

  const duplicateForm = async (id: number) => {
    try {
      await api.post(`/forms/${id}/duplicate`);
      toast.success("Form duplicated");
      fetchForms();
    } catch { toast.error("Failed to duplicate"); }
  };

  const renameForm = async () => {
    if (!renameModal) return;
    try {
      await api.patch(`/forms/${renameModal.id}`, { title: renameModal.title });
      toast.success("Renamed");
      fetchForms();
    } catch { toast.error("Failed to rename"); }
    finally { setRenameModal(null); }
  };

  const togglePublish = async (id: number, status: string) => {
    try {
      if (status === "published") {
        await api.post(`/forms/${id}/unpublish`);
        toast.success("Unpublished");
      } else {
        await api.post(`/forms/${id}/publish`);
        toast.success("Published! Shareable link created.");
      }
      fetchForms();
    } catch { toast.error("Failed"); }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Toaster richColors />

      {/* Top nav bar */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-black rounded flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg>
          </div>
          <span className="font-semibold text-gray-900">Workspace</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{forms.length} form{forms.length !== 1 ? "s" : ""}</span>
          <button
            onClick={() => { setNewTitle(""); setIsModalOpen(true); }}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            New form
          </button>
        </div>
      </header>

      {/* Forms grid */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {forms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No forms yet</h2>
            <p className="text-gray-500 mb-6 text-sm">Create your first form to get started</p>
            <button
              onClick={() => { setNewTitle(""); setIsModalOpen(true); }}
              className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              + Create a form
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* New form card */}
            <button
              onClick={() => { setNewTitle(""); setIsModalOpen(true); }}
              className="group aspect-[4/3] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-gray-400 hover:bg-white transition-all text-gray-400 hover:text-gray-600"
            >
              <div className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
              </div>
              <span className="text-sm font-medium">New form</span>
            </button>

            {/* Form cards */}
            {forms.map(form => (
              <div
                key={form.id}
                className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
                onClick={() => router.push(`/dashboard/forms/${form.id}/edit`)}
              >
                {/* Card preview area */}
                <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6 relative">
                  <div className="w-full max-w-[160px] bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                    <div className="h-2 bg-gray-200 rounded mb-2 w-3/4"></div>
                    <div className="h-1.5 bg-gray-100 rounded mb-3 w-1/2"></div>
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-2 mb-1.5">
                        <div className="w-3 h-3 border border-gray-200 rounded-sm"></div>
                        <div className="h-1.5 bg-gray-100 rounded flex-1"></div>
                      </div>
                    ))}
                  </div>

                  {/* Status badge */}
                  <div className="absolute top-2 right-2">
                    {form.status === "published" ? (
                      <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border border-green-200">Live</span>
                    ) : (
                      <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border border-gray-200">Draft</span>
                    )}
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-t-xl" />
                </div>

                {/* Card footer */}
                <div className="p-3 border-t border-gray-100">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{form.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{form.response_count} response{form.response_count !== 1 ? "s" : ""}</p>
                    </div>

                    {/* Kebab menu */}
                    <div className="relative" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={e => { e.stopPropagation(); setMenuOpenId(menuOpenId === form.id ? null : form.id); }}
                        className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                      </button>

                      {menuOpenId === form.id && (
                        <div className="absolute right-0 top-7 w-44 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1 overflow-hidden">
                          <button onClick={() => { router.push(`/dashboard/forms/${form.id}/edit`); setMenuOpenId(null); }}
                            className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 text-left transition-colors">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            Edit
                          </button>
                          <button onClick={() => { setRenameModal({ id: form.id, title: form.title }); setMenuOpenId(null); }}
                            className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 text-left transition-colors">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                            Rename
                          </button>
                          <button onClick={() => { duplicateForm(form.id); setMenuOpenId(null); }}
                            className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 text-left transition-colors">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                            Duplicate
                          </button>
                          <button onClick={() => { togglePublish(form.id, form.status); setMenuOpenId(null); }}
                            className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 text-left transition-colors">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
                            {form.status === "published" ? "Unpublish" : "Publish"}
                          </button>
                          {form.slug && (
                            <a href={`/f/${form.slug}`} target="_blank"
                              className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 text-left transition-colors"
                              onClick={() => setMenuOpenId(null)}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                              Open form
                            </a>
                          )}
                          <div className="border-t border-gray-100 my-1" />
                          <button onClick={() => { setDeleteModalId(form.id); setMenuOpenId(null); }}
                            className="w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2.5 text-left transition-colors">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Create Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[440px] shadow-2xl overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Create a new form</h2>
              <p className="text-sm text-gray-500 mb-5">Give your form a name to get started.</p>
              <input
                type="text"
                autoFocus
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition-colors"
                placeholder="e.g. Customer Satisfaction Survey"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={e => e.key === "Enter" && createForm()}
              />
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Cancel
              </button>
              <button onClick={createForm} className="bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                Create form
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {deleteModalId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[400px] shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Delete form?</h2>
              <p className="text-sm text-gray-500">This will permanently delete the form and all its responses. This cannot be undone.</p>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
              <button onClick={() => setDeleteModalId(null)} className="px-5 py-2 text-sm text-gray-600 font-medium hover:text-gray-900 transition-colors">Cancel</button>
              <button onClick={deleteForm} className="bg-red-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Rename Modal ── */}
      {renameModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[400px] shadow-2xl overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Rename form</h2>
              <input
                type="text"
                autoFocus
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition-colors"
                value={renameModal.title}
                onChange={e => setRenameModal({ ...renameModal, title: e.target.value })}
                onKeyDown={e => e.key === "Enter" && renameForm()}
              />
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
              <button onClick={() => setRenameModal(null)} className="px-5 py-2 text-sm text-gray-600 font-medium transition-colors">Cancel</button>
              <button onClick={renameForm} className="bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
