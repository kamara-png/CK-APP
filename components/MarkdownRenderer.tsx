import { Text, TouchableOpacity, View } from "react-native";
import { ColorScheme } from "@/hooks/useTheme";

interface Token {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
}

function tokenizeEmphasis(text: string): Token[] {
  const tokens: Token[] = [];
  const regex = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(_([^_]+)_)|(`([^`]+)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) tokens.push({ text: text.slice(lastIndex, match.index) });
    if (match[2] !== undefined) tokens.push({ text: match[2], bold: true });
    else if (match[4] !== undefined) tokens.push({ text: match[4], italic: true });
    else if (match[6] !== undefined) tokens.push({ text: match[6], italic: true });
    else if (match[8] !== undefined) tokens.push({ text: match[8], code: true });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) tokens.push({ text: text.slice(lastIndex) });
  return tokens;
}

interface InlineProps {
  text: string;
  colors: ColorScheme;
  onLinkPress: (title: string) => void;
  baseStyle?: object;
}

function Inline({ text, colors, onLinkPress, baseStyle }: InlineProps) {
  // Split on [[Wiki Links]] first, keeping the captured link titles interleaved.
  const parts = text.split(/\[\[([^\]]+)\]\]/g);

  return (
    <Text style={baseStyle}>
      {parts.map((part, i) => {
        const isLink = i % 2 === 1;
        if (isLink) {
          return (
            <Text
              key={i}
              style={{ color: colors.primary, textDecorationLine: "underline", fontWeight: "600" }}
              onPress={() => onLinkPress(part)}
            >
              {part}
            </Text>
          );
        }
        const tokens = tokenizeEmphasis(part);
        return tokens.map((tok, j) => (
          <Text
            key={`${i}-${j}`}
            style={[
              tok.bold && { fontWeight: "700" },
              tok.italic && { fontStyle: "italic" },
              tok.code && {
                fontFamily: "monospace",
                backgroundColor: colors.border,
                borderRadius: 4,
              },
            ]}
          >
            {tok.text}
          </Text>
        ));
      })}
    </Text>
  );
}

interface MarkdownRendererProps {
  content: string;
  colors: ColorScheme;
  onLinkPress: (title: string) => void;
  onToggleChecklist: (lineIndex: number) => void;
}

export default function MarkdownRenderer({
  content,
  colors,
  onLinkPress,
  onToggleChecklist,
}: MarkdownRendererProps) {
  const lines = content.split("\n");

  return (
    <View>
      {lines.map((line, i) => {
        const checklistMatch = line.match(/^(\s*)-\s\[( |x|X)\]\s?(.*)$/);
        if (checklistMatch) {
          const checked = checklistMatch[2].toLowerCase() === "x";
          const label = checklistMatch[3];
          return (
            <TouchableOpacity
              key={i}
              onPress={() => onToggleChecklist(i)}
              style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, marginVertical: 3 }}
            >
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 5,
                  borderWidth: 2,
                  marginTop: 2,
                  borderColor: checked ? colors.success : colors.textMuted,
                  backgroundColor: checked ? colors.success : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {checked && <Text style={{ color: "#fff", fontSize: 12, lineHeight: 14 }}>✓</Text>}
              </View>
              <Inline
                text={label}
                colors={colors}
                onLinkPress={onLinkPress}
                baseStyle={{
                  color: colors.text,
                  flex: 1,
                  textDecorationLine: checked ? "line-through" : "none",
                  opacity: checked ? 0.6 : 1,
                }}
              />
            </TouchableOpacity>
          );
        }

        const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
        if (headingMatch) {
          const level = headingMatch[1].length;
          const size = level === 1 ? 22 : level === 2 ? 19 : 17;
          return (
            <Inline
              key={i}
              text={headingMatch[2]}
              colors={colors}
              onLinkPress={onLinkPress}
              baseStyle={{
                color: colors.text,
                fontSize: size,
                fontWeight: "700",
                marginTop: i === 0 ? 0 : 10,
                marginBottom: 4,
              }}
            />
          );
        }

        const bulletMatch = line.match(/^\s*-\s+(.*)$/);
        if (bulletMatch) {
          return (
            <View key={i} style={{ flexDirection: "row", marginVertical: 2 }}>
              <Text style={{ color: colors.textMuted, marginRight: 8 }}>•</Text>
              <Inline
                text={bulletMatch[1]}
                colors={colors}
                onLinkPress={onLinkPress}
                baseStyle={{ color: colors.text, flex: 1, lineHeight: 22 }}
              />
            </View>
          );
        }

        if (line.trim() === "") {
          return <View key={i} style={{ height: 10 }} />;
        }

        return (
          <Inline
            key={i}
            text={line}
            colors={colors}
            onLinkPress={onLinkPress}
            baseStyle={{ color: colors.text, fontSize: 16, lineHeight: 24 }}
          />
        );
      })}
    </View>
  );
}
