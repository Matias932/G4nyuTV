import React, { useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

// react-native-webview is native-only; load conditionally for web compat
const WebViewNative: React.ComponentType<any> | null =
  Platform.OS !== 'web'
    ? (require('react-native-webview').WebView as React.ComponentType<any>)
    : null;

export default function PlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const streamUrl = `https://vidsrc.to/embed/movie/${id}`;
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  // ── Web fallback ──────────────────────────────────────────────────────────
  if (Platform.OS === 'web' || !WebViewNative) {
    return (
      <View style={[styles.root, { backgroundColor: '#000' }]}>
        <View style={styles.fallbackContent}>
          <Ionicons name="play-circle-outline" size={72} color={colors.primary} />
          <Text style={[styles.fallbackTitle, { color: '#fff', fontFamily: 'Inter_600SemiBold' }]}>
            Reproducción externa
          </Text>
          <Text style={[styles.fallbackBody, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            El reproductor embebido no está{'\n'}disponible en web.
          </Text>
          <TouchableOpacity
            style={[styles.openBtn, { backgroundColor: colors.primary }]}
            onPress={() => Linking.openURL(streamUrl)}
          >
            <Ionicons name="open-outline" size={18} color="#fff" />
            <Text style={[styles.openBtnText, { color: '#fff', fontFamily: 'Inter_700Bold' }]}>
              Abrir en navegador
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.backBtn, { top: topPad + 8 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (loadError) {
    return (
      <View style={[styles.root, { backgroundColor: '#000' }]}>
        <View style={styles.fallbackContent}>
          <Ionicons name="warning-outline" size={60} color={colors.mutedForeground} />
          <Text style={[styles.fallbackTitle, { color: '#fff', fontFamily: 'Inter_500Medium' }]}>
            Error al cargar
          </Text>
          <TouchableOpacity
            style={[styles.openBtn, { backgroundColor: colors.primary }]}
            onPress={() => Linking.openURL(streamUrl)}
          >
            <Ionicons name="open-outline" size={18} color="#fff" />
            <Text style={[styles.openBtnText, { color: '#fff', fontFamily: 'Inter_700Bold' }]}>
              Abrir en navegador
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.backBtn, { top: insets.top + 8 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }

  // ── Native WebView player ─────────────────────────────────────────────────
  return (
    <View style={[styles.root, { backgroundColor: '#000' }]}>
      <WebViewNative
        source={{ uri: streamUrl }}
        style={styles.webview}
        allowsFullscreenVideo
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        onLoadEnd={() => setLoading(false)}
        onError={() => { setLoading(false); setLoadError(true); }}
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            Cargando reproductor…
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.backBtn, { top: insets.top + 8 }]}
        onPress={() => router.back()}
      >
        <Ionicons name="chevron-back" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  webview: { flex: 1 },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    gap: 12,
  },
  loadingText: { fontSize: 14 },
  backBtn: {
    position: 'absolute',
    left: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  fallbackContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  fallbackTitle: { fontSize: 18, textAlign: 'center' },
  fallbackBody: { fontSize: 14, textAlign: 'center', lineHeight: 21 },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  openBtnText: { fontSize: 15 },
});
