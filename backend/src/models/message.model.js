import mongoose, { Mongoose } from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: String, ref: "User", required: true },
    receiverId: { type: String, ref: "User", required: true },
    text: { type: String },
    image: { type: String },
    detectedLang: { type: String, default: null },
    targetLang: { type: String, default: null },
    translatedText: { type: String, default: null },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
