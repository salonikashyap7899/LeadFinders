import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { scrapeLeads } from "@/lib/api";

const QUICK_NICHES = ["Dentist", "Cafe", "Salon", "Gym", "Lawyer", "Restaurant", "Hotel", "School"];

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setLeads, clearAll } = useApp();
  const [niche, setNiche] = useState("Dentist");
  const [city, setCity] = useState("London");
  const [count, setCount] = useState("12");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  async function handleSearch() {
    if (!niche.trim() || !city.trim()) return;
    setLoading(true);
    setError(null);
    setSource(null);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      clearAll();
      const data = await scrapeLeads({ niche: niche.trim(), city: city.trim(), count: Math.min(50, Math.max(1, Number(count) || 12)) });
      if (data.error && data.leads.length === 0) {
        setError(data.error);
        return;
      }
      setLeads(data.leads);
      setSource(data.source === "apify" ? "Google Maps" : "OpenStreetMap");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push("/(tabs)/leads");
    } catch (e: unknown) {
      setError((e as Error).message ?? "Search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: topPad + 16 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={[styles.iconBox, { backgroundColor: colors.primary, borderRadius: colors.radius }]}>
            <Feather name="zap" size={22} color={colors.primaryForeground} />
          </View>
          <View>
            <Text style={[styles.appTitle, { color: colors.foreground }]}>Lead → Launch</Text>
            <Text style={[styles.appSub, { color: colors.mutedForeground }]}>Find clients · Audit · Pitch</Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Find businesses</Text>

          <Text style={[styles.label, { color: colors.mutedForeground }]}>NICHE / BUSINESS TYPE</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: colors.radius - 2, color: colors.foreground }]}
            value={niche}
            onChangeText={setNiche}
            placeholder="e.g. Dentist, Salon, Gym"
            placeholderTextColor={colors.mutedForeground}
            returnKeyType="next"
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
            {QUICK_NICHES.map((n) => (
              <Pressable
                key={n}
                onPress={() => setNiche(n)}
                style={[
                  styles.pill,
                  {
                    backgroundColor: niche === n ? colors.primary : colors.muted,
                    borderRadius: 20,
                  },
                ]}
              >
                <Text style={[styles.pillText, { color: niche === n ? colors.primaryForeground : colors.mutedForeground }]}>{n}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={[styles.label, { color: colors.mutedForeground }]}>CITY / LOCATION</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: colors.radius - 2, color: colors.foreground }]}
            value={city}
            onChangeText={setCity}
            placeholder="e.g. London, Paris, Tokyo"
            placeholderTextColor={colors.mutedForeground}
            returnKeyType="next"
          />

          <Text style={[styles.label, { color: colors.mutedForeground }]}>COUNT (MAX 50)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: colors.radius - 2, color: colors.foreground }]}
            value={count}
            onChangeText={setCount}
            placeholder="12"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="number-pad"
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: colors.destructive + "15", borderRadius: colors.radius - 2 }]}>
              <Feather name="alert-circle" size={14} color={colors.destructive} />
              <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
            </View>
          ) : null}

          {source ? (
            <View style={[styles.sourceBox, { backgroundColor: colors.success + "15", borderRadius: colors.radius - 2 }]}>
              <Feather name="check-circle" size={14} color={colors.success} />
              <Text style={[styles.sourceText, { color: colors.success }]}>Loaded via {source}</Text>
            </View>
          ) : null}

          <Pressable
            onPress={handleSearch}
            disabled={loading}
            style={({ pressed }) => [
              styles.searchBtn,
              { backgroundColor: loading ? colors.muted : colors.primary, borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            {loading ? (
              <ActivityIndicator color={colors.primaryForeground} size="small" />
            ) : (
              <>
                <Feather name="search" size={16} color={colors.primaryForeground} />
                <Text style={[styles.searchBtnText, { color: colors.primaryForeground }]}>Find leads</Text>
              </>
            )}
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Feather name="globe" size={13} color={colors.mutedForeground} />
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>Worldwide · Real data · Free via OpenStreetMap</Text>
        </View>
        <View style={{ height: Platform.OS === "web" ? 34 : insets.bottom + 80 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 },
  iconBox: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  appTitle: { fontSize: 22, fontFamily: "Inter_700Bold", lineHeight: 26 },
  appSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  card: { borderWidth: 1, padding: 18, marginBottom: 16 },
  cardTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", marginBottom: 18 },
  label: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" },
  input: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15, fontFamily: "Inter_400Regular", marginBottom: 14 },
  pillRow: { marginBottom: 18, marginTop: -6 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
  pillText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, marginBottom: 12 },
  errorText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  sourceBox: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, marginBottom: 12 },
  sourceText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  searchBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14 },
  searchBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  footer: { flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "center", marginTop: 8 },
  footerText: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
