import mongoose, { Schema, Document } from 'mongoose';

export interface IFriendship extends Document {
  requesterId: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
}

const friendshipSchema = new Schema<IFriendship>(
  {
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

friendshipSchema.index({ requesterId: 1, recipientId: 1 }, { unique: true });
friendshipSchema.index({ recipientId: 1, status: 1 });
friendshipSchema.index({ requesterId: 1, status: 1 });

export default mongoose.model<IFriendship>('Friendship', friendshipSchema);
