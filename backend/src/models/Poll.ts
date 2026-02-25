import mongoose, { Schema, Document } from 'mongoose';

// Individual option inside a poll
export interface IOption {
    text: string;
    votes: number;
    isCorrect: boolean;
}

// The main Poll document
export interface IPoll extends Document {
    question: string;
    options: IOption[];
    durationSeconds: number;
    startedAt: Date | null;
    status: 'waiting' | 'active' | 'closed';
    createdAt: Date;
}

const OptionSchema = new Schema<IOption>({
    text: { type: String, required: true },
    votes: { type: Number, default: 0 },
    isCorrect: { type: Boolean, default: false },
});

const PollSchema = new Schema<IPoll>(
    {
        question: { type: String, required: true },
        options: { type: [OptionSchema], required: true },
        durationSeconds: { type: Number, required: true, default: 60 },
        startedAt: { type: Date, default: null },
        status: {
            type: String,
            enum: ['waiting', 'active', 'closed'],
            default: 'waiting',
        },
    },
    { timestamps: true }
);

const Poll = mongoose.model<IPoll>('Poll', PollSchema);

export default Poll;
