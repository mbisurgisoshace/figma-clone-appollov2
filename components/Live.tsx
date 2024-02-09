"use client";

import { useCallback, useEffect, useState } from "react";
import {
  useBroadcastEvent,
  useEventListener,
  useMyPresence,
  useOthers,
} from "@/liveblocks.config";

import { CursorMode, CursorState, Reaction, ReactionEvent } from "@/types/type";
import CursorChat from "./Cursor/CursorChat";
import LiveCursors from "@/components/Cursor/LiveCursors";
import ReactionSelector from "./Reaction/ReactionButton";
import FlyingReaction from "./Reaction/FlyingReaction";
import useInterval from "@/hooks/useInterval";
import { Comments } from "./Comments/Comments";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { shortcuts } from "@/constants";

type Props = {
  undo: () => void;
  redo: () => void;
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
};

const Live = ({ undo, redo, canvasRef }: Props) => {
  const others = useOthers();
  const [{ cursor }, updateMyPresence] = useMyPresence();
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [cursorState, setCursorState] = useState<CursorState>({
    mode: CursorMode.Hidden,
  });

  const broadcast = useBroadcastEvent();

  useInterval(() => {
    setReactions((reactions) =>
      reactions.filter((r) => r.timestamp > Date.now() - 4000)
    );
  }, 1000);

  useInterval(() => {
    if (
      cursorState.mode === CursorMode.Reaction &&
      cursorState.isPressed &&
      cursor
    ) {
      setReactions((reactions) =>
        reactions.concat([
          {
            timestamp: Date.now(),
            value: cursorState.reaction,
            point: { x: cursor.x, y: cursor.y },
          },
        ])
      );

      broadcast({
        x: cursor.x,
        y: cursor.y,
        value: cursorState.reaction,
      });
    }
  }, 100);

  useEventListener((eventData) => {
    const event = eventData.event as ReactionEvent;

    setReactions((reactions) =>
      reactions.concat([
        {
          timestamp: Date.now(),
          value: event.value,
          point: { x: event.x, y: event.y },
        },
      ])
    );
  });

  const handlePointerLeave = useCallback(
    (e: React.PointerEvent) => {
      setCursorState({ mode: CursorMode.Hidden });
      updateMyPresence({ cursor: null, message: null });
    },
    [updateMyPresence]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();

      if (cursor == null || cursorState.mode !== CursorMode.ReactionSelector) {
        const x = e.clientX - e.currentTarget.getBoundingClientRect().x;
        const y = e.clientY - e.currentTarget.getBoundingClientRect().y;

        updateMyPresence({ cursor: { x, y } });
      }
    },
    [cursor, cursorState.mode, updateMyPresence]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const x = e.clientX - e.currentTarget.getBoundingClientRect().x;
      const y = e.clientY - e.currentTarget.getBoundingClientRect().y;

      updateMyPresence({ cursor: { x, y } });

      setCursorState((state) =>
        cursorState.mode === CursorMode.Reaction
          ? { ...state, isPressed: true }
          : state
      );
    },
    [cursorState.mode, updateMyPresence]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      setCursorState((state) =>
        cursorState.mode === CursorMode.Reaction
          ? { ...state, isPressed: true }
          : state
      );
    },
    [cursorState.mode]
  );

  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "/") {
        setCursorState({
          message: "",
          mode: CursorMode.Chat,
          previousMessage: null,
        });
      } else if (e.key === "Escape") {
        updateMyPresence({ message: "" });
        setCursorState({ mode: CursorMode.Hidden });
      } else if (e.key === "e") {
        setCursorState({ mode: CursorMode.ReactionSelector });
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/") {
        e.preventDefault();
      }
    };

    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [updateMyPresence]);

  const setReaction = useCallback((reaction: string) => {
    setCursorState({
      mode: CursorMode.Reaction,
      reaction,
      isPressed: false,
    });
  }, []);

  const handleContextMenuClick = useCallback(
    (key: string) => {
      switch (key) {
        case "Chat":
          setCursorState({
            mode: CursorMode.Chat,
            previousMessage: null,
            message: "",
          });
          break;
        case "Undo":
          undo();
          break;
        case "Redo":
          redo();
          break;
        case "Reactions":
          setCursorState({
            mode: CursorMode.Reaction,
          });
          break;
        default:
          break;
      }
    },
    [redo, undo]
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger
        id="canvas"
        className="h-full w-full"
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerLeave={handlePointerLeave}
      >
        <canvas ref={canvasRef} />

        {reactions.map((r) => (
          <FlyingReaction
            x={r.point.x}
            y={r.point.y}
            value={r.value}
            timestamp={r.timestamp}
            key={r.timestamp.toString()}
          />
        ))}

        {cursor && (
          <CursorChat
            cursor={cursor}
            cursorState={cursorState}
            setCursorState={setCursorState}
            updateMyPresence={updateMyPresence}
          />
        )}
        {cursorState.mode === CursorMode.ReactionSelector && (
          <ReactionSelector setReaction={setReaction} />
        )}
        <LiveCursors others={others} />
        <Comments />
      </ContextMenuTrigger>
      <ContextMenuContent className="right-menu-content">
        {shortcuts.map((item) => (
          <ContextMenuItem
            key={item.key}
            className="right-menu-item"
            onClick={() => handleContextMenuClick(item.name)}
          >
            <p>{item.name}</p>
            <p className="text-xs text-primary-grey-300">{item.shortcut}</p>
          </ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default Live;
