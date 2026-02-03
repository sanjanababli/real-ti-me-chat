import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useCallback, useEffect, useRef } from "react";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import ChatBubble from "./ChatBubble";

import { formatMessageTime } from "../lib/utils";
import { User } from "lucide-react";
import VideoCall from "./VideoCall";
import { useVideoCall } from "../hooks/useVideoCall";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    currentPage,
    totalPages,
    typingUsers,
    subscribeToTypingEvents,
    unsubscribeFromTypingEvents,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const {
    callStatus,
    incomingCall,
    isVideoEnabled,
    isAudioEnabled,
    callType,
    localVideoRef,
    remoteVideoRef,
    startCall,
    answerCall,
    rejectCall,
    endCall,
    toggleVideo,
    toggleAudio,
    localStream,
    remoteStream,
  } = useVideoCall();

  const isVideoCallOpen = callStatus !== "idle";

  // Load initial messages and subscribe
  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id, 1);
      subscribeToMessages();
      subscribeToTypingEvents();
    }
    return () => {
      unsubscribeFromMessages();
      unsubscribeFromTypingEvents();
    };
  }, [
    selectedUser?._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
    subscribeToTypingEvents,
    unsubscribeFromTypingEvents,
  ]);

  // Infinite scroll: load more on scroll to top
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    if (el.scrollTop < 50 && !isMessagesLoading && currentPage < totalPages) {
      getMessages(selectedUser._id, currentPage + 1);
    }
  }, [currentPage, totalPages, isMessagesLoading, selectedUser, getMessages]);

  // Attach scroll listener
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleVideoCall = () => {
    if (selectedUser) {
      startCall(selectedUser._id, "video");
    }
  };

  const handleAudioCall = () => {
    if (selectedUser) {
      startCall(selectedUser._id, "audio");
    }
  };

  const handleCloseVideoCall = () => {
    if (callStatus === "receiving") {
      rejectCall();
    } else {
      endCall();
    }
  };

  if (isMessagesLoading && currentPage === 1) {
    return (
      <div className="flex flex-col h-full w-full chat-container">
        <ChatHeader
          onVideoCall={handleVideoCall}
          onAudioCall={handleAudioCall}
        />
        <div className="flex-1 overflow-auto p-6">
          <MessageSkeleton />
        </div>
        <MessageInput />
      </div>
    );
  }

  const isSelectedUserTyping = typingUsers.includes(selectedUser?._id);

  return (
    <div className="flex flex-col h-full w-full chat-container">
      <ChatHeader onVideoCall={handleVideoCall} onAudioCall={handleAudioCall} />

      <div
        className="flex-1 overflow-y-auto p-6 space-y-1"
        ref={scrollContainerRef}
      >
        {currentPage < totalPages && (
          <div className="text-center py-2">
            <button
              onClick={() => getMessages(selectedUser._id, currentPage + 1)}
              className="text-sm text-primary hover:underline"
              disabled={isMessagesLoading}
            >
              {isMessagesLoading ? "Loading..." : "Load more messages"}
            </button>
          </div>
        )}

        {messages.map((message, index) => {
          const isOwn = message.senderId === authUser._id;
          const showAvatar =
            index === 0 ||
            messages[index - 1].senderId !== message.senderId ||
            new Date(message.createdAt).getTime() -
              new Date(messages[index - 1].createdAt).getTime() >
              300000;

          return (
            <div key={message._id} className="flex items-end gap-3 group">
              {!isOwn && (
                <div className="w-8 h-8 flex-shrink-0">
                  {showAvatar ? (
                    <div className="w-8 h-8 rounded-full bg-muted overflow-hidden border border-border-subtle">
                      {selectedUser.profilePic ? (
                        <img
                          src={selectedUser.profilePic}
                          alt={selectedUser.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-8 h-8"></div>
                  )}
                </div>
              )}

              <div
                className={`flex-1 ${isOwn ? "flex flex-col justify-end" : ""}`}
              >
                {showAvatar && (
                  <div
                    className={`text-xs text-text-muted mb-1 px-1 ${
                      isOwn ? "text-right" : ""
                    }`}
                  >
                    {formatMessageTime(message.createdAt)}
                  </div>
                )}

                <ChatBubble message={message} isOwn={isOwn} />

                {message.image && (
                  <div
                    className={`mt-2 ${
                      isOwn ? "flex justify-end" : "flex justify-start"
                    }`}
                  >
                    <div className="max-w-sm rounded-xl overflow-hidden shadow-sm border border-border-subtle">
                      <img
                        src={message.image}
                        alt="Attachment"
                        className="w-full h-auto"
                        onLoad={() =>
                          messageEndRef.current?.scrollIntoView({
                            behavior: "smooth",
                          })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              {isOwn && <div className="w-8 h-8 flex-shrink-0"></div>}
            </div>
          );
        })}

        <div ref={messageEndRef} />
      </div>

      <div className="border-t border-border-subtle bg-card p-4">
        <div className="h-5 text-sm text-text-muted italic">
          {isSelectedUserTyping && `${selectedUser.fullName} is typing...`}
        </div>
        <MessageInput />
      </div>

      <VideoCall
        isOpen={isVideoCallOpen}
        onClose={handleCloseVideoCall}
        callStatus={callStatus}
        incomingCall={incomingCall}
        callType={callType}
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        isVideoEnabled={isVideoEnabled}
        isAudioEnabled={isAudioEnabled}
        answerCall={answerCall}
        rejectCall={rejectCall}
        toggleVideo={toggleVideo}
        toggleAudio={toggleAudio}
        localStream={localStream}
        remoteStream={remoteStream}
      />
    </div>
  );
};

export default ChatContainer;
