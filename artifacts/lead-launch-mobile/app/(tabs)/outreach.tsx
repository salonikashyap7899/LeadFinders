import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { buildOutreach } from "@/lib/scoring";
import type { OutreachChannel, OutreachLanguage } from "@/lib/types";

export default function OutreachScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { selectedRanked } = useApp();
  const [channel, setChannel] = useState<OutreachChannel>("whatsapp");
  const [lang, setLang] = useState<OutreachLanguage>("english");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (!selectedRanked) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.background, paddingTop: topPad }]}>
        <Feather name="message-circle" size={36} color={colors.border} />
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No lead selected</Text>
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Pick a lead from the Leads tab first</Text>
        <Pressable
          onPress={() => router.push("/(tabs)/leads")}
          style={[styles.goBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
        >
          <Text style={[styles.goBtnText, { color: colors.primaryForeground }]}>Go to Leads</Text>
        </Pressable>
      </View>
    );
  }

  const { first, followUp } = buildOutreach(selectedRanked, channel, lang);

  async function copyText(text: string) {
    await Clipboard.setStringAsync(text);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  async function sendOutreach() {
    if (channel === "whatsapp" && selectedRanked.whatsapp) {
      const num = selectedRanked.whatsapp.replace(/\D/g, "");
      Linking.openURL(`https://wa.me/${num}?text=${encodeURIComponent(first)}`);
    } else if (channel === "email" && selectedRanked.email) {
      const subject = encodeURIComponent("Built a website demo for your business");
      const body = encodeURIComponent(first);
      Linking.openURL(`mailto:${selectedRanked.email}?subject=${subject}&body=${body}`);
    } else if (channel === "instagram") {
      Linking.openURL("https://instagram.com/");
    } else {
      await copyText(first);
    }
  }

  const CHANNELS: { id: OutreachChannel; icon: string; label: string; available: boolean }[] = [
    { id: "whatsapp", icon: "message-circle", label: "WhatsApp", available: !!selectedRanked.whatsapp },
    { id: "email", icon: "mail", label: "Email", available: !!selectedRanked.email },
    { id: "instagram", icon: "camera", label: "Instagram", available: true },
  ];

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.recipientRow}>
        <View style={[styles.avatar, { backgroundColor: colors.primary, borderRadius: 22 }]}>
          <Text style={[styles.avatarText, { color: colors.primaryForeground }]}>
            {selectedRanked.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.recipientName, { color: colors.foreground }]} numberOfLines={1}>
            {selectedRanked.name}
          </Text>
          <Text style={[styles.recipientSub, { color: colors.mutedForeground }]} numberOfLines={1}>
            Score {selectedRanked.score} · {selectedRanked.city}
          </Text>
        </View>
        <View style={styles.langRow}>
          <Text style={[styles.langLabel, { color: selectedRanked.mutedForeground ?? colors.mutedForeground }]}>EN</Text>
          <Switch
            value={lang === "hinglish"}
            onValueChange={(v) => setLang(v ? "hinglish" : "english")}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor={colors.primaryForeground}
            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
          />
          <Text style={[styles.langLabel, { color: colors.mutedForeground }]}>HI</Text>
        </View>
      </View>

      <View style={styles.channelRow}>
        {CHANNELS.map((ch) => (
          <Pressable
            key={ch.id}
            onPress={() => ch.available && setChannel(ch.id)}
            style={[
              styles.channelBtn,
              {
                backgroundColor: channel === ch.id ? colors.primary : colors.muted,
                borderRadius: colors.radius,
                opacity: ch.available ? 1 : 0.4,
              },
            ]}
          >
            <Feather name={ch.icon as "mail"} size={14} color={channel === ch.id ? colors.primaryForeground : colors.mutedForeground} />
            <Text style={[styles.channelLabel, { color: channel === ch.id ? colors.primaryForeground : colors.mutedForeground }]}>
              {ch.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <MessageCard
        title="First message"
        text={first}
        colors={colors}
        onCopy={() => copyText(first)}
        onSend={sendOutreach}
        channelLabel={CHANNELS.find((c) => c.id === channel)?.label ?? "Send"}
      />

      <MessageCard
        title="Day-3 follow-up"
        text={followUp}
        colors={colors}
        onCopy={() => copyText(followUp)}
      />

      <View style={[styles.completeBanner, { backgroundColor: colors.success + "18", borderColor: colors.success + "40", borderRadius: colors.radius }]}>
        <Feather name="check-circle" size={18} color={colors.success} />
        <Text style={[styles.completeText, { color: colors.success }]}>Pipeline complete — repeat for next lead</Text>
      </View>

      <View style={{ height: Platform.OS === "web" ? 34 : insets.bottom + 80 }} />
    </ScrollView>
  );
}

function MessageCard({
  title,
  text,
  colors,
  onCopy,
  onSend,
  channelLabel,
}: {
  title: string;
  text: string;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
  onCopy: () => void;
  onSend?: () => void;
  channelLabel?: string;
}) {
  const [localText, setLocalText] = useState(text);
  React.useEffect(() => setLocalText(text), [text]);

  return (
    <View style={[styles.msgCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
      <View style={styles.msgHeader}>
        <Text style={[styles.msgTitle, { color: colors.foreground }]}>{title}</Text>
        <View style={styles.msgActions}>
          <Pressable onPress={onCopy} style={[styles.iconBtn, { backgroundColor: colors.muted, borderRadius: colors.radius - 4 }]}>
            <Feather name="copy" size={14} color={colors.mutedForeground} />
          </Pressable>
          {onSend && (
            <Pressable onPress={onSend} style={[styles.sendBtn, { backgroundColor: colors.primary, borderRadius: colors.radius - 4 }]}>
              <Feather name="send" size={13} color={colors.primaryForeground} />
              <Text style={[styles.sendLabel, { color: colors.primaryForeground }]}>{channelLabel}</Text>
            </Pressable>
          )}
        </View>
      </View>
      <TextInput
        value={localText}
        onChangeText={setLocalText}
        multiline
        style={[styles.msgText, { color: colors.foreground, borderColor: colors.border, borderRadius: colors.radius - 4, backgroundColor: colors.background }]}
        textAlignVertical="top"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16 },
  recipientRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 18 },
  avatar: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 18, fontFamily: "Inter_700Bold" },
  recipientName: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  recipientSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  langRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  langLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  channelRow: { flexDirection: "row", gap: 8, marginBottom: 18 },
  channelBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 9, flex: 1, justifyContent: "center" },
  channelLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  msgCard: { borderWidth: 1, padding: 14, marginBottom: 14 },
  msgHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  msgTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  msgActions: { flexDirection: "row", gap: 8 },
  iconBtn: { padding: 8 },
  sendBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8 },
  sendLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  msgText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20, minHeight: 180, padding: 10, borderWidth: 1 },
  completeBanner: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderWidth: 1, marginBottom: 8 },
  completeText: { fontSize: 14, fontFamily: "Inter_500Medium", flex: 1 },
});
