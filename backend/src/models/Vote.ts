import mongoose, { Schema, Document } from 'mongoose';

export interface IVote extends Document {
    pollId: mongoose.Types.ObjectId;
    studentIdentifier: string; // unique per browser tab (session ID)
    optionIndex: number;
    createdAt: Date;
}

const VoteSchema = new Schema<IVote>(
    {
        pollId: { type: Schema.Types.ObjectId, ref: 'Poll', required: true },
        studentIdentifier: { type: String, required: true },
        optionIndex: { type: Number, required: true },
    },
    { timestamps: true }
);

// This unique index prevents a student from voting twice on the same poll
VoteSchema.index({ pollId: 1, studentIdentifier: 1 }, { unique: true });

const Vote = mongoose.model<IVote>('Vote', VoteSchema);

export default Vote;
