import React from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { imgUrl, type Movie } from '@/lib/tmdb';

const { width } = Dimensions.get('window');
export const CARD_WIDTH = width * 0.3;

interface Props {
  movie: Movie;
  onPress: () => void;
  cardWidth?: number;
}

export function MovieCard({ movie, onPress, cardWidth = CARD_WIDTH }: Props) {
  const colors = useColors();
  const h = cardWidth * 1.5;
  const poster = imgUrl(movie.poster_path, 'w500');
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '—';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.78} style={{ width: cardWidth }}>
      <View
        style={[
          styles.posterWrap,
          {
            width: cardWidth,
            height: h,
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
              { borderRadius: colors.radius, backgroundColor: colors.card },
            ]}
          >
            <Ionicons name="film-outline" size={28} color={colors.mutedForeground} />
          </View>
        )}
        <View style={styles.badge}>
          <Ionicons name="star" size={9} color={colors.accent} />
          <Text
            style={[
              styles.badgeText,
              { color: colors.accent, fontFamily: 'Inter_600SemiBold' },
            ]}
          >
            {rating}
          </Text>
        </View>
      </View>
      <Text
        style={[
          styles.title,
          { color: colors.foreground, fontFamily: 'Inter_500Medium' },
        ]}
        numberOfLines={2}
      >
        {movie.title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  posterWrap: {
    overflow: 'hidden',
  },
  noImg: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.72)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    gap: 2,
  },
  badgeText: {
    fontSize: 10,
  },
  title: {
    fontSize: 12,
    marginTop: 6,
    lineHeight: 16,
  },
});
