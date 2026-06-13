import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { Lead, AuditResult } from "@/lib/types";
import { scoreLead, scoreColor } from "@/lib/scoring";

type Props = {
  lead: Lead;
  audit?: AuditResult;
  selected?: boolean;
  onPress: () => void;
};

export function LeadCard({ lead, audit, selected, onPress }: Props) {
  const colors = useColors();
  const ranked = audit ? scoreLead(lead, audit) : null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: selected ? colors.secondary : colors.card,
          borderColor: selected ? colors.primary : colors.border,
          borderRadius: colors.radius,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
            {lead.name}
          </Text>
          <Text style={[styles.category, { color: colors.mutedForeground }]} numberOfLines={1}>
            {lead.category} · {lead.city}
          </Text>
          <View style={styles.icons}>
            {lead.phone && <Feather name="phone" size={13} color={colors.mutedForeground} />}
            {lead.whatsapp && <Feather name="message-circle" size={13} color={colors.accent} />}
            {lead.email && <Feather name="mail" size={13} color={colors.mutedForeground} />}
            {lead.website ? (
              <Feather name="globe" size={13} color={colors.mutedForeground} />
            ) : (
              <View style={[styles.nositeBadge, { backgroundColor: colors.destructive + "22", borderRadius: 4 }]}>
                <Text style={[styles.nositeText, { color: colors.destructive }]}>No site</Text>
              </View>
            )}
            {lead.rating ? (
              <View style={styles.ratingRow}>
                <Feather name="star" size={12} color={colors.warning} />
                <Text style={[styles.ratingText, { color: colors.mutedForeground }]}>{lead.rating}</Text>
              </View>
            ) : null}
          </View>
        </View>
        <View style={styles.right}>
          {ranked ? (
            <View style={[styles.scoreBadge, { backgroundColor: scoreColor(ranked.score) + "20", borderRadius: colors.radius - 2 }]}>
              <Text style={[styles.scoreNum, { color: scoreColor(ranked.score) }]}>{ranked.score}</Text>
              <Text style={[styles.scoreLabel, { color: scoreColor(ranked.score) }]}>score</Text>
            </View>
          ) : audit === undefined ? (
            <View style={[styles.pendingBadge, { backgroundColor: colors.muted, borderRadius: colors.radius - 2 }]}>
              <Text style={[styles.pendingText, { color: colors.mutedForeground }]}>Pending</Text>
            </View>
          ) : (
            <View style={[styles.pendingBadge, { backgroundColor: colors.muted, borderRadius: colors.radius - 2 }]}>
              <Text style={[styles.pendingText, { color: colors.mutedForeground }]}>Auditing…</Text>
            </View>
          )}
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} style={{ marginTop: 8 }} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  category: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  icons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  nositeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  nositeText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  right: {
    alignItems: "center",
    minWidth: 56,
  },
  scoreBadge: {
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  scoreNum: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    lineHeight: 26,
  },
  scoreLabel: {
    fontSize: 9,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  pendingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  pendingText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
