import { MessageSquare, Users, Sparkles } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 chat-container">
      <div className="max-w-md text-center space-y-6">
        <div className="relative">
          <div className="w-24 h-24 mx-auto bg-primary/5 rounded-3xl flex items-center justify-center mb-6">
            <div className="relative">
              <MessageSquare className="w-12 h-12 text-primary" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-primary" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-text-primary">
            Welcome to ChatVibe
          </h2>
          <p className="text-text-secondary leading-relaxed">
            Select a conversation from the sidebar to start messaging. Connect
            with your team and stay productive.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 mt-8 text-sm">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium text-text-primary">
                Real-time messaging
              </p>
              <p className="text-text-muted">
                Instant communication with your team
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium text-text-primary">
                Smart translations
              </p>
              <p className="text-text-muted">
                Communicate across languages seamlessly
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;
