import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage extends Document {
    senderName: string;
    role: 'teacher' | 'student';
    text: string;
    createdAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
    {
        senderName: { type: String, required: true },
        role: { type: String, enum: ['teacher', 'student'], required: true },
        text: { type: String, required: true },
    },
    { timestamps: true }
);

const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);

export default ChatMessage;
