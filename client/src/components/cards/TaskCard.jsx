import React from 'react';
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';
import { formatDate } from '../../utils/formatters.js';

export const TaskCard = ({ task, onToggleStatus, onEdit, onDelete }) => {
  const isCompleted = task.status === 'completed';

  const priorityStyles = {
    urgent: 'bg-red-50 text-red-700 border-red-200',
    high: 'bg-amber-50 text-amber-700 border-amber-200',
    medium: 'bg-blue-50 text-blue-700 border-blue-200',
    low: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  return (
    <div className={`flex items-start justify-between p-4 bg-white rounded-xl border transition-all ${
      isCompleted ? 'border-emerald-200/60 bg-emerald-50/20 opacity-80' : 'border-burgundy/5 shadow-soft hover:shadow-md'
    }`}>
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <button
          type="button"
          onClick={() => onToggleStatus(task)}
          className="mt-0.5 text-mutedGray hover:text-emerald-600 transition-colors shrink-0"
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
          ) : (
            <Circle className="w-5 h-5 hover:stroke-burgundy" />
          )}
        </button>

        <div className="min-w-0">
          <h4 className={`text-sm font-medium text-charcoal truncate ${isCompleted ? 'line-through text-mutedGray' : ''}`}>
            {task.title}
          </h4>
          {task.description && (
            <p className="text-xs text-mutedGray mt-0.5 line-clamp-1">{task.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px]">
            <span className={`px-2 py-0.5 rounded-full border capitalize font-medium ${priorityStyles[task.priority] || priorityStyles.medium}`}>
              {task.priority}
            </span>
            <span className="capitalize text-mutedGray bg-ivory-200 px-2 py-0.5 rounded-full">
              {task.category}
            </span>
            {task.dueDate && (
              <span className="flex items-center gap-1 text-mutedGray">
                <Clock className="w-3 h-3 text-rose" />
                {formatDate(task.dueDate)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-4">
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="text-xs text-mutedGray hover:text-charcoal"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
