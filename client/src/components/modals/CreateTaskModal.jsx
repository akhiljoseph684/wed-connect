import React, { useState } from 'react';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import Input from '../common/Input.jsx';
import { taskService } from '../../services/task.service.js';
import toast from 'react-hot-toast';

export const CreateTaskModal = ({ isOpen, onClose, planId, onCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('venue');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsLoading(true);
      const res = await taskService.createTask(planId, {
        title,
        description,
        category,
        priority,
        dueDate: dueDate || undefined,
        estimatedCost: Number(estimatedCost) || 0,
      });

      toast.success('Wedding task added to checklist!');
      if (onCreated) onCreated(res.data);
      onClose();
      setTitle('');
      setDescription('');
      setDueDate('');
      setEstimatedCost('');
    } catch (err) {
      toast.error(err.message || 'Failed to add task');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Wedding Task" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Task Title *"
          required
          placeholder="e.g. Schedule floral centerpiece mock-up trial"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80">
            Description
          </label>
          <textarea
            rows={2}
            className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-white border border-charcoal/15 text-charcoal placeholder:text-mutedGray/60 focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/15 resize-none"
            placeholder="Add relevant notes, links, or contact numbers..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80">
              Category
            </label>
            <select
              className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-white border border-charcoal/15 text-charcoal focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/15 capitalize"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {['venue', 'attire', 'catering', 'photography', 'music', 'invitations', 'decor', 'other'].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80">
              Priority
            </label>
            <select
              className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-white border border-charcoal/15 text-charcoal focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/15 capitalize"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              {['low', 'medium', 'high', 'urgent'].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <Input
            label="Estimated Cost (USD)"
            type="number"
            placeholder="0"
            value={estimatedCost}
            onChange={(e) => setEstimatedCost(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-charcoal/5">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            Add Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTaskModal;
