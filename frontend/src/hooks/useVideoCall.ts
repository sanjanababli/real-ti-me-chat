import { useState, useRef, useEffect, useCallback } from "react";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

export const useVideoCall = () => {
  const { socket } = useAuthStore();
  const [callStatus, setCallStatus] = useState("idle");
  const [incomingCall, setIncomingCall] = useState(null);
  const [remoteUserId, setRemoteUserId] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callType, setCallType] = useState("video"); 
  const [localStream, setLocalStream] = useState(null); 
  const [remoteStream, setRemoteStream] = useState(null); 

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  // ICE servers configuration
  const iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:19302" },
    ],
  };

  const createPeerConnection = useCallback(() => {
    const peerConnection = new RTCPeerConnection(iceServers);

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socket && remoteUserId) {
        console.log("Sending ICE candidate:", event.candidate);
        socket.emit("ice-candidate", {
          to: remoteUserId,
          candidate: event.candidate,
        });
      }
    };

    peerConnection.ontrack = (event) => {
      // console.log("Received remote track:", event.streams[0]);
      // if (remoteVideoRef.current) {
      //   remoteVideoRef.current.srcObject = event.streams[0];
      // }
      console.log("Received remote track:", event.streams[0]);
      setRemoteStream(event.streams[0]);
    };

    peerConnection.onconnectionstatechange = () => {
      console.log("Connection state:", peerConnection.connectionState);
      if (
        peerConnection.connectionState === "disconnected" ||
        peerConnection.connectionState === "failed"
      ) {
        endCall();
      }
    };

    peerConnection.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", peerConnection.iceConnectionState);
      if (
        peerConnection.iceConnectionState === "disconnected" ||
        peerConnection.iceConnectionState === "failed"
      ) {
        endCall();
      }
    };

    return peerConnection;
  }, [socket, remoteUserId]);

  const startCall = useCallback(
    async (targetUserId, type = "video") => {
      try {
        console.log("Starting call to:", targetUserId, "type:", type);
        setCallStatus("calling");
        setRemoteUserId(targetUserId);
        setCallType(type);

        // Get user media
        const stream = await navigator.mediaDevices.getUserMedia({
          video: type === "video" ? { width: 640, height: 480 } : false,
          audio: true,
        });

        localStreamRef.current = stream;
        setLocalStream(stream);
        // if (localVideoRef.current) {
        //   localVideoRef.current.srcObject = stream;
        // }

        // Create peer connection
        peerConnectionRef.current = createPeerConnection();

        // Add local stream to peer connection
        stream.getTracks().forEach((track) => {
          peerConnectionRef.current.addTrack(track, stream);
        });

        // Create offer
        const offer = await peerConnectionRef.current.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: type === "video",
        });
        await peerConnectionRef.current.setLocalDescription(offer);

        // Send offer to target user
        socket.emit("call-user", {
          to: targetUserId,
          offer: offer,
          callType: type,
        });

        console.log("Call initiated successfully");
      } catch (error) {
        console.error("Error starting call:", error);
        toast.error(
          "Failed to start call. Please check your camera and microphone permissions."
        );
        setCallStatus("idle");
        setRemoteUserId(null);
      }
    },
    [socket, createPeerConnection]
  );

  const answerCall = useCallback(async () => {
    try {
      console.log("Answering call:", incomingCall);
      setCallStatus("in-call");

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video:
          incomingCall.callType === "video"
            ? { width: 640, height: 480 }
            : false,
        audio: true,
      });

      localStreamRef.current = stream;
      setLocalStream(stream);
      // if (localVideoRef.current) {
      //   localVideoRef.current.srcObject = stream;
      // }

      // Create peer connection
      peerConnectionRef.current = createPeerConnection();

      // Add local stream to peer connection
      stream.getTracks().forEach((track) => {
        peerConnectionRef.current.addTrack(track, stream);
      });

      // Set remote description
      await peerConnectionRef.current.setRemoteDescription(incomingCall.offer);

      // Create answer
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      // Send answer
      socket.emit("answer-call", {
        to: incomingCall.from,
        answer: answer,
      });

      setIncomingCall(null);
      console.log("Call answered successfully");
    } catch (error) {
      console.error("Error answering call:", error);
      toast.error(
        "Failed to answer call. Please check your camera and microphone permissions."
      );
      rejectCall();
    }
  }, [incomingCall, socket, createPeerConnection]);

  const rejectCall = useCallback(() => {
    console.log("Rejecting call:", incomingCall);
    if (incomingCall) {
      socket.emit("reject-call", {
        to: incomingCall.from,
      });
    }
    setIncomingCall(null);
    setCallStatus("idle");
    setRemoteUserId(null);
  }, [incomingCall, socket]);

  const endCall = useCallback(() => {
    console.log("Ending call");
    if (remoteUserId && callStatus !== "idle") {
      socket.emit("end-call", {
        to: remoteUserId,
      });
    }

    // Clean up local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log("Stopped track:", track.kind);
      });
      localStreamRef.current = null;
    }

    // Clean up peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Clean up video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setLocalStream(null);
    setRemoteStream(null);
    setCallStatus("idle");
    setRemoteUserId(null);
    setIncomingCall(null);
    setIsVideoEnabled(true);
    setIsAudioEnabled(true);
  }, [remoteUserId, callStatus, socket]);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        console.log("Video toggled:", videoTrack.enabled);
      }
    }
  }, []);

  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        console.log("Audio toggled:", audioTrack.enabled);
      }
    }
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = (data) => {
      console.log("Incoming call:", data);
      setIncomingCall(data);
      setCallStatus("receiving");
      setRemoteUserId(data.from);
      setCallType(data.callType);
      toast.success(`Incoming ${data.callType} call from user`);
    };

    const handleCallAnswered = async (data) => {
      console.log("Call answered:", data);
      try {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(data.answer);
          setCallStatus("in-call");
          console.log("Call established successfully");
        }
      } catch (error) {
        console.error("Error handling call answer:", error);
        endCall();
      }
    };

    const handleIceCandidate = async (data) => {
      console.log("Received ICE candidate:", data);
      try {
        if (peerConnectionRef.current && data.candidate) {
          await peerConnectionRef.current.addIceCandidate(data.candidate);
        }
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    };

    const handleCallEnded = () => {
      console.log("Call ended by remote user");
      endCall();
      toast.error("Call ended");
    };

    const handleCallRejected = () => {
      console.log("Call rejected by remote user");
      setCallStatus("idle");
      setRemoteUserId(null);
      endCall();
      toast.error("Call was rejected");
    };

    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-answered", handleCallAnswered);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("call-ended", handleCallEnded);
    socket.on("call-rejected", handleCallRejected);

    return () => {
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-answered", handleCallAnswered);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("call-ended", handleCallEnded);
      socket.off("call-rejected", handleCallRejected);
    };
  }, [socket, endCall]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, []);

  return {
    callStatus,
    incomingCall,
    remoteUserId,
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
  };
};
