import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { scoreLead, scoreColor } from "@/lib/scoring";

export default function LeadDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { leads, audits, setSelectedId } = useApp();

  const lead = leads.find((l) => l.id === id);
  const audit = lead && audits[lead.id];
  const ranked = lead && audit ? scoreLead(lead, audit) : null;

  if (!lead || !audit || !ranked) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Lead not found</Text>
      </View>
    );
  }

  const sc = scoreColor(ranked.score);

  function selectAndGoOutreach() {
    setSelectedId(lead!.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push("/(tabs)/outreach");
  }

  const breakdownItems = [
    { label: "No / bad website", value: ranked.scoreBreakdown.noOrBadSite, icon: "globe" },
    { label: "Review volume", value: ranked.scoreBreakdown.reviewVolume, icon: "star" },
    { label: "Rating quality", value: ranked.scoreBreakdown.rating, icon: "thumbs-up" },
    { label: "Recency", value: ranked.scoreBreakdown.recency, icon: "clock" },
    { label: "Reachable contacts", value: ranked.scoreBreakdown.reachable, icon: "phone" },
    { label: "Industry fit", value: ranked.scoreBreakdown.industryFit, icon: "target" },
  ] as const;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <View style={[styles.scoreCircle, { backgroundColor: sc + "18", borderColor: sc + "40" }]}>
          <Text style={[styles.scoreNum, { color: sc }]}>{ranked.score}</Text>
          <Text style={[styles.scoreLabel, { color: sc }]}>/ 100</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.leadName, { color: colors.foreground }]}>{lead.name}</Text>
          <Text style={[styles.leadCat, { color: colors.mutedForeground }]}>{lead.category} · {lead.city}</Text>
          {lead.address ? <Text style={[styles.leadAddr, { color: colors.mutedForeground }]}>{lead.address}</Text> : null}
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Contact</Text>
        {lead.phone ? (
          <InfoRow icon="phone" label={lead.phone} colors={colors} onPress={() => Linking.openURL(`tel:${lead.phone}`)} />
        ) : null}
        {lead.whatsapp ? (
          <InfoRow icon="message-circle" label="WhatsApp" colors={colors} onPress={() => Linking.openURL(`https://wa.me/${lead.whatsapp!.replace(/\D/g, "")}`)} accent />
        ) : null}
        {lead.email ? (
          <InfoRow icon="mail" label={lead.email} colors={colors} onPress={() => Linking.openURL(`mailto:${lead.email}`)} />
        ) : null}
        {lead.website ? (
          <InfoRow icon="globe" label={lead.website} colors={colors} onPress={() => Linking.openURL(lead.website!)} />
        ) : (
          <View style={[styles.noSiteRow, { backgroundColor: colors.destructive + "12", borderRadius: colors.radius - 4 }]}>
            <Feather name="alert-circle" size={14} color={colors.destructive} />
            <Text style={[styles.noSiteText, { color: colors.destructive }]}>No website — perfect pitch opportunity</Text>
          </View>
        )}
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Audit</Text>
        {lead.rating ? (
          <View style={styles.auditRow}>
            <Feather name="star" size={14} color={colors.warning} />
            <Text style={[styles.auditLabel, { color: colors.foreground }]}>{lead.rating} stars ({lead.reviewsCount ?? 0} reviews)</Text>
          </View>
        ) : null}
        {audit.pageSpeedScore > 0 ? (
          <View style={styles.auditRow}>
            <Feather name="zap" size={14} color={audit.pageSpeedScore < 50 ? colors.destructive : colors.success} />
            <Text style={[styles.auditLabel, { color: colors.foreground }]}>
              PageSpeed: {audit.pageSpeedScore} ({audit.pageSpeedScore < 50 ? "poor" : audit.pageSpeedScore < 75 ? "needs work" : "good"})
            </Text>
          </View>
        ) : null}
        <View style={[styles.gapBox, { backgroundColor: colors.muted, borderRadius: colors.radius - 4 }]}>
          <Text style={[styles.gapLabel, { color: colors.mutedForeground }]}>BIGGEST GAP</Text>
          <Text style={[styles.gapText, { color: colors.foreground }]}>{audit.biggestGap}</Text>
        </View>
        <View style={styles.revenueRow}>
          <Feather name="trending-up" size={14} color={colors.warning} />
          <Text style={[styles.revenueText, { color: colors.warning }]}>
            Est. ${audit.estLostRevenuePerMonth.toLocaleString()}/mo in untapped revenue
          </Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Score breakdown</Text>
        {breakdownItems.map((item) => (
          <View key={item.label} style={styles.breakRow}>
            <Feather name={item.icon as "phone"} size={13} color={colors.mutedForeground} />
            <Text style={[styles.breakLabel, { color: colors.foreground }]}>{item.label}</Text>
            <View style={[styles.breakBar, { backgroundColor: colors.muted }]}>
              <View style={[styles.breakFill, { backgroundColor: sc, width: `${(item.value / 25) * 100}%` as `${number}%` }]} />
            </View>
            <Text style={[styles.breakVal, { color: colors.mutedForeground }]}>+{item.value}</Text>
          </View>
        ))}
      </View>

      <Pressable
        onPress={selectAndGoOutreach}
        style={({ pressed }) => [styles.outreachBtn, { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 }]}
      >
        <Feather name="send" size={16} color={colors.primaryForeground} />
        <Text style={[styles.outreachBtnText, { color: colors.primaryForeground }]}>Draft outreach messages</Text>
      </Pressable>

      <Pressable
        onPress={async () => {
          const summary = `${lead.name} — Score ${ranked.score}/100\nGap: ${audit.biggestGap}\nPhone: ${lead.phone ?? "none"} | Website: ${lead.website ?? "none"}`;
          await Clipboard.setStringAsync(summary);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }}
        style={({ pressed }) => [styles.copyBtn, { backgroundColor: colors.muted, borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 }]}
      >
        <Feather name="copy" size={14} color={colors.mutedForeground} />
        <Text style={[styles.copyBtnText, { color: colors.mutedForeground }]}>Copy summary</Text>
      </Pressable>
    </ScrollView>
  );
}

function InfoRow({ icon, label, colors, onPress, accent }: {
  icon: string;
  label: string;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
  onPress: () => void;
  accent?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.auditRow, { gap: 10 }]}>
      <Feather name={icon as "phone"} size={14} color={accent ? colors.accent : colors.mutedForeground} />
      <Text style={[styles.auditLabel, { color: colors.primary, flex: 1 }]} numberOfLines={1}>{label}</Text>
      <Feather name="external-link" size={12} color={colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 16, fontFamily: "Inter_400Regular" },
  heroCard: { borderWidth: 1, padding: 16, flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 12 },
  scoreCircle: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  scoreNum: { fontSize: 26, fontFamily: "Inter_700Bold", lineHeight: 30 },
  scoreLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  leadName: { fontSize: 18, fontFamily: "Inter_700Bold", lineHeight: 22 },
  leadCat: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 3 },
  leadAddr: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  section: { borderWidth: 1, padding: 14, marginBottom: 12 },
  sectionTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 },
  auditRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  auditLabel: { fontSize: 14, fontFamily: "Inter_400Regular", flex: 1 },
  noSiteRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, marginBottom: 6 },
  noSiteText: { fontSize: 13, fontFamily: "Inter_500Medium", flex: 1 },
  gapBox: { padding: 12, marginBottom: 10 },
  gapLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 },
  gapText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  revenueRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  revenueText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  breakRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  breakLabel: { fontSize: 12, fontFamily: "Inter_400Regular", flex: 1 },
  breakBar: { width: 60, height: 6, borderRadius: 3, overflow: "hidden" },
  breakFill: { height: 6, borderRadius: 3 },
  breakVal: { fontSize: 12, fontFamily: "Inter_600SemiBold", minWidth: 26, textAlign: "right" },
  outreachBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 15, marginBottom: 10 },
  outreachBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  copyBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12 },
  copyBtnText: { fontSize: 14, fontFamily: "Inter_500Medium" },
});
