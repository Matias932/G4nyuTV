import React from 'react';
import {
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import {
  fetchTrending,
  fetchPopular,
  fetchTopRated,
  fetchMarvel,
  fetchAction,
  hasApiKey,
  imgUrl,
  type Movie,
} from '@/lib/tmdb';
import { SectionRow } from '@/components/SectionRow';

const { width, height } = Dimensions.get('window');
const HERO_H = height * 0.52;
const HEADER_H = 50;

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const apiReady = hasApiKey();

  const { data: trending = [], isLoading: tL } = useQuery({
    queryKey: ['trending'],
    queryFn: fetchTrending,
    enabled: apiReady,
  });

  const { data: popular = [], isLoading: pL } = useQuery({
    queryKey: ['popular'],
    queryFn: fetchPopular,
    enabled: apiReady,
  });

  const { data: marvel = [], isLoading: mL } = useQuery({
    queryKey: ['marvel'],
    queryFn: fetchMarvel,
    enabled: apiReady,
  });

  const { data: topRated = [], isLoading: trL } = useQuery({
    queryKey: ['topRated'],
    queryFn: fetchTopRated,
    enabled: apiReady,
  });

  const { data: action = [], isLoading: aL } = useQuery({
    queryKey: ['action'],
    queryFn: fetchAction,
    enabled: apiReady,
  });

  const hero: Movie | null = trending[0] ?? null;
  const heroBackdrop = hero ? imgUrl(hero.backdrop_path, 'original') : '';

  const goToMovie = (movie: Movie) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/movie/${movie.id}`);
  };

  const goToPlayer = (id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/player/${id}`);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Floating header */}
      <View style={[styles.header, { paddingTop: topPad }]}>
        <Text style={[styles.logo, { color: colors.primary, fontFamily: 'Inter_700Bold' }]}>
          STREAMFLIX
        </Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/search')} hitSlop={10}>
          <Ionicons name="search-outline" size={24} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {!apiReady ? (
        /* ── No API key ── */
        <View style={[styles.setupWrap, { paddingTop: topPad + HEADER_H + 20 }]}>
          <Ionicons name="film-outline" size={72} color={colors.mutedForeground} />
          <Text
            style={[styles.setupTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}
          >
            Configura la API
          </Text>
          <Text
            style={[
              styles.setupBody,
              { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
            ]}
          >
            Agrega tu clave gratuita de TMDB{'\n'}para ver el catálogo completo.
          </Text>
          <View style={[styles.codeBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.codeText, { color: colors.accent, fontFamily: 'Inter_500Medium' }]}>
              EXPO_PUBLIC_TMDB_KEY
            </Text>
          </View>
          <Text
            style={[styles.setupHint, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}
          >
            Regístrate gratis en themoviedb.org
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: Platform.OS === 'web' ? 34 + 84 : 110,
          }}
        >
          {/* ── Hero ── */}
          {hero && (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => goToMovie(hero)}
              style={[styles.hero, { height: HERO_H }]}
            >
              {heroBackdrop ? (
                <Image
                  source={{ uri: heroBackdrop }}
                  style={StyleSheet.absoluteFill}
                  resizeMode="cover"
                />
              ) : null}
              <LinearGradient
                colors={['rgba(11,11,15,0)', 'rgba(11,11,15,0.55)', '#0B0B0F']}
                locations={[0.2, 0.65, 1]}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.heroContent}>
                <Text
                  style={[styles.heroTitle, { fontFamily: 'Inter_700Bold' }]}
                  numberOfLines={2}
                >
                  {hero.title}
                </Text>
                <View style={styles.heroMeta}>
                  <Ionicons name="star" size={13} color={colors.accent} />
                  <Text
                    style={[styles.heroRating, { color: colors.accent, fontFamily: 'Inter_600SemiBold' }]}
                  >
                    {hero.vote_average.toFixed(1)}
                  </Text>
                  <Text
                    style={[styles.heroYear, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}
                  >
                    · {hero.release_date?.slice(0, 4)}
                  </Text>
                </View>
                <View style={styles.heroBtns}>
                  <TouchableOpacity
                    style={[styles.btnPlay, { backgroundColor: colors.primary }]}
                    onPress={() => goToPlayer(hero.id)}
                    activeOpacity={0.82}
                  >
                    <Ionicons name="play" size={16} color="#fff" />
                    <Text style={[styles.btnLabel, { color: '#fff', fontFamily: 'Inter_700Bold' }]}>
                      Ver ahora
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.btnInfo,
                      {
                        backgroundColor: 'rgba(255,255,255,0.14)',
                        borderColor: 'rgba(255,255,255,0.28)',
                      },
                    ]}
                    onPress={() => goToMovie(hero)}
                    activeOpacity={0.82}
                  >
                    <Ionicons name="information-circle-outline" size={18} color="#fff" />
                    <Text style={[styles.btnLabel, { color: '#fff', fontFamily: 'Inter_500Medium' }]}>
                      Más info
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )}

          {/* ── Sections ── */}
          <View style={{ paddingTop: hero ? 10 : topPad + HEADER_H + 10 }}>
            <SectionRow
              title="Tendencias"
              movies={trending.slice(1)}
              onMoviePress={goToMovie}
              isLoading={tL}
            />
            <SectionRow
              title="Marvel Studios"
              movies={marvel}
              onMoviePress={goToMovie}
              isLoading={mL}
            />
            <SectionRow
              title="Populares"
              movies={popular}
              onMoviePress={goToMovie}
              isLoading={pL}
            />
            <SectionRow
              title="Acción"
              movies={action}
              onMoviePress={goToMovie}
              isLoading={aL}
            />
            <SectionRow
              title="Mejor Valoradas"
              movies={topRated}
              onMoviePress={goToMovie}
              isLoading={trL}
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  logo: {
    fontSize: 22,
    letterSpacing: 2,
  },

  hero: {
    width,
    justifyContent: 'flex-end',
  },
  heroContent: {
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    color: '#fff',
    marginBottom: 6,
    lineHeight: 34,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  heroRating: { fontSize: 13 },
  heroYear: { fontSize: 13 },
  heroBtns: {
    flexDirection: 'row',
    gap: 10,
  },
  btnPlay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 6,
  },
  btnInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  btnLabel: { fontSize: 14 },

  setupWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  setupTitle: {
    fontSize: 22,
    marginTop: 8,
  },
  setupBody: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  codeBox: {
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  codeText: { fontSize: 13 },
  setupHint: {
    fontSize: 12,
    marginTop: 2,
  },
});
