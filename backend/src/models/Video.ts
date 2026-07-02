import mongoose, { Document, Schema } from 'mongoose';

export interface IVideo extends Document {
  title: string;
  description: string;
  url: string;
  filename: string;
  mimetype: string;
  size: number;
  createdAt: Date;
}

const VideoSchema = new Schema<IVideo>({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  url: { type: String, required: true },
  filename: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model<IVideo>('Video', VideoSchema);
