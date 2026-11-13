import React, { useState } from 'react';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import Input from '../common/Input.jsx';
import { expenseService } from '../../services/expense.service.js';
import toast from 'react-hot-toast';

export const CreateExpenseModal = ({ isOpen, onClose, planId, onCreated }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Venue');
  const [estimatedAmount, setEstimatedAmount] = useState('');
  const [actualAmount, setActualAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [status, setStatus] = useState('estimated');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsLoading(true);
      const res = await expenseService.createExpense(planId, {
        title,
        category,
        estimatedAmount: Number(estimatedAmount) || 0,
        actualAmount: Number(actualAmount) || 0,
        paidAmount: Number(paidAmount) || 0,
        status,
        notes,
      });

      toast.success('Budget item recorded!');
      if (onCreated) onCreated(res.data);
      onClose();
      setTitle('');
      setEstimatedAmount('');
      setActualAmount('');
      setPaidAmount('');
      setNotes('');
    } catch (err) {
      toast.error(err.message || 'Failed to save expense');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Wedding Expense" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Expense Title *"
          required
          placeholder="e.g. Wedding Cake & Dessert Table"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80">
              Category
            </label>
            <select
              className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-white border border-charcoal/15 text-charcoal focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/15"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {['Venue', 'Catering', 'Photography', 'Decor', 'Attire', 'Music', 'Stationery', 'Favors', 'General'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80">
              Payment Status
            </label>
            <select
              className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-white border border-charcoal/15 text-charcoal focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/15"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="estimated">Estimated Quote</option>
              <option value="deposit_paid">Deposit Paid</option>
              <option value="paid_in_full">Paid in Full</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Estimated ($) *"
            type="number"
            required
            placeholder="0"
            value={estimatedAmount}
            onChange={(e) => setEstimatedAmount(e.target.value)}
          />
          <Input
            label="Actual ($)"
            type="number"
            placeholder="0"
            value={actualAmount}
            onChange={(e) => setActualAmount(e.target.value)}
          />
          <Input
            label="Paid So Far ($)"
            type="number"
            placeholder="0"
            value={paidAmount}
            onChange={(e) => setPaidAmount(e.target.value)}
          />
        </div>

        <Input
          label="Notes (Optional)"
          placeholder="Payment schedule, contract terms, or vendor info"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-charcoal/5">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            Add Expense
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateExpenseModal;
