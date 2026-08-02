import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { searchMovies, imgUrl, type Movie } from '@/lib/tmdb';

const { width } = Dimensions.get('window');
const NUM_COLS = 3;
const ITEM_W = (width - 32 - (NUM_COLS - 1) * 10) / NUM_COLS;

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 450);
    return () => clearTimeout(t);
  }, [query]);

  const { data: results = [], isLoading, isFetching } = useQuery({
    queryKey: ['search', debounced],
    queryFn: () => searchMovies(debounced),
    enabled: debounced.length > 1,
  });

  const searching = debounced.length > 1;
  const busy = isLoading || isFetching;

  const goToMovie = (movie: Movie) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/movie/${movie.id}`);
  };

  const renderItem = ({ item }: { item: Movie }) => {
    const poster = imgUrl(item.poster_path, 'w500');
    return (
      <TouchableOpacity
        onPress={() => goToMovie(item)}
        activeOpacity={0.78}
        style={{ width: ITEM_W }}
      >
        <View
          style={[
            styles.poster,
            {
              width: ITEM_W,
              height: ITEM_W * 1.5,
              backgroundColor: colors.card,
              borderRadius: colors.radius,
            },
          ]}
        >
          {poster ? (
            <Image
              source={{ uri: poster }}
              style={[StyleSheet.absoluteFill, { borderRadius: colors.radius }]}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                styles.noImg,
                { borderRadius: colors.radius },
              ]}
            >
              <Ionicons name="film-outline" size={28} color={colors.mutedForeground} />
            </View>
          )}
        </View>
        <Text
          style={[styles.itemTitle, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}
          numberOfLines={2}
        >
          {item.title}
        </Text>
        <Text
          style={[styles.itemYear, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}
        >
          {item.release_date?.slice(0, 4)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Search bar */}
      <View
        style={[
          styles.searchBar,
          {
            paddingTop: topPad + 10,
            backgroundColor: colors.background,
          },
        ]}
      >
        <View
          style={[
            styles.inputRow,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <Ionicons name="search-outline" size={20} color={colors.mutedForeground} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar película…"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
            returnKeyType="search"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
          {busy && searching && (
            <ActivityIndicator size="small" color={colors.primary} />
          )}
        </View>
      </View>

      {!searching ? (
        <View style={styles.emptyState}>
          <Ionicons name="film-outline" size={64} color={colors.mutedForeground} />
          <Text
            style={[styles.emptyTitle, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}
          >
            Busca tus películas
          </Text>
          <Text
            style={[
              styles.emptyBody,
              { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
            ]}
          >
            Escribe el nombre de una película{'\n'}para empezar
          </Text>
        </View>
      ) : results.length === 0 && !busy ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={64} color={colors.mutedForeground} />
          <Text
            style={[styles.emptyTitle, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}
          >
            Sin resultados
          </Text>
          <Text
            style={[
              styles.emptyBody,
              { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
            ]}
          >
            No encontramos nada para{'\n'}"{debounced}"
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={NUM_COLS}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: Platform.OS === 'web' ? 34 + 84 : 110 },
          ]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!results.length}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  searchBar: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 15,
    padding: 0,
    margin: 0,
  },
  list: { paddingHorizontal: 16 },
  row: {
    gap: 10,
    marginBottom: 16,
  },
  poster: { overflow: 'hidden' },
  noImg: { alignItems: 'center', justifyContent: 'center' },
  itemTitle: {
    fontSize: 11,
    marginTop: 6,
    lineHeight: 15,
  },
  itemYear: {
    fontSize: 11,
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 32,
  },
  emptyTitle: { fontSize: 18, marginTop: 8 },
  emptyBody: { fontSize: 14, textAlign: 'center', lineHeight: 21 },
});
