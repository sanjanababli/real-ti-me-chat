import { useState } from "react";
import { Globe, RotateCcw } from "lucide-react";

export default function ChatBubble({
  message,
  isOwn,
}: {
  message: any;
  isOwn: boolean;
}) {
  const [isToggled, setIsToggled] = useState(false);

  // Determine default and alternate text
  let displayedText;
  let toggleAvailable = false;
  let toggleLabel = "";
  if (isOwn) {
    // Sent message: default to original text (sender's language)
    displayedText = message.text;
    if (message.translatedText) {
      toggleAvailable = true;
      toggleLabel = isToggled ? "Show Original" : "Show Translation";
      if (isToggled) {
        displayedText = message.translatedText; // Show translation sent to receiver
      }
    }
  } else {
    // Received message: default to translated text if available (receiver's language)
    if (message.translatedText) {
      displayedText = isToggled ? message.text : message.translatedText;
      toggleAvailable = true;
      toggleLabel = isToggled ? "Show Translation" : "Show Original";
    } else {
      displayedText = message.text; // No translation needed if languages match
    }
  }

  return (
    <div className={`chat ${isOwn ? "chat-end" : "chat-start"}`}>
      <div
        className={`
          max-w-xs lg:max-w-sm px-4 py-3 rounded-2xl
          ${isOwn ? "chat-bubble rounded-br-md" : "chat-bubble rounded-bl-md"}
          relative group
        `}
      >
        <div className="text-sm leading-relaxed">
          <p className={isOwn ? "text-white" : "text-text-primary"}>
            {displayedText}
          </p>

          {toggleAvailable && (
            <button
              className={`
                flex items-center gap-1 text-xs transition-colors mt-1
                ${
                  isOwn
                    ? "text-white/70 hover:text-white"
                    : "text-text-muted hover:text-primary"
                }
              `}
              onClick={() => setIsToggled(!isToggled)}
            >
              {toggleLabel === "Show Original" ? (
                <>
                  <RotateCcw className="w-3 h-3" />
                  <span className="text-[10px]">Show Original</span>
                </>
              ) : (
                <>
                  <Globe className="w-3 h-3" />
                  <span className="text-[10px]">Show Translation</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
