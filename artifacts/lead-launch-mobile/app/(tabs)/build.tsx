import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import type { RankedLead } from "@/lib/types";

const PLATFORMS = [
  { id: "lovable", label: "Lovable", icon: "zap", url: "https://lovable.dev" },
  { id: "bolt", label: "Bolt.new", icon: "cpu", url: "https://bolt.new" },
  { id: "claude-code", label: "Claude Code", icon: "terminal", url: "https://claude.ai/claude-code" },
  { id: "codex", label: "Codex", icon: "code", url: "https://chat.openai.com" },
] as const;

function buildPrompt(l: RankedLead, platform: string): string {
  const name = l.name;
  const niche = l.category;
  const phone = l.phone ?? "+XX XXXXX XXXXX";
  const whatsapp = l.whatsapp ?? phone;
  const addr = l.address;
  const rating = l.rating ?? 4.5;
  const reviews = l.reviewsCount ?? 0;
  const gap = l.audit.biggestGap;

  const outputInstruction =
    platform === "lovable" || platform === "bolt"
      ? "OUTPUT: Single React + Tailwind page. No backend."
      : platform === "claude-code"
        ? "OUTPUT: Next.js 15 app with app router, Tailwind, shadcn. Single landing page route."
        : "OUTPUT: Static HTML + Tailwind CDN. Single index.html, self-contained.";

  return `You are building a high-converting local-business website for a ${niche}.

# BUSINESS
Name: ${name}
Category: ${niche}
Address: ${addr}
Phone: ${phone}
WhatsApp: ${whatsapp}
Google rating: ${rating}★ (${reviews} reviews)
Biggest current gap: ${gap}

# DESIGN
- Mobile-first. Hero CTA visible above fold.
- Premium local-business aesthetic for a ${niche}. Off-white base + one deep accent colour.
- Inter or DM Sans font. Large H1. Generous whitespace. Trust signals everywhere.
- Floating WhatsApp button (bottom-right) on every page.
- Click-to-call phone in header.

# SECTIONS (in order)
1. Hero: Business name + 1-line promise + "Book on WhatsApp" CTA + rating badge
2. Trust strip: "${rating}★ · ${reviews}+ reviews · ${l.yearsInBusiness ?? 8}+ years"
3. Services grid: 6 cards with icons
4. About + owner bio: 2-col layout
5. Gallery placeholder (3x2 grid)
6. Reviews carousel: 6 review snippets
7. FAQ accordion: 5 questions a first-time ${niche} customer asks
8. Location map embed of ${addr} + business hours table
9. Footer: WhatsApp + Phone + Address + Hours

# SEO & TECHNICAL
- Meta: "${name} | ${niche} in ${l.city}"
- LocalBusiness schema markup in JSON-LD
- Lighthouse mobile 90+

${outputInstruction}

Generate now. Then list 3 sentences to show the owner why this beats their current ${l.audit.hasWebsite ? "outdated site" : "Google listing only"}.`;
}

export default function BuildScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { selectedRanked } = useApp();
  const [platform, setPlatform] = useState<"lovable" | "bolt" | "claude-code" | "codex">("lovable");
  const [copied, setCopied] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const prompt = selectedRanked ? buildPrompt(selectedRanked, platform) : "";

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [platform, selectedRanked]);

  async function copyPrompt() {
    await Clipboard.setStringAsync(prompt);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function openPlatform() {
    const url = PLATFORMS.find((p) => p.id === platform)?.url;
    if (url) Linking.openURL(url);
  }

  if (!selectedRanked) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.background, paddingTop: topPad }]}>
        <Feather name="zap" size={36} color={colors.border} />
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No lead selected</Text>
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
          Pick a lead from the Leads tab to generate a website prompt
        </Text>
        <Pressable
          onPress={() => router.push("/(tabs)/leads")}
          style={[styles.goBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
        >
          <Text style={[styles.goBtnText, { color: colors.primaryForeground }]}>Go to Leads</Text>
        </Pressable>
      </View>
    );
  }

  const selectedPlatform = PLATFORMS.find((p) => p.id === platform)!;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroRow}>
        <View style={[styles.iconBox, { backgroundColor: colors.primary, borderRadius: colors.radius }]}>
          <Feather name="zap" size={20} color={colors.primaryForeground} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.heroTitle, { color: colors.foreground }]} numberOfLines={1}>
            {selectedRanked.name}
          </Text>
          <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>
            Generating for {selectedPlatform.label}
          </Text>
        </View>
      </View>

      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>SELECT PLATFORM</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.platformRow}>
        {PLATFORMS.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => {
              setPlatform(p.id);
              fadeAnim.setValue(0);
            }}
            style={[
              styles.platformBtn,
              {
                backgroundColor: platform === p.id ? colors.primary : colors.card,
                borderColor: platform === p.id ? colors.primary : colors.border,
                borderRadius: colors.radius,
              },
            ]}
          >
            <Feather
              name={p.icon as "zap"}
              size={14}
              color={platform === p.id ? colors.primaryForeground : colors.mutedForeground}
            />
            <Text
              style={[
                styles.platformLabel,
                { color: platform === p.id ? colors.primaryForeground : colors.foreground },
              ]}
            >
              {p.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={[styles.promptCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <View style={styles.promptHeader}>
          <Text style={[styles.promptTitle, { color: colors.foreground }]}>Generated prompt</Text>
          <View style={styles.promptActions}>
            <Pressable
              onPress={copyPrompt}
              style={[styles.actionBtn, { backgroundColor: copied ? colors.success : colors.primary, borderRadius: colors.radius - 4 }]}
            >
              <Feather name={copied ? "check" : "copy"} size={14} color={colors.primaryForeground} />
              <Text style={[styles.actionLabel, { color: colors.primaryForeground }]}>
                {copied ? "Copied!" : "Copy"}
              </Text>
            </Pressable>
            <Pressable
              onPress={openPlatform}
              style={[styles.actionBtn, { backgroundColor: colors.muted, borderRadius: colors.radius - 4 }]}
            >
              <Feather name="external-link" size={14} color={colors.mutedForeground} />
              <Text style={[styles.actionLabel, { color: colors.mutedForeground }]}>Open</Text>
            </Pressable>
          </View>
        </View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={[styles.promptBox, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: colors.radius - 4 }]}>
            <Text style={[styles.promptText, { color: colors.foreground }]}>{prompt}</Text>
          </View>
        </Animated.View>

        <View style={styles.hint}>
          <Feather name="info" size={12} color={colors.mutedForeground} />
          <Text style={[styles.hintText, { color: colors.mutedForeground }]}>
            Copy prompt → Open {selectedPlatform.label} → Paste → Build
          </Text>
        </View>
      </View>

      <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <Text style={[styles.statsTitle, { color: colors.foreground }]}>What this site will fix</Text>
        {[
          { icon: "alert-circle", text: selectedRanked.audit.biggestGap },
          { icon: "smartphone", text: "Mobile-first with WhatsApp CTA above the fold" },
          { icon: "star", text: `Showcase ${selectedRanked.reviewsCount ?? 0} reviews as social proof` },
        ].map((item, i) => (
          <View key={i} style={styles.statRow}>
            <Feather name={item.icon as "star"} size={14} color={colors.accent} />
            <Text style={[styles.statText, { color: colors.foreground }]}>{item.text}</Text>
          </View>
        ))}
      </View>

      <Pressable
        onPress={() => router.push("/(tabs)/outreach")}
        style={({ pressed }) => [
          styles.nextBtn,
          { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <Feather name="send" size={16} color={colors.primaryForeground} />
        <Text style={[styles.nextBtnText, { color: colors.primaryForeground }]}>Draft outreach messages</Text>
      </Pressable>

      <View style={{ height: Platform.OS === "web" ? 34 : insets.bottom + 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_600SemiBold", marginTop: 12 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  goBtn: { marginTop: 12, paddingHorizontal: 24, paddingVertical: 12 },
  goBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  heroRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  iconBox: { width: 42, height: 42, alignItems: "center", justifyContent: "center" },
  heroTitle: { fontSize: 17, fontFamily: "Inter_700Bold", lineHeight: 21 },
  heroSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  sectionLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 },
  platformRow: { marginBottom: 18 },
  platformBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 9, marginRight: 8, borderWidth: 1 },
  platformLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  promptCard: { borderWidth: 1, padding: 14, marginBottom: 14 },
  promptHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  promptTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  promptActions: { flexDirection: "row", gap: 8 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8 },
  actionLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  promptBox: { borderWidth: 1, padding: 12, maxHeight: 320 },
  promptText: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 19 },
  hint: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 },
  hintText: { fontSize: 12, fontFamily: "Inter_400Regular", flex: 1 },
  statsCard: { borderWidth: 1, padding: 14, marginBottom: 14 },
  statsTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 12 },
  statRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  statText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 19 },
  nextBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 15, marginBottom: 8 },
  nextBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
