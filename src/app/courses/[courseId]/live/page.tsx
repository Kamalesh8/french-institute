"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import MainLayout from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getCourseById } from "@/lib/services/course-service";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import {
  FaVideo,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideoSlash,
  FaDesktop,
  FaComment,
  FaUsers,
  FaPhone,
  FaCog,
  FaSignOutAlt,
  FaPaperPlane,
  FaHandPaper,
  FaChalkboardTeacher,
  FaExclamationTriangle,
  FaCaretRight,
  FaUserCircle
} from "react-icons/fa";

export default function LiveSessionPage({ params }: { params: { courseId: string } }) {
  const { courseId } = params;
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [screenShareEnabled, setScreenShareEnabled] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [handRaised, setHandRaised] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "failed"
  >("connecting");
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideosRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    // Fetch course data
    const fetchCourseData = async () => {
      try {
        const courseData = await getCourseById(courseId);
        setCourse(courseData);

        // Simulate connection process
        setTimeout(() => {
          setConnectionStatus("connected");
          simulateParticipants();
          setupLocalVideo();
        }, 2000);
      } catch (error) {
        console.error("Error fetching course:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load course data. Please try again later.",
        });
        setConnectionStatus("failed");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();

    // Setup chat polling
    const chatInterval = setInterval(() => {
      if (connectionStatus === "connected") {
        simulateNewChatMessage();
      }
    }, 10000);

    // Cleanup function
    return () => {
      clearInterval(chatInterval);
    };
  }, [courseId, router, toast, user, connectionStatus]);

  // Scroll chat to bottom whenever new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const setupLocalVideo = () => {
    // This would use the actual WebRTC API in a real implementation
    // For this demo, we'll just show a placeholder
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Draw a colored rectangle as placeholder for local video
        ctx.fillStyle = "#6166DC";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw user initial or avatar
        ctx.fillStyle = "white";
        ctx.font = "bold 120px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const initial = user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U";
        ctx.fillText(initial.toUpperCase(), canvas.width / 2, canvas.height / 2);

        // Convert canvas to video stream
        const stream = canvas.captureStream();
        localVideoRef.current.srcObject = stream;
      }
    }
  };

  const simulateParticipants = () => {
    // Simulate other participants joining
    const mockParticipants = [
      {
        id: "instructor-1",
        name: "Sophie Laurent",
        role: "Instructor",
        audioEnabled: true,
        videoEnabled: true,
        isInstructor: true
      },
      {
        id: "student-1",
        name: "Emma Johnson",
        role: "Student",
        audioEnabled: true,
        videoEnabled: true,
        isInstructor: false
      },
      {
        id: "student-2",
        name: "James Wilson",
        role: "Student",
        audioEnabled: false,
        videoEnabled: true,
        isInstructor: false
      },
      {
        id: "student-3",
        name: "Maria Garcia",
        role: "Student",
        audioEnabled: true,
        videoEnabled: false,
        isInstructor: false
      }
    ];
    setParticipants(mockParticipants);

    // Simulate welcome message
    setChatMessages([
      {
        id: "system-1",
        sender: "System",
        message: "Welcome to the live session! Please be respectful of others.",
        timestamp: new Date().toISOString(),
        isSystem: true
      },
      {
        id: "instructor-1",
        sender: "Sophie Laurent",
        message: "Bonjour tout le monde! Welcome to our French lesson. We'll start in a few minutes when everyone joins.",
        timestamp: new Date().toISOString(),
        isInstructor: true
      }
    ]);
  };

  const simulateNewChatMessage = () => {
    // Randomly decide whether to add a new message
    if (Math.random() > 0.7) {
      const senders = [
        { id: "instructor-1", name: "Sophie Laurent", isInstructor: true },
        { id: "student-1", name: "Emma Johnson", isInstructor: false },
        { id: "student-2", name: "James Wilson", isInstructor: false },
        { id: "student-3", name: "Maria Garcia", isInstructor: false }
      ];
      const messages = [
        "Bonjour! Comment ça va?",
        "Je ne comprends pas cette question.",
        "Pouvez-vous répéter, s'il vous plaît?",
        "Merci beaucoup!",
        "Est-ce que vous pouvez expliquer encore une fois?",
        "C'est très intéressant!",
        "Je suis désolé, je suis un peu en retard.",
        "Quelle est la prononciation correcte?"
      ];

      const randomSender = senders[Math.floor(Math.random() * senders.length)];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];

      setChatMessages([
        ...chatMessages,
        {
          id: `msg-${Date.now()}`,
          sender: randomSender.name,
          message: randomMessage,
          timestamp: new Date().toISOString(),
          isInstructor: randomSender.isInstructor
        }
      ]);
    }
  };

  const toggleVideo = () => {
    setVideoEnabled(!videoEnabled);
    // In a real implementation, this would enable/disable the video track
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    // In a real implementation, this would enable/disable the audio track
  };

  const toggleScreenShare = () => {
    setScreenShareEnabled(!screenShareEnabled);
    // In a real implementation, this would start/stop screen sharing

    if (!screenShareEnabled) {
      toast({
        title: "Screen sharing",
        description: "Screen sharing would start in a real implementation.",
      });
    } else {
      toast({
        title: "Screen sharing stopped",
        description: "Screen sharing would stop in a real implementation.",
      });
    }
  };

  const toggleHandRaise = () => {
    setHandRaised(!handRaised);

    toast({
      title: handRaised ? "Hand lowered" : "Hand raised",
      description: handRaised
        ? "The instructor has been notified that you've lowered your hand."
        : "The instructor has been notified that you've raised your hand.",
    });
  };

  const sendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    setChatMessages([
      ...chatMessages,
      {
        id: `msg-${Date.now()}`,
        sender: user?.displayName || user?.email || "You",
        message: chatMessage.trim(),
        timestamp: new Date().toISOString(),
        isUser: true
      }
    ]);
    setChatMessage("");
  };

  const leaveSession = () => {
    toast({
      title: "Leaving session",
      description: "You are leaving the live session.",
    });
    router.push(`/courses/${courseId}`);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-12 min-h-[60vh] flex justify-center items-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">Connecting to live session...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!course) {
    return (
      <MainLayout>
        <div className="container py-12">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Course Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">The course you're looking for doesn't exist or has been removed.</p>
              <Button asChild>
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (connectionStatus === "failed") {
    return (
      <MainLayout>
        <div className="container py-12">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FaExclamationTriangle className="text-amber-500" />
                Connection Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Unable to join the live session. This could be due to network issues or the session may have ended.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
                <Button asChild>
                  <Link href={`/courses/${courseId}`}>Back to Course</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/courses/${courseId}`} className="text-primary hover:underline flex items-center gap-1">
              <FaCaretRight className="rotate-180" />
              Back to Course
            </Link>
            <div className="h-6 border-l border-slate-300 dark:border-slate-600"></div>
            <div>
              <h1 className="font-bold">{course.title}</h1>
              <p className="text-xs text-muted-foreground">Live Session</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live
            </div>
            <Button variant="destructive" size="sm" onClick={leaveSession} className="gap-1">
              <FaSignOutAlt />
              Leave
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Video Grid */}
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Instructor */}
            {participants.filter(p => p.isInstructor).map(participant => (
              <div
                key={participant.id}
                className="rounded-lg overflow-hidden shadow-md bg-slate-800 aspect-video relative"
              >
                <div className="absolute inset-0 bg-primary flex items-center justify-center text-white text-5xl font-bold">
                  {participant.name.charAt(0).toUpperCase()}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                      {participant.name}
                    </span>
                    <span className="px-1.5 py-0.5 bg-primary/90 text-white text-xs rounded">
                      Instructor
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {!participant.audioEnabled && <FaMicrophoneSlash size={12} />}
                    {!participant.videoEnabled && <FaVideoSlash size={12} />}
                  </div>
                </div>
              </div>
            ))}

            {/* Local User */}
            <div className="rounded-lg overflow-hidden shadow-md bg-slate-800 aspect-video relative">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover ${!videoEnabled ? 'hidden' : ''}`}
              />
              {!videoEnabled && (
                <div className="absolute inset-0 bg-slate-700 flex items-center justify-center text-white text-5xl font-bold">
                  {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "Y"}
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                    {user?.displayName || user?.email || "You"} (You)
                  </span>
                </div>
                <div className="flex gap-1">
                  {!audioEnabled && <FaMicrophoneSlash size={12} />}
                  {!videoEnabled && <FaVideoSlash size={12} />}
                </div>
              </div>
            </div>

            {/* Other Students */}
            {participants.filter(p => !p.isInstructor).map(participant => (
              <div
                key={participant.id}
                className="rounded-lg overflow-hidden shadow-md bg-slate-800 aspect-video relative"
              >
                <div className="absolute inset-0 bg-slate-700 flex items-center justify-center text-white text-5xl font-bold">
                  {participant.name.charAt(0).toUpperCase()}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                      {participant.name}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {!participant.audioEnabled && <FaMicrophoneSlash size={12} />}
                    {!participant.videoEnabled && <FaVideoSlash size={12} />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-full md:w-80 xl:w-96 bg-white dark:bg-slate-800 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700 flex flex-col">
          <Tabs defaultValue="chat" className="flex-1 flex flex-col">
            <TabsList className="justify-center p-2 bg-slate-100 dark:bg-slate-900/50">
              <TabsTrigger value="chat" className="flex-1">Chat</TabsTrigger>
              <TabsTrigger value="participants" className="flex-1">Participants</TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 flex flex-col p-0 data-[state=active]:flex">
              {/* Chat Messages */}
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-auto p-4 space-y-3"
              >
                {chatMessages.map((msg, index) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className={`text-sm font-medium ${msg.isInstructor ? 'text-primary' : ''}`}>
                        {msg.sender}
                        {msg.isInstructor && (
                          <span className="ml-1 px-1 py-0.5 bg-primary/10 text-primary text-xs rounded">
                            Instructor
                          </span>
                        )}
                      </span>
                    </div>
                    <div
                      className={`rounded-lg px-3 py-2 max-w-[85%] ${
                        msg.isSystem
                          ? 'bg-slate-200 dark:bg-slate-700 text-muted-foreground text-xs'
                          : msg.isUser
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 dark:bg-slate-700'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-slate-200 dark:border-slate-700">
                <form onSubmit={sendChatMessage} className="flex gap-2">
                  <Textarea
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="min-h-[40px] max-h-24 resize-none"
                  />
                  <Button type="submit" size="icon" disabled={!chatMessage.trim()}>
                    <FaPaperPlane />
                  </Button>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="participants" className="flex-1 overflow-auto p-4 data-[state=active]:block">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <FaChalkboardTeacher className="text-primary" />
                    Instructor
                  </h3>
                  <div className="space-y-2">
                    {participants.filter(p => p.isInstructor).map(participant => (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-slate-700"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                            {participant.name.charAt(0).toUpperCase()}
                          </div>
                          <span>{participant.name}</span>
                        </div>
                        <div className="flex gap-1">
                          {!participant.audioEnabled && <FaMicrophoneSlash className="text-slate-500" />}
                          {!participant.videoEnabled && <FaVideoSlash className="text-slate-500" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <FaUsers className="text-primary" />
                    Students ({participants.filter(p => !p.isInstructor).length + 1})
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-primary/10">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                          {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "Y"}
                        </div>
                        <span>{user?.displayName || user?.email || "You"} (You)</span>
                      </div>
                      <div className="flex gap-1">
                        {!audioEnabled && <FaMicrophoneSlash className="text-slate-500" />}
                        {!videoEnabled && <FaVideoSlash className="text-slate-500" />}
                        {handRaised && <FaHandPaper className="text-amber-500" />}
                      </div>
                    </div>

                    {participants.filter(p => !p.isInstructor).map(participant => (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-slate-700"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-500 flex items-center justify-center text-white font-bold">
                            {participant.name.charAt(0).toUpperCase()}
                          </div>
                          <span>{participant.name}</span>
                        </div>
                        <div className="flex gap-1">
                          {!participant.audioEnabled && <FaMicrophoneSlash className="text-slate-500" />}
                          {!participant.videoEnabled && <FaVideoSlash className="text-slate-500" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4">
        <div className="container mx-auto flex flex-wrap justify-center gap-3">
          <Button
            variant={audioEnabled ? "default" : "destructive"}
            size="icon"
            className="w-12 h-12 rounded-full"
            onClick={toggleAudio}
          >
            {audioEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
          </Button>
          <Button
            variant={videoEnabled ? "default" : "destructive"}
            size="icon"
            className="w-12 h-12 rounded-full"
            onClick={toggleVideo}
          >
            {videoEnabled ? <FaVideo /> : <FaVideoSlash />}
          </Button>
          <Button
            variant={screenShareEnabled ? "default" : "outline"}
            size="icon"
            className="w-12 h-12 rounded-full"
            onClick={toggleScreenShare}
          >
            <FaDesktop />
          </Button>
          <Button
            variant={handRaised ? "default" : "outline"}
            size="icon"
            className="w-12 h-12 rounded-full"
            onClick={toggleHandRaise}
          >
            <FaHandPaper />
          </Button>
          <div className="w-px h-12 bg-slate-200 dark:bg-slate-700 mx-2"></div>
          <Button
            variant="destructive"
            className="w-12 h-12 rounded-full"
            onClick={leaveSession}
          >
            <FaPhone className="rotate-135" />
          </Button>
        </div>
      </div>

      {/* Simulated connection warning */}
      <div className="fixed bottom-4 left-4 right-4 bg-amber-100 text-amber-800 p-3 rounded-lg shadow-lg md:left-auto md:right-4 md:max-w-md">
        <div className="flex items-start gap-3">
          <FaExclamationTriangle className="flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium mb-1">Demo Mode</h4>
            <p className="text-sm">
              This is a simulated video conference. In a real application, this would connect to a WebRTC service like Twilio Video, Agora, or Daily.co for live video streaming.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
