import React from 'react';
import { useNovaStore } from '../../store/useNovaStore';
import { Check, Clock, MessageSquare, Smartphone, Mail, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export const TasksPage: React.FC = () => {
  const { tasks, toggleTaskCompletion } = useNovaStore();

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleToggle = (taskId: string, wasCompleted: boolean) => {
    toggleTaskCompletion(taskId);
    if (!wasCompleted) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#2F6BFF', '#1EC7A0', '#F59E0B'],
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#0B0B0C] tracking-tight">
            Today's tasks checklist
          </h1>
          <p className="text-sm text-[#6E6E73] mt-0.5">
            Step-by-step action queue. Complete daily workflows in less than 15 minutes.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-white px-3.5 py-1.5 rounded-full border border-black/[0.08] shadow-xs">
          <span className="font-semibold text-[#0B0B0C] tabular-nums">{completedCount} of {totalCount} completed</span>
        </div>
      </div>

      {/* Progress Bar Card */}
      <div className="rounded-[28px] bg-white border border-black/[0.08] p-6 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-[#0B0B0C]">Daily task progress</span>
          <span className="font-bold text-[#2F6BFF] tabular-nums">{progressPct}%</span>
        </div>
        <div className="w-full bg-[#F1F1F2] rounded-full h-3 overflow-hidden">
          <div
            className="h-3 rounded-full bg-[#1EC0FF] transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {progressPct === 100 && (
          <div className="mt-4 p-3 rounded-[14px] bg-[#22C55E]/10 text-[#16A34A] text-xs font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>All tasks completed for today! Chai & Co patrons are engaged.</span>
          </div>
        )}
      </div>

      {/* Checklist items */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => handleToggle(task.id, task.completed)}
            className={`rounded-[24px] bg-white border p-5 flex items-center justify-between gap-4 transition-all cursor-pointer shadow-xs hover:border-black/[0.18] ${
              task.completed ? 'border-[#22C55E]/40 bg-[#F0FDF4]/30' : 'border-black/[0.08]'
            }`}
          >
            <div className="flex items-center gap-4 min-w-0">
              {/* Checkbox */}
              <div
                className={`w-6 h-6 rounded-[8px] flex items-center justify-center shrink-0 transition-all ${
                  task.completed
                    ? 'bg-[#22C55E] text-white shadow-xs'
                    : 'border border-black/[0.2] bg-white'
                }`}
              >
                {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>

              <div>
                <h2
                  className={`text-sm font-semibold leading-snug transition-all ${
                    task.completed ? 'line-through text-[#9A9A9E]' : 'text-[#0B0B0C]'
                  }`}
                >
                  {task.title}
                </h2>
                <div className="flex items-center gap-3 text-xs text-[#6E6E73] mt-1">
                  <span>Target: <b className="text-[#3A3A3D]">{task.segmentName}</b></span>
                  <span>&bull;</span>
                  <span>{task.customerCount} patrons</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Channel icon */}
              <div className="w-8 h-8 rounded-full bg-[#F6F6F7] flex items-center justify-center text-[#6E6E73]">
                {task.channel === 'whatsapp' && <MessageSquare className="w-4 h-4 text-[#22C55E]" />}
                {task.channel === 'sms' && <Smartphone className="w-4 h-4 text-[#2F6BFF]" />}
                {task.channel === 'email' && <Mail className="w-4 h-4 text-[#F59E0B]" />}
              </div>

              {/* Time */}
              <div className="hidden sm:flex items-center gap-1 text-xs text-[#6E6E73] tabular-nums">
                <Clock className="w-3.5 h-3.5" />
                <span>{task.dueTime}</span>
              </div>

              {/* Status pill */}
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  task.completed
                    ? 'bg-[#22C55E]/15 text-[#16A34A]'
                    : 'bg-[#F1F1F2] text-[#6E6E73]'
                }`}
              >
                {task.completed ? 'Completed' : 'Pending'}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
