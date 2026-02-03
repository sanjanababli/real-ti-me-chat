import { useState } from "react";
import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { Send, Cog, Languages, Palette, Eye, Save } from "lucide-react"; // ✨ Icons imported
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going?", isSent: false },
  {
    id: 2,
    content: "I'm doing great! Just working on some new features.",
    isSent: true,
  },
];

const Settings = () => {
  const { theme, setTheme } = useThemeStore();
  const { authUser } = useAuthStore();
  // debugger;
  const [lang, setLang] = useState(authUser?.preferredLanguage);
  const save = async () => {
    try {
      await axiosInstance.put("/auth/language", { lang });
      toast.success("Language saved");
    } catch (e) {
      console.log(e);
      toast.error("Something went wrong");
    }
    // maybe refresh user store…
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pt-20">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="glass rounded-3xl p-8 fade-scale-in">
          <div className="space-y-12">
            {/* --- Header --- */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Cog className="w-8 h-8 text-primary" /> {/* ⚙️ Icon */}
                <h1 className="text-3xl font-bold text-gradient-primary">
                  Settings
                </h1>
              </div>
              <p className="text-muted-foreground">
                Customize your ChatVibe experience
              </p>
            </div>

            {/* --- Language Settings --- */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Languages className="w-6 h-6 text-primary" /> {/* 🌐 Icon */}
                <h2 className="text-xl font-semibold text-gradient-primary">
                  Your Language
                </h2>
              </div>
              <div className="flex items-center gap-4 p-4 glass-subtle rounded-xl">
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className=" flex-1 text-sm h-10 px-3 rounded-lg border border-white/20"
                >
                  <option value="">Auto-detect Language</option>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="es">Spanish</option>
                  {/* …more */}
                </select>
                <button
                  onClick={save}
                  className="btn-glow h-10 px-4 rounded-lg flex items-center gap-2 cursor-pointer border"
                >
                  <Save size={16} /> {/* 💾 Icon */}
                  <span>Save</span>
                </button>
              </div>
            </div>

            {/* --- Theme Settings --- */}
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Palette className="w-6 h-6 text-primary" /> {/* 🎨 Icon */}
                  <h2 className="text-xl font-semibold text-gradient-primary">
                    Theme
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground pl-9">
                  Choose a theme for your chat interface
                </p>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {THEMES.map((t) => (
                  <button
                    key={t}
                    className={`
                      group flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200
                      ${
                        theme === t
                          ? "glass border-primary/50 shadow-glow"
                          : "glass-subtle hover:glass"
                      }
                    `}
                    onClick={() => setTheme(t)}
                  >
                    <div
                      className="relative h-10 w-full rounded-lg overflow-hidden border border-white/20"
                      data-theme={t}
                    >
                      <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                        <div className="rounded bg-primary"></div>
                        <div className="rounded bg-secondary"></div>
                        <div className="rounded bg-accent"></div>
                        <div className="rounded bg-neutral"></div>
                      </div>
                    </div>
                    <span className="text-xs font-medium truncate w-full text-center">
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </span>
                  </button>
                ))}
              </div>

              {/* --- Preview Section --- */}
              <div className="space-y-4 pt-6">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-primary" /> {/* 👁️ Icon */}
                  <h3 className="text-lg font-semibold text-gradient-primary">
                    Preview
                  </h3>
                </div>
                <div className=" rounded-2xl border border-white/20 overflow-hidden shadow-elegant">
                  {/* Mock Chat UI */}
                  <div className="p-6">
                    <div className="max-w-lg mx-auto">
                      <div className="rounded-2xl shadow-elegant overflow-hidden border border-white/20">
                        {/* Chat Header */}
                        <div className="px-4 py-3 border-b border-white/10 bg-gradient-to-r from-primary/5 to-secondary/5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-medium shadow-glow">
                              J
                            </div>
                            <div>
                              <h3 className="font-medium text-sm">John Doe</h3>
                              <p className="text-xs text-muted-foreground">
                                Online
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="p-4 space-y-4 min-h-[200px] max-h-[200px] overflow-y-auto">
                          {PREVIEW_MESSAGES.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${
                                message.isSent ? "justify-end" : "justify-start"
                              }`}
                            >
                              <div
                                className={`
                                  max-w-[80%] rounded-xl p-3 shadow-sm
                                  ${
                                    message.isSent
                                      ? "glass bg-gradient-primary text-white shadow-glow"
                                      : "glass border border-white/20"
                                  }
                                `}
                              >
                                <p className="text-sm">{message.content}</p>
                                <p
                                  className={`
                                    text-[10px] mt-1.5 opacity-70
                                  `}
                                >
                                  12:00 PM
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Chat Input */}
                        <div className="p-4 border-t border-white/10 bg-gradient-to-r from-primary/5 to-secondary/5">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              className="flex-1 text-sm h-10 px-3 rounded-lg border border-white/20 placeholder:text-muted-foreground"
                              placeholder="Type a message..."
                              value="This is a preview"
                              readOnly
                            />
                            <button className="btn-glow h-10 px-4 rounded-lg">
                              <Send size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
