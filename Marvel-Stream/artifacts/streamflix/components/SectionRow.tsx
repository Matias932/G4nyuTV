import React, { useEffect, useRef } from 'react';
import { Animated, FlatList, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { type Movie } from '@/lib/tmdb';
import { MovieCard, CARD_WIDTH } from './MovieCard';

interface Props {
  title: string;
  movies: Movie[];
  onMoviePress: (movie: Movie) => void;
  isLoading?: boolean;
}

function SkeletonCard() {
  const colors = useColors();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 900, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={{
        opacity,
        width: CARD_WIDTH,
        height: CARD_WIDTH * 1.5,
        backgroundColor: colors.card,
        borderRadius: 10,
      }}
    />
  );
}

export function SectionRow({ title, movies, onMoviePress, isLoading }: Props) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      <Text
        style={[styles.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}
      >
        {title}
      </Text>

      {isLoading ? (
        <View style={styles.skeletonRow}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={{ marginRight: 10 }}>
              <SkeletonCard />
            </View>
          ))}
        </View>
      ) : movies.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Sin resultados
          </Text>
        </View>
      ) : (
        <FlatList
          horizontal
          data={movies}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <MovieCard movie={item} onPress={() => onMoviePress(item)} />
          )}
          ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
          contentContainerStyle={styles.listContent}
          showsHorizontalScrollIndicator={false}
          scrollEnabled={!!movies.length}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 28,
  },
  title: {
    fontSize: 18,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  skeletonRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  empty: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  emptyText: {
    fontSize: 14,
  },
});
