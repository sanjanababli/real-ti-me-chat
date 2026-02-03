import ChatContainer from "../components/ChatContainer";
import NoChatSelected from "../components/NoChatSelected";
import Sidebar from "../components/Sidebar";
import { useChatStore } from "../store/useChatStore";

const Home = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-dvh bg-gradient-to-br from-background via-background to-muted/20 pt-16">
      <div className="flex items-center justify-center px-4 py-8">
        <div className="glass rounded-3xl w-full max-w-7xl h-[calc(100vh-8rem)] overflow-hidden">
          <div className="flex h-full">
            <Sidebar />
            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
