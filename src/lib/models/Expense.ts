import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExpense extends Document {
  expenseId: string;
  tripId: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  paidBy: string;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    expenseId: { type: String, required: true, unique: true, index: true },
    tripId: { type: String, required: true, index: true },
    category: { type: String, default: '' },
    description: { type: String, default: '' },
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    date: { type: String, default: '' },
    paidBy: { type: String, default: 'Me' },
  },
  { timestamps: false }
);

export const Expense: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);
