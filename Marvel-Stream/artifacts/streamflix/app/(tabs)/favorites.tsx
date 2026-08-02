import React from 'react';
import {
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useFavorites } from '@/context/FavoritesContext';
import { MovieCard } from '@/components/MovieCard';
import type { Movie } from '@/lib/tmdb';

const { width } = Dimensions.get('window');
const NUM_COLS = 3;
const ITEM_W = (width - 32 - (NUM_COLS - 1) * 10) / NUM_COLS;

export default function FavoritesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const { favorites } = useFavorites();

  const goToMovie = (movie: Movie) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/movie/${movie.id}`);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 14, backgroundColor: colors.background },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
          Mis Favoritos
        </Text>
        {favorites.length > 0 && (
          <Text
            style={[styles.count, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}
          >
            {favorites.length} {favorites.length === 1 ? 'película' : 'películas'}
          </Text>
        )}
      </View>

      {favorites.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="bookmark-outline" size={72} color={colors.mutedForeground} />
          <Text
            style={[styles.emptyTitle, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}
          >
            Sin favoritos
          </Text>
          <Text
            style={[
              styles.emptyBody,
              { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
            ]}
          >
            Marca películas como favoritas{'\n'}para verlas aquí
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id.toString()}
          numColumns={NUM_COLS}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: Platform.OS === 'web' ? 34 + 84 : 110 },
          ]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <MovieCard
              movie={item}
              onPress={() => goToMovie(item)}
              cardWidth={ITEM_W}
            />
          )}
          scrollEnabled={!!favorites.length}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 18,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  title: { fontSize: 26 },
  count: { fontSize: 14, marginBottom: 2 },
  list: { paddingHorizontal: 16 },
  row: {
    gap: 10,
    marginBottom: 16,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 32,
  },
  emptyTitle: { fontSize: 20, marginTop: 8 },
  emptyBody: { fontSize: 14, textAlign: 'center', lineHeight: 21 },
});
