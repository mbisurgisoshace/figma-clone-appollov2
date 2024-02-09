"use client";

import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";

import Live from "@/components/Live";
import Navbar from "@/components/Navbar";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import {
  handleCanvasMouseDown,
  handleCanvasMouseUp,
  handleCanvasObjectModified,
  handleCanvasObjectScaling,
  handleCanvasSelectionCreated,
  handleCanvaseMouseMove,
  handleResize,
  initializeFabric,
  renderCanvas,
} from "@/lib/canvas";
import { ActiveElement, Attributes } from "@/types/type";
import { useMutation, useRedo, useStorage, useUndo } from "@/liveblocks.config";
import { defaultNavElement } from "@/constants";
import { handleDelete, handleKeyDown } from "@/lib/key-events";
import { handleImageUpload } from "@/lib/shapes";

export default function Page() {
  const isDrawing = useRef(false);
  const isEditingRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shapeRef = useRef<fabric.Object | null>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const selectedShapeRef = useRef<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const activeObjectRef = useRef<fabric.Canvas | null>(null);

  const undo = useUndo();
  const redo = useRedo();

  const canvasObjects = useStorage((root) => root.canvasObjects);

  const syncShapeInStorage = useMutation(({ storage }, object) => {
    if (!object) return;

    const { objectId } = object;

    const shapeData = object.toJSON();
    shapeData.objectId = objectId;

    const canvasObjects = storage.get("canvasObjects");
    canvasObjects.set(objectId, shapeData);
  }, []);

  const [activeElement, setActiveElement] = useState<ActiveElement>({
    icon: "",
    name: "",
    value: "",
  });

  const [elementAttributes, setElementAttributes] = useState<Attributes>({
    width: "",
    height: "",
    fontSize: "",
    fontFamily: "",
    fontWeight: "",
    fill: "#aabbcc",
    stroke: "#aabbcc",
  });

  const deleteAllShapes = useMutation(({ storage }) => {
    const canvasObjects = storage.get("canvasObjects");
    if (!canvasObjects || canvasObjects.size === 0) return true;

    for (const [key, value] of canvasObjects.entries()) {
      canvasObjects.delete(key);
    }

    return canvasObjects.size === 0;
  }, []);

  const deleteShapeFromStorage = useMutation(({ storage }, objectId) => {
    const canvasObjects = storage.get("canvasObjects");
    canvasObjects.delete(objectId);
  }, []);

  const handleActiveElement = (element: ActiveElement) => {
    setActiveElement(element);

    switch (element?.value) {
      case "reset":
        deleteAllShapes();
        fabricRef.current?.clear();
        setActiveElement(defaultNavElement);
        break;
      case "delete":
        handleDelete(fabricRef.current as any, deleteShapeFromStorage);
        setActiveElement(defaultNavElement);
        break;
      case "image":
        imageInputRef.current?.click();
        isDrawing.current = false;

        if (fabricRef.current) {
          fabricRef.current.isDrawingMode = false;
        }
        break;
      default:
        break;
    }

    selectedShapeRef.current = element?.value as string;
  };

  useEffect(() => {
    const canvas = initializeFabric({ canvasRef, fabricRef });
    canvas.on("mouse:up", (options) => {
      handleCanvasMouseUp({
        canvas,
        shapeRef,
        isDrawing,
        activeObjectRef,
        setActiveElement,
        selectedShapeRef,
        syncShapeInStorage,
      });
    });
    canvas.on("mouse:down", (options) => {
      handleCanvasMouseDown({
        canvas,
        options,
        shapeRef,
        isDrawing,
        selectedShapeRef,
      });
    });
    canvas.on("mouse:move", (options) => {
      handleCanvaseMouseMove({
        canvas,
        options,
        shapeRef,
        isDrawing,
        selectedShapeRef,
        syncShapeInStorage,
      });
    });
    canvas.on("object:modified", (options) => {
      handleCanvasObjectModified({ options, syncShapeInStorage });
    });

    canvas.on("selection:created", (options) => {
      handleCanvasSelectionCreated({
        options,
        isEditingRef,
        setElementAttributes,
      });
    });

    canvas.on("object:scaling", (options) => {
      handleCanvasObjectScaling({
        options,
        setElementAttributes,
      });
    });

    window.addEventListener("resize", () => {
      handleResize({ canvas: fabricRef.current });
    });

    window.addEventListener("keydown", (e) => {
      handleKeyDown({
        e,
        canvas: fabricRef.current,
        undo,
        redo,
        syncShapeInStorage,
        deleteShapeFromStorage,
      });
    });

    return () => canvas.dispose();
  }, [redo, undo, syncShapeInStorage, deleteShapeFromStorage]);

  useEffect(() => {
    renderCanvas({
      fabricRef,
      canvasObjects,
      activeObjectRef,
    });
  }, [canvasObjects]);

  return (
    <main className="h-full overflow-hidden">
      <Navbar
        handleImageUpload={(e) => {
          e.stopPropagation();
          handleImageUpload({
            shapeRef,
            syncShapeInStorage,
            file: e.target.files[0],
            canvas: fabricRef as any,
          });
        }}
        imageInputRef={imageInputRef}
        activeElement={activeElement}
        handleActiveElement={handleActiveElement}
      />
      <section className="flex h-full flex-row">
        <LeftSidebar allShapes={Array.from(canvasObjects)} />
        <Live canvasRef={canvasRef} undo={undo} redo={redo} />
        <RightSidebar
          fabricRef={fabricRef}
          isEditingRef={isEditingRef}
          activeObjectRef={activeObjectRef}
          elementAttributes={elementAttributes}
          syncShapeInStorage={syncShapeInStorage}
          setElementAttributes={setElementAttributes}
        />
      </section>
    </main>
  );
}
