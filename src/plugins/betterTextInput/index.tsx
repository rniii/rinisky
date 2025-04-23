/*
 * rinisky, a client mod for bluesky
 * Copyright (c) 2025 rini and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { RichText } from "@atproto/api";
import type { ClipboardEvent, CSSProperties, FormEvent, KeyboardEvent } from "react";
import React from "react";
import { StyleSheet } from "react-native";

import { definePlugin, re } from "api";
import { useTheme } from "plugins/ui";
import { flatten, withErrorBoundary } from "utils";

const styles = StyleSheet.create({
  container: {
    minHeight: 140,
    padding: 5,
    marginLeft: 8,
    marginBottom: 10,
    flexGrow: 1,
  },
});

interface TextInputProps {
  placeholder: string;
  style?: CSSProperties;

  setRichText(value: RichText): void;
  onPressPublish(): void;
  onPhotoPasted(uri: string): void;
  onFocus(): void;
}

const TextInput = (
  { placeholder: placeholderText, style, setRichText, onPressPublish, onPhotoPasted }: TextInputProps,
) => {
  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `.ri-text-input [contenteditable]:focus{outline:0}`
      + `.ri-text-input{word-break:break-word;white-space:pre-wrap}`;
    document.head.append(style);

    return () => style.remove();
  }, []);

  const t = useTheme();
  const input = React.useRef<HTMLElement>(null);
  const placeholder = React.useRef<HTMLElement>(null);

  const triggerUpdate = React.useCallback(() => {
    placeholder.current!.hidden = !!input.current!.textContent;
  }, [input]);

  const focusInput = React.useCallback(() => {
    input.current?.focus();
  }, [input]);

  React.useEffect(focusInput, [focusInput]);

  const onInput = React.useCallback((event: FormEvent) => {
    const input = event.currentTarget;

    setRichText(new RichText({ text: input.textContent || "" }));
    triggerUpdate();
  }, [setRichText, triggerUpdate]);

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
      if (!/^(image|video)\//.test(media.type)) return;

      const r = new FileReader();
      r.readAsDataURL(media.getAsFile()!);
      r.onloadend = () => onPhotoPasted(r.result as string);
    } else {
      const selection = getSelection();
      if (!selection) return;

      selection.deleteFromDocument();
      selection.getRangeAt(0).insertNode(document.createTextNode(clipboardData.getData("text/plain")));
      selection.collapseToEnd();
      triggerUpdate();
    }
  }, [onPhotoPasted, triggerUpdate]);

  return (
    <div
      className="ri-text-input"
      style={flatten([styles.container, t.atoms.text, style])}
      onClick={focusInput}
      data-placeholder={placeholderText}
    >
      <span onInput={onInput} onKeyDown={onKeyDown} onPaste={onPaste} contentEditable={true} ref={input} />
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
