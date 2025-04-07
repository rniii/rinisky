import { define, re, withErrorBoundary } from "api";
import type { FormEvent, KeyboardEvent } from "react";
import { RichText } from "webpack/atproto-api";
import { React } from "webpack/react";
import { StyleSheet } from "webpack/react-native";

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
  onSubmit(): void;
  onFocus(): void;
}

const TextInput = ({ placeholder: placeholderText, setRichText, onPressPublish }: TextInputProps) => {
  React.useEffect(() => {
    const style = document.createElement("style");
    document.head.append(style);

    style.sheet!.insertRule(`[contenteditable]:focus { outline: 0 }`);

    return () => style.remove();
  }, []);

  const input = React.useRef<HTMLElement>(null);
  const placeholder = React.useRef<HTMLElement>(null);

  const onInput = React.useCallback((event: FormEvent) => {
    const editor = event.currentTarget;

    placeholder.current!.hidden = !!editor.textContent;

    setRichText(new RichText({ text: editor.textContent || "" }));
  }, [input, placeholder]);

  const onClick = React.useCallback(() => {
    input.current?.focus();
  }, [input, placeholder]);

  const onKeyDown = React.useCallback((event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.code == "Enter") {
      event.preventDefault();
      onPressPublish();
    }
  }, []);

  return (
    <div style={style.container} onClick={onClick}>
      <span onInput={onInput} onKeyDown={onKeyDown} contentEditable={true} ref={input} />
      <span style={style.placeholder} ref={placeholder}>
        {placeholderText}
      </span>
    </div>
  );
};

export default define({
  name: "BetterTextInput",
  patches: [{
    patch: [{
      match: re`(0,\i.jsx)(\i,\(\?={ref:\i,richtext:\i,placeholder:\i,\)`,
      replace: "$self.renderTextInput(",
    }],
  }],

  renderTextInput: withErrorBoundary(TextInput),
});
