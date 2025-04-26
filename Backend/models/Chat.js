import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    messages: [
      {
        from: {
          type: String,
          enum: ['user', 'ai'],
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model('Chat', chatSchema);
