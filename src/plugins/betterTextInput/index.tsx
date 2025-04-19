/*
 * rinisky, a client mod for bluesky
 * Copyright (c) 2025 rini and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { RichText } from "@atproto/api";
import type { ClipboardEvent, FormEvent, KeyboardEvent } from "react";
import React from "react";
import { StyleSheet } from "react-native";

import { definePlugin, re } from "api";
import { withErrorBoundary } from "utils";

const style = StyleSheet.create({
  container: {
    minHeight: 140,
    padding: 5,
    marginLeft: 8,
    marginBottom: 10,
    flexGrow: 1,
  },
  placeholder: {
    color: "#8d8e96",
  },
});

interface TextInputProps {
  placeholder: string;

  setRichText(value: RichText): void;
  onPressPublish(): void;
  onPhotoPasted(uri: string): void;
  onFocus(): void;
}

const TextInput = ({ placeholder: placeholderText, setRichText, onPressPublish, onPhotoPasted }: TextInputProps) => {
  React.useEffect(() => {
    const style = document.createElement("style");
    document.head.append(style);

    style.sheet!.insertRule(`[contenteditable]:focus { outline: 0 }`);

    return () => style.remove();
  }, []);

  const input = React.useRef<HTMLElement>(null);
  const placeholder = React.useRef<HTMLElement>(null);

  const onClick = React.useCallback(() => {
    input.current?.focus();
  }, [input]);

  const onInput = React.useCallback((event: FormEvent) => {
    const input = event.currentTarget;

    placeholder.current!.hidden = !!input.textContent;

    setRichText(new RichText({ text: input.textContent || "" }));
  }, [placeholder, setRichText]);

  const onKeyDown = React.useCallback((event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.code === "Enter") {
      event.preventDefault();
      onPressPublish();
    }
  }, [onPressPublish]);

  const onPaste = React.useCallback((event: ClipboardEvent) => {
    event.preventDefault();

    const { clipboardData } = event;
    const media = [...clipboardData.items].find(i => i.kind === "file");

    if (media) {
      if (!/^image\/|^video\//.test(media.type)) return;

      const r = new FileReader();
      r.readAsDataURL(media.getAsFile()!);
      r.onloadend = () => onPhotoPasted(r.result as string);
    } else {
      const selection = getSelection();
      if (!selection) return;

      selection.deleteFromDocument();
      selection.getRangeAt(0).insertNode(document.createTextNode(clipboardData.getData("text/plain")));
      selection.collapseToEnd();

      placeholder.current!.hidden = !!input.current!.textContent;
    }
  }, [onPhotoPasted]);

  return (
    <div style={style.container} onClick={onClick}>
      <span onInput={onInput} onKeyDown={onKeyDown} onPaste={onPaste} contentEditable={true} ref={input} />
      <span style={style.placeholder} ref={placeholder}>
        {placeholderText}
      </span>
    </div>
  );
};

export default definePlugin({
  name: "BetterTextInput",
  patches: [
    {
      patch: {
        match: re`(0,\i.jsx)(\i,\(\?={ref:\i,style:\i,richtext:\i,placeholder:\i,\)`,
        replace: "$self.renderTextInput(",
      },
    },
  ],

  renderTextInput: withErrorBoundary(TextInput),
});
