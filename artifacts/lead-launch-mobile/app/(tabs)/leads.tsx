import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LeadCard } from "@/components/LeadCard";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { auditLead } from "@/lib/api";
import type { Lead } from "@/lib/types";

export default function LeadsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { leads, audits, selectedId, setSelectedId, addAudit } = useApp();
  const [auditingIds, setAuditingIds] = useState<Set<string>>(new Set());
  const auditedRef = useRef<Set<string>>(new Set());

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    if (leads.length === 0) return;
    const toAudit = leads.filter((l) => !audits[l.id] && !auditedRef.current.has(l.id));
    if (toAudit.length === 0) return;
    toAudit.forEach((l) => auditedRef.current.add(l.id));
    setAuditingIds((prev) => {
      const next = new Set(prev);
      toAudit.forEach((l) => next.add(l.id));
      return next;
    });
    toAudit.forEach(async (lead) => {
      try {
        const { audit } = await auditLead(lead);
        addAudit(audit);
      } catch {}
      setAuditingIds((prev) => {
        const next = new Set(prev);
        next.delete(lead.id);
        return next;
      });
    });
  }, [leads]);

  function handleSelect(lead: Lead) {
    Haptics.selectionAsync();
    setSelectedId(lead.id);
  }

  const rankedLeads = leads
    .filter((l) => audits[l.id])
    .sort((a, b) => {
      const sa = audits[a.id] ? (audits[a.id].pageSpeedScore < 50 ? 50 : 30) + (a.reviewsCount ?? 0) : 0;
      const sb = audits[b.id] ? (audits[b.id].pageSpeedScore < 50 ? 50 : 30) + (b.reviewsCount ?? 0) : 0;
      return sb - sa;
    });
  const pendingLeads = leads.filter((l) => !audits[l.id]);
  const allSorted = [...rankedLeads, ...pendingLeads];

  const auditingCount = auditingIds.size;
  const auditedCount = Object.keys(audits).length;

  if (leads.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.background, paddingTop: topPad }]}>
        <Feather name="search" size={36} color={colors.border} />
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No leads yet</Text>
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Use the Search tab to find businesses</Text>
        <Pressable
          onPress={() => router.push("/(tabs)/index")}
          style={[styles.goBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
        >
          <Text style={[styles.goBtnText, { color: colors.primaryForeground }]}>Go to Search</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.topTitle, { color: colors.foreground }]}>{leads.length} leads</Text>
          <Text style={[styles.topSub, { color: colors.mutedForeground }]}>
            {auditingCount > 0 ? `Auditing ${auditingCount}…` : `${auditedCount} audited`}
          </Text>
        </View>
        {auditingCount > 0 && <ActivityIndicator color={colors.primary} size="small" />}
      </View>

      <FlatList
        data={allSorted}
        keyExtractor={(l) => l.id}
        contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 80 }]}
        renderItem={({ item }) => (
          <LeadCard
            lead={item}
            audit={audits[item.id]}
            selected={item.id === selectedId}
            onPress={() => {
              handleSelect(item);
              if (audits[item.id]) router.push(`/lead/${item.id}`);
            }}
          />
        )}
        ListEmptyComponent={null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  topTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  topSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  list: { paddingHorizontal: 16, paddingTop: 12 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_600SemiBold", marginTop: 12 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  goBtn: { marginTop: 12, paddingHorizontal: 24, paddingVertical: 12 },
  goBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
