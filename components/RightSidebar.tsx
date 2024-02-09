import { fabric } from "fabric";

import { RightSidebarProps } from "@/types/type";
import Color from "./Settings/Color";
import Dimensions from "./Settings/Dimensions";
import Export from "./Settings/Export";
import Text from "./Settings/Text";
import { modifyShape } from "@/lib/shapes";
import { useRef } from "react";

const RightSidebar = ({
  elementAttributes,
  setElementAttributes,
  isEditingRef,
  activeObjectRef,
  syncShapeInStorage,
  fabricRef,
}: RightSidebarProps) => {
  const inputColorRef = useRef(null);
  const strokeInputColorRef = useRef(null);

  const handleInputChange = (property: string, value: string) => {
    if (!isEditingRef.current) {
      isEditingRef.current = true;
    }
    setElementAttributes((prev) => ({
      ...prev,
      [property]: value,
    }));

    modifyShape({
      value,
      property,
      activeObjectRef,
      syncShapeInStorage,
      canvas: fabricRef.current as fabric.Canvas,
    });
  };

  return (
    <section className="flex flex-col border-t border-primary-grey-200 bg-primary-black text-primary-grey-300 min-2-[227px] sticky right-0 h-full max-sm:hidden select-none">
      <h3 className="px-5 pt-4 text-xs uppercase">Design</h3>
      <span className="text-xs text-primary-grey-300 mt-3 px-5 border-b border-primary-grey-200 pb-4">
        Maker changes to canvas as you like
      </span>
      <Dimensions
        isEditingRef={isEditingRef}
        width={elementAttributes.width}
        height={elementAttributes.height}
        handleInputChange={handleInputChange}
      />
      <Text
        handleInputChange={handleInputChange}
        fontSize={elementAttributes.fontSize}
        fontWeight={elementAttributes.fontWeight}
        fontFamily={elementAttributes.fontFamily}
      />
      <Color
        placeholder="color"
        attributeType="fill"
        inputRef={inputColorRef}
        attribute={elementAttributes.fill}
        handleInputChange={handleInputChange}
      />
      <Color
        placeholder="stroke"
        attributeType="stroke"
        inputRef={strokeInputColorRef}
        attribute={elementAttributes.stroke}
        handleInputChange={handleInputChange}
      />
      <Export />
    </section>
  );
};

export default RightSidebar;
