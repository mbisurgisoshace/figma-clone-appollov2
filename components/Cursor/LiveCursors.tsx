import Cursor from "./Cursor";
import { COLORS } from "@/constants";
import { LiveCursorProps } from "@/types/type";

const LiveCursors = ({ others }: LiveCursorProps) => {
  return others.map(({ connectionId, presence }) => {
    if (!presence?.cursor) return;

    return (
      <Cursor
        key={connectionId}
        x={presence.cursor.x}
        y={presence.cursor.y}
        message={presence.message}
        color={COLORS[Number(connectionId) % COLORS.length]}
      />
    );
  });
};

export default LiveCursors;
