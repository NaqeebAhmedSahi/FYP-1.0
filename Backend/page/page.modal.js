import mongoose from 'mongoose';
const { Schema } = mongoose;

const PageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 25,
    },
    slug: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    websiteId: {
      type: Schema.Types.ObjectId,
      ref: 'Website',
      required: true,
    },
    status: {
      type: String,
      enum: ['new', 'existing'],
      default: 'new',
    },
    customPrompt: String,
    content: {  // Add this new field
      type: Object,
      default: null
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Page', PageSchema);