import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import {
  fetchMovieDetail,
  fetchMovieCast,
  imgUrl,
  type CastMember,
  type Movie,
} from '@/lib/tmdb';
import { useFavorites } from '@/context/FavoritesContext';

const { width, height } = Dimensions.get('window');
const BACKDROP_H = height * 0.42;

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const { toggleFavorite, isFavorite } = useFavorites();

  const movieId = Number(id);

  const { data: movie, isLoading, error } = useQuery({
    queryKey: ['movie', movieId],
    queryFn: () => fetchMovieDetail(movieId),
    enabled: !!movieId,
  });

  const { data: cast = [] } = useQuery({
    queryKey: ['cast', movieId],
    queryFn: () => fetchMovieCast(movieId),
    enabled: !!movieId,
  });

  const fav = movie ? isFavorite(movie.id) : false;

  const handleToggleFav = () => {
    if (!movie) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const m: Movie = {
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      vote_average: movie.vote_average,
      release_date: movie.release_date,
      overview: movie.overview,
    };
    toggleFavorite(m);
  };

  const handlePlay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push(`/player/${movieId}`);
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !movie) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="warning-outline" size={48} color={colors.mutedForeground} />
        <Text style={[styles.errText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          No se pudo cargar la película
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
          <Ionicons name="arrow-back" size={18} color={colors.primary} />
          <Text style={[{ color: colors.primary, fontFamily: 'Inter_500Medium', marginLeft: 6, fontSize: 15 }]}>
            Volver
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const backdropUrl = imgUrl(movie.backdrop_path, 'original');
  const posterUrl = imgUrl(movie.poster_path, 'w500');
  const year = movie.release_date?.slice(0, 4) ?? '';
  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : '';

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 34 : 48 }}
      >
        {/* Backdrop */}
        <View style={[styles.backdrop, { height: BACKDROP_H }]}>
          {backdropUrl ? (
            <Image source={{ uri: backdropUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : null}
          <LinearGradient
            colors={['rgba(11,11,15,0)', 'rgba(11,11,15,0.55)', '#0B0B0F']}
            locations={[0.3, 0.7, 1]}
            style={StyleSheet.absoluteFill}
          />
        </View>

        {/* Floating action row */}
        <View style={[styles.topBtns, { top: topPad + 8 }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.circleBtn, { backgroundColor: 'rgba(0,0,0,0.55)' }]}
          >
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleToggleFav}
            style={[styles.circleBtn, { backgroundColor: fav ? colors.primary : 'rgba(0,0,0,0.55)' }]}
          >
            <Ionicons name={fav ? 'bookmark' : 'bookmark-outline'} size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Info block */}
        <View style={[styles.info, { marginTop: -40 }]}>
          {/* Poster + title */}
          <View style={styles.titleRow}>
            {posterUrl ? (
              <Image
                source={{ uri: posterUrl }}
                style={[
                  styles.miniPoster,
                  { backgroundColor: colors.card, borderRadius: colors.radius },
                ]}
                resizeMode="cover"
              />
            ) : null}
            <View style={styles.titleCol}>
              <Text
                style={[styles.movieTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}
              >
                {movie.title}
              </Text>
              {movie.tagline ? (
                <Text
                  style={[styles.tagline, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}
                >
                  {movie.tagline}
                </Text>
              ) : null}
              <View style={styles.metaRow}>
                <Ionicons name="star" size={12} color={colors.accent} />
                <Text style={[styles.metaItem, { color: colors.accent, fontFamily: 'Inter_600SemiBold' }]}>
                  {movie.vote_average.toFixed(1)}
                </Text>
                {year ? (
                  <Text style={[styles.metaItem, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                    · {year}
                  </Text>
                ) : null}
                {runtime ? (
                  <Text style={[styles.metaItem, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                    · {runtime}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>

          {/* Genres */}
          {movie.genres?.length > 0 && (
            <View style={styles.genres}>
              {movie.genres.map((g) => (
                <View
                  key={g.id}
                  style={[
                    styles.chip,
                    { backgroundColor: colors.secondary, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.chipText, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>
                    {g.name}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Watch button */}
          <TouchableOpacity
            onPress={handlePlay}
            style={[styles.playBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.84}
          >
            <Ionicons name="play" size={20} color="#fff" />
            <Text style={[styles.playBtnText, { fontFamily: 'Inter_700Bold' }]}>
              Ver Película
            </Text>
          </TouchableOpacity>

          {/* Overview */}
          {movie.overview ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
                Sinopsis
              </Text>
              <Text style={[styles.overview, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                {movie.overview}
              </Text>
            </View>
          ) : null}

          {/* Cast */}
          {cast.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
                Reparto
              </Text>
              <FlatList
                horizontal
                data={cast}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <CastCard member={item} />}
                ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
                showsHorizontalScrollIndicator={false}
                scrollEnabled={!!cast.length}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function CastCard({ member }: { member: CastMember }) {
  const colors = useColors();
  const profileUrl = imgUrl(member.profile_path, 'w185');
  return (
    <View style={castStyles.card}>
      <View style={[castStyles.avatar, { backgroundColor: colors.card }]}>
        {profileUrl ? (
          <Image
            source={{ uri: profileUrl }}
            style={[StyleSheet.absoluteFill, { borderRadius: 36 }]}
            resizeMode="cover"
          />
        ) : (
          <Ionicons name="person-outline" size={26} color={colors.mutedForeground} />
        )}
      </View>
      <Text
        style={[castStyles.name, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}
        numberOfLines={2}
      >
        {member.name}
      </Text>
      <Text
        style={[castStyles.char, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}
        numberOfLines={2}
      >
        {member.character}
      </Text>
    </View>
  );
}

const castStyles = StyleSheet.create({
  card: { width: 72, alignItems: 'center' },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 36,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 11, textAlign: 'center', marginTop: 6, lineHeight: 14 },
  char: { fontSize: 10, textAlign: 'center', marginTop: 2, lineHeight: 13 },
});

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errText: { fontSize: 15, textAlign: 'center' },
  backLink: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },

  backdrop: { width, overflow: 'hidden' },
  topBtns: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    zIndex: 10,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  info: { paddingHorizontal: 18 },
  titleRow: { flexDirection: 'row', gap: 14, marginBottom: 14 },
  miniPoster: { width: 80, height: 120, flexShrink: 0 },
  titleCol: { flex: 1, justifyContent: 'flex-end' },
  movieTitle: { fontSize: 22, lineHeight: 28, marginBottom: 4 },
  tagline: { fontSize: 13, fontStyle: 'italic', marginBottom: 6, lineHeight: 18 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  metaItem: { fontSize: 13 },

  genres: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 12 },

  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 24,
  },
  playBtnText: { color: '#fff', fontSize: 16 },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, marginBottom: 10 },
  overview: { fontSize: 14, lineHeight: 22 },
});
