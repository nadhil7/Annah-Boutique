"use client";

import * as React from "react";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  type ToastProps,
  type ToastActionElement,
} from "@/components/ui/toast";

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 5000;

type State = {
  toasts: ToasterToast[];
};

const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };
let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

function setState(state: State) {
  memoryState = state;
  listeners.forEach((listener) => {
    listener(state);
  });
}

type ToastInput = Omit<ToasterToast, "id">;

function toast(props: ToastInput) {
  const id = genId();

  const update = (props: ToastInput) =>
    setState({
      toasts: memoryState.toasts.map((t) =>
        t.id === id ? { ...t, ...props } : t
      ),
    });

  const dismiss = () =>
    setState({
      toasts: memoryState.toasts.filter((t) => t.id !== id),
    });

  setState({
    toasts: [{ id, ...props }, ...memoryState.toasts].slice(0, TOAST_LIMIT),
  });

  setTimeout(() => {
    setState({
      toasts: memoryState.toasts.filter((t) => t.id !== id),
    });
  }, TOAST_REMOVE_DELAY);

  return { id, dismiss, update };
}

function useToast() {
  const [state, setStateLocal] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setStateLocal);
    return () => {
      const index = listeners.indexOf(setStateLocal);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => {
      if (toastId) {
        setState({
          toasts: memoryState.toasts.filter((t) => t.id !== toastId),
        });
      } else {
        setState({ toasts: [] });
      }
    },
  };
}

function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}

export { Toaster, toast, useToast };
