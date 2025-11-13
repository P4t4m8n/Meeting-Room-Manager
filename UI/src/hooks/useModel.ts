import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

type TUseModelHook<T extends HTMLElement> = {
  isOpen: boolean;
  modelRef: React.RefObject<T | null>;
  modelPositionClass: string;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  handleModel: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleModelWithPosition: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

interface IUseModelProps {
  callBack?: null | (() => void);
  parentModelRef?: React.RefObject<HTMLDivElement | HTMLFormElement | null>;
  baseModelPositionClass?: string;
  modelHeight?: number;
  modelInitialState?: boolean;
}

export const useModel = <T extends HTMLElement>({
  callBack,
  parentModelRef,
  baseModelPositionClass = "top-[calc(100%+.25rem)]",
  modelHeight = 128,
  modelInitialState = false,
}: IUseModelProps): TUseModelHook<T> => {
  const [isOpen, setIsOpen] = useState(modelInitialState);
  const [modelPositionClass, setModelPositionClass] = useState(
    baseModelPositionClass
  );
  const modelRef = useRef<T>(null);

  const eventListenerRef = useRef<{
    click: (ev: MouseEvent) => void;
    keydown: (ev: KeyboardEvent) => void;
  }>({
    click: () => {},
    keydown: () => {},
  });

  const handleModel = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }, []);

  const handleModelWithPosition = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isOpen && modelRef.current && parentModelRef?.current) {
        const parentRect = parentModelRef.current.getBoundingClientRect();
        const fieldRect = modelRef.current.getBoundingClientRect();

        const gap = 4;

        const spaceBelow = parentRect.bottom - fieldRect.bottom;
        const spaceAbove = fieldRect.top - parentRect.top;

        if (spaceBelow >= modelHeight + gap) {
          setModelPositionClass("top-[calc(100%+.25rem)]");
        } else if (spaceAbove >= modelHeight + gap) {
          setModelPositionClass("bottom-[calc(100%+.25rem)]");
        } else {
          setModelPositionClass("top-[calc(100%+.25rem)]");
        }
      }

      setIsOpen((prev) => !prev);
    },
    [isOpen, parentModelRef, modelHeight]
  );

  const checkClickOutside = useCallback(
    (ev: MouseEvent) => {
      const target = ev.target as HTMLElement;

      if (!isOpen || !modelRef?.current || modelRef?.current.contains(target))
        return;

      if (callBack) {
        callBack();
        return;
      }
      setIsOpen(false);
    },
    [isOpen, modelRef, callBack]
  );

  const checkKeyPress = useCallback((ev: KeyboardEvent) => {
    if (ev.key === "Escape") {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (!modelRef?.current || !isOpen) return;

    const currentEventListeners = eventListenerRef.current;
    currentEventListeners.click = checkClickOutside;
    currentEventListeners.keydown = checkKeyPress;
    const controller = new AbortController();

    window.addEventListener("mousedown", currentEventListeners.click, {
      signal: controller.signal,
    });
    window.addEventListener("keydown", currentEventListeners.keydown, {
      signal: controller.signal,
    });
    return () => {
      controller.abort();
    };
  }, [isOpen, modelRef, checkClickOutside, checkKeyPress]);

  return {
    isOpen,
    modelRef,
    modelPositionClass,
    setIsOpen,
    handleModel,
    handleModelWithPosition,
  };
};
