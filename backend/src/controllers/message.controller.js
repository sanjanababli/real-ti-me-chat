import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import translate from 'google-translate-api-x';

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getUsersForSidebar controller: ", error);
    res.status(500).json({ messgae: "Internal Serer Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;
    // read page & limit from query, default to page 1, 20 per page
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    // find total count for optional client-side UI
    const totalCount = await Message.countDocuments({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

// fetch paginated messages, sorted by createdAt descending (newest first)
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);


    const ordered = messages.reverse();

    res.status(200).json({
      data: ordered,
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error("Error in getMessages controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    // Upload image if present
    let imageUrl = null;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // Lookup sender and receiver for language preferences
    const [sender, receiver] = await Promise.all([
      User.findById(senderId),
      User.findById(receiverId),
    ]);

    const sourceLang = sender?.preferredLanguage || 'auto';
    const targetLang = receiver?.preferredLanguage || 'en';

    // Prepare new message document
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      detectedLang: sourceLang,
      targetLang,
    });

    // Translate if needed
    if (text && sourceLang !== targetLang) {
      try {
        const result = await translate(text, {
          from: sourceLang,
          to: targetLang,
          client: 'gtx',  // use gtx to reduce 403
        });
        newMessage.translatedText = result.text;
        newMessage.detectedLang = result.from?.language?.iso || sourceLang;
      } catch (err) {
        console.error('Translation error:', err);
        // fallback: store original text as translated
        newMessage.translatedText = text;
      }
    }

    await newMessage.save();
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('newMessage', newMessage);
    }

    return res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error in sendMessage controller:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
