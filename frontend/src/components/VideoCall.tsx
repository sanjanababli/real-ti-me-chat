import {
  Phone,
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  User,
} from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useEffect } from "react";

interface VideoCallProps {
  isOpen: boolean;
  onClose: () => void;
  callStatus: string;
  incomingCall: any;
  callType: string;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  answerCall: () => void;
  rejectCall: () => void;
  toggleVideo: () => void;
  toggleAudio: () => void;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
}

const VideoCall = ({
  isOpen,
  onClose,
  callStatus,
  incomingCall,
  callType,
  localVideoRef,
  remoteVideoRef,
  isVideoEnabled,
  isAudioEnabled,
  answerCall,
  rejectCall,
  toggleVideo,
  toggleAudio,
  localStream,
  remoteStream,
}: VideoCallProps) => {
  const { selectedUser } = useChatStore();

  console.log({ localVideoRef });
  console.log({ remoteVideoRef });

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, callStatus]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, callStatus]);

  if (!isOpen) return null;

  const renderCallInterface = () => {
    if (callStatus === "calling") {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center mb-4 mx-auto">
              {selectedUser?.profilePic ? (
                <img
                  src={selectedUser.profilePic}
                  alt={selectedUser.fullName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <h3 className="text-xl font-semibold">{selectedUser?.fullName}</h3>
            <p className="text-gray-400">Calling...</p>
          </div>

          <button
            onClick={onClose}
            className="w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors"
          >
            <PhoneOff className="w-6 h-6 text-white" />
          </button>
        </div>
      );
    }

    if (callStatus === "receiving" && incomingCall) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center mb-4 mx-auto">
              {selectedUser?.profilePic ? (
                <img
                  src={selectedUser.profilePic}
                  alt={selectedUser.fullName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <h3 className="text-xl font-semibold">{selectedUser?.fullName}</h3>
            <p className="text-gray-400">
              Incoming {incomingCall.callType} call...
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={rejectCall}
              className="w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors"
            >
              <PhoneOff className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={answerCall}
              className="w-16 h-16 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center transition-colors"
            >
              <Phone className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      );
    }

    if (callStatus === "in-call") {
      return (
        <div className="relative h-full bg-gray-900">
          {/* Remote video */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Local video */}
          {callType === "video" && (
            <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                draggable
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
            </div>
          )}

          {/* Call controls */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
            {callType === "video" && (
              <button
                onClick={toggleVideo}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  isVideoEnabled
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isVideoEnabled ? (
                  <Video className="w-5 h-5 text-white" />
                ) : (
                  <VideoOff className="w-5 h-5 text-white" />
                )}
              </button>
            )}

            <button
              onClick={toggleAudio}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isAudioEnabled
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {isAudioEnabled ? (
                <Mic className="w-5 h-5 text-white" />
              ) : (
                <MicOff className="w-5 h-5 text-white" />
              )}
            </button>

            <button
              onClick={onClose} // Triggers endCall via the parent
              className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors"
            >
              <PhoneOff className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* User info */}
          <div className="absolute top-4 left-4 text-white">
            <h3 className="text-lg font-semibold">{selectedUser?.fullName}</h3>
            <p className="text-sm text-gray-300">
              {callType === "video" ? "Video call" : "Audio call"}
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-full max-w-4xl h-full max-h-[600px] bg-gray-900 rounded-lg overflow-hidden relative">
        {/* Close button */}
        {/* <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button> */}

        {renderCallInterface()}
      </div>
    </div>
  );
};

export default VideoCall;
