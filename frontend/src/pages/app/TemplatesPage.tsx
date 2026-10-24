import React, { useState } from 'react';
import { useNovaStore } from '../../store/useNovaStore';
import { Copy, Edit3, Check, MessageSquare, Smartphone, Mail, Sparkles } from 'lucide-react';

export const TemplatesPage: React.FC = () => {
  const { templates, updateTemplate } = useNovaStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const startEdit = (id: string, currentContent: string) => {
    setEditingId(id);
    setEditContent(currentContent);
  };

  const saveEdit = (id: string) => {
    updateTemplate(id, editContent);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#0B0B0C] tracking-tight">
            Message templates
          </h1>
          <p className="text-sm text-[#6E6E73] mt-0.5">
            Pre-approved outreach templates with privacy-safe personal variables.
          </p>
        </div>

        <div className="text-xs bg-white px-3.5 py-1.5 rounded-full border border-black/[0.08] shadow-xs flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#2F6BFF]" />
          <span>Active templates: <b className="text-[#0B0B0C] tabular-nums">{templates.length}</b></span>
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((tmpl) => (
          <div
            key={tmpl.id}
            className="rounded-[28px] bg-white border border-black/[0.08] p-6 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)] transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F1F1F2] text-[#3A3A3D]">
                  {tmpl.goal}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-[#6E6E73]">
                  {tmpl.channel === 'whatsapp' && <MessageSquare className="w-4 h-4 text-[#22C55E]" />}
                  {tmpl.channel === 'sms' && <Smartphone className="w-4 h-4 text-[#2F6BFF]" />}
                  {tmpl.channel === 'email' && <Mail className="w-4 h-4 text-[#F59E0B]" />}
                  <span className="capitalize font-medium">{tmpl.channel}</span>
                </div>
              </div>

              <h2 className="text-base font-semibold text-[#0B0B0C] mb-3">
                {tmpl.title}
              </h2>

              {editingId === tmpl.id ? (
                <div className="space-y-3 mb-4">
                  <textarea
                    rows={5}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-3 rounded-[14px] bg-[#F9F9FA] border border-black/[0.1] text-xs text-[#0B0B0C] outline-none"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 rounded-[8px] bg-[#F1F1F2] text-xs font-medium cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => saveEdit(tmpl.id)}
                      className="px-3 py-1.5 rounded-[8px] bg-[#2F6BFF] text-white text-xs font-medium cursor-pointer"
                    >
                      Save changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-[18px] bg-[#F9F9FA] border border-black/[0.04] text-xs text-[#3A3A3D] leading-relaxed mb-4 min-h-[100px]">
                  {tmpl.content}
                </div>
              )}

              <div className="flex flex-wrap gap-1.5 mb-4">
                {tmpl.variables.map((v) => (
                  <span
                    key={v}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white border border-black/[0.08] text-[#2F6BFF]"
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between">
              <button
                onClick={() => startEdit(tmpl.id, tmpl.content)}
                className="inline-flex items-center gap-1.5 text-xs text-[#6E6E73] hover:text-[#0B0B0C] font-medium cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit text</span>
              </button>

              <button
                onClick={() => handleCopy(tmpl.id, tmpl.content)}
                className="h-8 px-3 rounded-[8px] bg-[#0B0B0C] hover:bg-[#2F6BFF] text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedId === tmpl.id ? (
                  <>
                    <Check className="w-3 h-3 text-[#22C55E]" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
