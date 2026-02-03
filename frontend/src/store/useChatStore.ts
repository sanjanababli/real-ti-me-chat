import { create } from "zustand";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export interface ChatUser {
  _id: string;
  fullName: string;
  email: string;
  profilePic?: string;
}

export interface ChatMessage {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MessagePayload {
  content: string;
}

interface ChatStore {
  messages: ChatMessage[];
  users: ChatUser[];
  selectedUser: ChatUser | null;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  currentPage: number;
  totalPages: number;
  typingUsers: string[];

  getUsers: () => Promise<void>;
  getMessages: (userId: string) => Promise<void>;
  sendMessage: (messageData: MessagePayload) => Promise<void>;
  subscribeToMessages: () => void;
  unsubscribeFromMessages: () => void;
  subscribeToTypingEvents: () => void; 
  unsubscribeFromTypingEvents: () => void; 
  setSelectedUser: (user: ChatUser) => void;
}


export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  currentPage: 1,
  totalPages: 1,
  typingUsers: [],

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const response = await axiosInstance.get<ChatUser[]>("/messages/users");
      set({ users: response.data });
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId: string, page = 1) => {
    set({ isMessagesLoading: true });
    try {
      const response = await axiosInstance.get<{
        data: ChatMessage[];
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
      }>(`/messages/${userId}?page=${page}&limit=20`);

      if (page === 1) {
        set({ messages: response.data.data });
      } else {
        set({ messages: [...response.data.data, ...get().messages] });
      }

      set({
        currentPage: response.data.page,
        totalPages: response.data.totalPages,
      });
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData: MessagePayload) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) {
      toast.error("No user selected");
      return;
    }

    try {
      const res = await axiosInstance.post<ChatMessage>(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
    } catch (error: any) {
      toast.error(error?.message || "Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", (newMessage: ChatMessage) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id;

      if (!isMessageSentFromSelectedUser) return;

      set({ messages: [...get().messages, newMessage] });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
  },

  subscribeToTypingEvents: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("typing", ({ senderId }) => {
      // Add user to typing list if not already present
      if (!get().typingUsers.includes(senderId)) {
        set((state) => ({ typingUsers: [...state.typingUsers, senderId] }));
      }
    });

    socket.on("stopTyping", ({ senderId }) => {
      // Remove user from typing list
      set((state) => ({
        typingUsers: state.typingUsers.filter((id) => id !== senderId),
      }));
    });
  },

  unsubscribeFromTypingEvents: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("typing");
    socket.off("stopTyping");
  },

  setSelectedUser: (user: ChatUser) => set({ selectedUser: user }),
}));
