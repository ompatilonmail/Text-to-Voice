import React from "react";
import { MultiSpeakerLine, VoiceInfo } from "../types";
import { Plus, Trash2, Users, MessageSquare } from "lucide-react";

interface MultiSpeakerEditorProps {
  lines: MultiSpeakerLine[];
  onChangeLines: (lines: MultiSpeakerLine[]) => void;
  voices: VoiceInfo[];
  disabled?: boolean;
}

export const MultiSpeakerEditor: React.FC<MultiSpeakerEditorProps> = ({
  lines,
  onChangeLines,
  voices,
  disabled = false,
}) => {
  const handleAddLine = () => {
    const lastSpeaker = lines[lines.length - 1]?.speaker;
    const nextSpeaker = lastSpeaker === "Alex" ? "Taylor" : "Alex";
    const nextVoice = nextSpeaker === "Alex" ? "Puck" : "Kore";

    onChangeLines([
      ...lines,
      {
        id: "line-" + Date.now() + Math.random().toString(36).substr(2, 4),
        speaker: nextSpeaker,
        voice: nextVoice,
        text: "",
      },
    ]);
  };

  const handleUpdateLine = (id: string, field: "speaker" | "voice" | "text", value: string) => {
    onChangeLines(
      lines.map((line) => (line.id === id ? { ...line, [field]: value } : line))
    );
  };

  const handleRemoveLine = (id: string) => {
    if (lines.length <= 2) return; // Keep at least two turns for conversation
    onChangeLines(lines.filter((line) => line.id !== id));
  };

  const loadPresetDialogue = (lang: "en" | "hi" = "en") => {
    if (lang === "hi") {
      onChangeLines([
        {
          id: "line-1",
          speaker: "कबीर (Kabir)",
          voice: "Kabir",
          text: "नमस्ते आन्या! क्या तुम्हें लगता है कि आज की कृत्रिम बुद्धिमत्ता सचमुच इंसानों की तरह सहज और भावनात्मक आवाज़ निकाल सकती है?",
        },
        {
          id: "line-2",
          speaker: "आन्या (Aanya)",
          voice: "Aanya",
          text: "बिल्कुल कबीर! अब आवाज़ में सिर्फ शब्द नहीं, बल्कि ठहराव, भावना और अपनापन भी साफ महसूस होता है। बिल्कुल जैसे हम आमने-सामने बैठकर बात कर रहे हों।",
        },
        {
          id: "line-3",
          speaker: "कबीर (Kabir)",
          voice: "Kabir",
          text: "सच में, यह तकनीक कहानियों, पॉडकास्ट और सीखने के अनुभव को कितना खूबसूरत बना देती है!",
        },
        {
          id: "line-4",
          speaker: "आन्या (Aanya)",
          voice: "Aanya",
          text: "हाँ, और सबसे अच्छी बात यह है कि यह बिल्कुल इंसानी अंदाज़ में बोलती है, बिना किसी मशीनी रूखेपन के।",
        },
      ]);
      return;
    }

    onChangeLines([
      {
        id: "line-1",
        speaker: "Alex",
        voice: "Puck",
        text: "Welcome back to the podcast. Today we are looking at how artificial intelligence is transforming audio production.",
      },
      {
        id: "line-2",
        speaker: "Taylor",
        voice: "Kore",
        text: "It is incredible, Alex. What used to take hours in a recording booth can now be generated with astonishing emotion and cadence in seconds.",
      },
      {
        id: "line-3",
        speaker: "Alex",
        voice: "Puck",
        text: "Exactly. The natural inflections and breathing pauses make it virtually indistinguishable from a live studio recording.",
      },
      {
        id: "line-4",
        speaker: "Taylor",
        voice: "Kore",
        text: "Let's dive into some real-world examples and hear how different voice archetypes perform.",
      },
    ]);
  };

  return (
    <div id="multi-speaker-editor" className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
            Multi-Speaker Dialogue Turns
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            id="btn-load-hindi-dialogue"
            type="button"
            onClick={() => loadPresetDialogue("hi")}
            disabled={disabled}
            className="text-xs px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-medium cursor-pointer transition-colors border border-rose-500/30"
          >
            हिंदी संवाद नमूना (Hindi Dialogue)
          </button>
          <button
            id="btn-load-dialogue-preset"
            type="button"
            onClick={() => loadPresetDialogue("en")}
            disabled={disabled}
            className="text-xs px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-amber-400 hover:text-amber-300 font-medium cursor-pointer transition-colors"
          >
            English Sample
          </button>
        </div>
      </div>

      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {lines.map((line, idx) => (
          <div
            key={line.id}
            id={`dialogue-turn-${idx}`}
            className="p-3 rounded-xl bg-stone-900/80 border border-stone-800 space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={line.speaker}
                  disabled={disabled}
                  onChange={(e) => handleUpdateLine(line.id, "speaker", e.target.value)}
                  className="w-24 px-2 py-1 text-xs font-semibold rounded bg-stone-800 text-amber-400 border border-stone-700 focus:border-amber-500 outline-none"
                  placeholder="Speaker name"
                />
                <span className="text-xs text-stone-500">speaks with</span>
                <select
                  value={line.voice}
                  disabled={disabled}
                  onChange={(e) => handleUpdateLine(line.id, "voice", e.target.value)}
                  className="px-2 py-1 text-xs font-medium rounded bg-stone-800 text-stone-200 border border-stone-700 focus:border-amber-500 outline-none cursor-pointer"
                >
                  {voices.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.tone.split(",")[0]})
                    </option>
                  ))}
                </select>
              </div>

              {lines.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveLine(line.id)}
                  disabled={disabled}
                  className="text-stone-500 hover:text-rose-400 p-1 cursor-pointer transition-colors"
                  title="Remove turn"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <textarea
              value={line.text}
              disabled={disabled}
              rows={2}
              onChange={(e) => handleUpdateLine(line.id, "text", e.target.value)}
              placeholder={`What should ${line.speaker} say?`}
              className="w-full text-xs p-2 rounded-lg bg-stone-950 border border-stone-800 text-stone-200 placeholder-stone-600 focus:border-amber-500 outline-none resize-none"
            />
          </div>
        ))}
      </div>

      <button
        id="btn-add-dialogue-turn"
        type="button"
        onClick={handleAddLine}
        disabled={disabled}
        className="w-full py-2 px-3 rounded-xl border border-dashed border-stone-700 hover:border-amber-500 text-stone-400 hover:text-amber-400 text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add Conversation Turn</span>
      </button>
    </div>
  );
};
