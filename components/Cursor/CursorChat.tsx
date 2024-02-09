import CursorSVG from "@/public/assets/CursorSVG";
import { CursorChatProps, CursorMode } from "@/types/type";

const CursorChat = ({
  cursor,
  cursorState,
  setCursorState,
  updateMyPresence,
}: CursorChatProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateMyPresence({ message: e.target.value });
    setCursorState({
      mode: CursorMode.Chat,
      previousMessage: null,
      message: e.target.value,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setCursorState({
        message: "",
        mode: CursorMode.Chat,
        previousMessage: cursorState.message,
      });
    } else if (e.key === "Escape") {
      setCursorState({
        mode: CursorMode.Hidden,
      });
    }
  };

  return (
    <div
      className="absolute top-0 left-0"
      style={{
        transform: `translateX(${cursor.x}px) translateY(${cursor.y}px)`,
      }}
    >
      {cursorState.mode === CursorMode.Chat && (
        <>
          <CursorSVG color="#000" />
          <div
            onKeyUp={(e) => e.stopPropagation()}
            className="absolute left-2 top-5 bg-blue-500 px-4 py-2 text-sm leading-relaxed text-white rounded-[20px]"
          >
            {cursorState.previousMessage && (
              <div>{cursorState.previousMessage}</div>
            )}
            <input
              autoFocus
              maxLength={50}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              value={cursorState.message}
              placeholder={
                cursorState.previousMessage ? "" : "Type a message..."
              }
              className="z-10 w-60 border-none bg-transparent text-white placeholder-blue-300 outline-none"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default CursorChat;
