import React from 'react'
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Image,
  useColorScheme,
  Animated,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, useCallback, useRef, useEffect } from 'react'
import { useSearch } from '@/hooks/useSearch'
import { debounce } from '@/lib/utils'

const MOOD_FILTERS = [
  'Solitude', 'Deep Focus', 'Creative Flow',
  'Restorative Sleep', 'Vibrant Energy', 'Nature Escape',
]

function SearchSkeleton({ isDark }: { isDark: boolean }) {
  const anim = useRef(new Animated.Value(0.4)).current
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    ).start()
  }, [])
  const bg = isDark ? '#282a28' : '#e5e7e3'
  const card = isDark ? '#1a191b' : '#f0f0ec'
  return (
    <Animated.View style={{ opacity: anim }}>
      {[1,2,3].map(i => (
        <View key={i} style={{ backgroundColor: card, borderRadius: 16, marginBottom: 12, overflow: 'hidden' }}>
          {i === 1 && <View style={{ height: 160, backgroundColor: bg }} />}
          <View style={{ padding: 16 }}>
            <View style={{ height: 10, width: '40%', backgroundColor: bg, borderRadius: 6, marginBottom: 10 }} />
            <View style={{ height: 18, width: '75%', backgroundColor: bg, borderRadius: 6, marginBottom: 8 }} />
            <View style={{ height: 12, width: '90%', backgroundColor: bg, borderRadius: 6, marginBottom: 4 }} />
            <View style={{ height: 12, width: '60%', backgroundColor: bg, borderRadius: 6, marginBottom: 16 }} />
            <View style={{ height: 36, width: '40%', backgroundColor: bg, borderRadius: 99, alignSelf: 'flex-end' }} />
          </View>
        </View>
      ))}
    </Animated.View>
  )
}

export default function SearchScreen() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const [query, setQuery] = useState('')
  const [activeMoods, setActiveMoods] = useState<string[]>([])
  const { results, isLoading, search, requiresLocation } = useSearch()

  const accentColor = isDark ? '#93d2d1' : '#156a67'
  const bg = isDark ? '#0e0e0f' : '#faf9f6'
  const cardBg = isDark ? '#1a191b' : '#f0f0ec'
  const textPrimary = isDark ? '#ffffff' : '#1a1a1a'
  const textSecondary = isDark ? '#bfc8c8' : '#5d605c'

  const debouncedSearch = useCallback(
    debounce((q: string, moods: string[]) => search(q, moods), 500),
    [search],
  )

  const handleQueryChange = (text: string) => {
    setQuery(text)
    if (text.length > 1 || activeMoods.length) debouncedSearch(text, activeMoods)
  }

  const toggleMood = (mood: string) => {
    const next = activeMoods.includes(mood)
      ? activeMoods.filter((m) => m !== mood)
      : [...activeMoods, mood]
    setActiveMoods(next)
    if (query.length > 1 || next.length) debouncedSearch(query, next)
  }

  const hasQuery = query.length > 1 || activeMoods.length > 0

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={['top']}>
      {/* Fixed header + search — always visible, never waits */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 32, color: textPrimary, letterSpacing: -1, marginBottom: 4 }}>
          Finding Clarity.
        </Text>
        <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: textSecondary, marginBottom: 16 }}>
          Search by vibe, mood, or type of space.
        </Text>

        {/* Search input */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: cardBg, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12 }}>
          <Text style={{ marginRight: 8, color: accentColor }}>🔍</Text>
          <TextInput
            value={query}
            onChangeText={handleQueryChange}
            placeholder="quiet cafe, park, gallery..."
            placeholderTextColor={textSecondary}
            style={{ flex: 1, fontFamily: 'Manrope_400Regular', fontSize: 15, color: textPrimary }}
            returnKeyType="search"
            onSubmitEditing={() => search(query, activeMoods)}
          />
          {query.length > 0 && (
            <Pressable onPress={() => { setQuery(''); search('', activeMoods) }}>
              <Text style={{ color: textSecondary, fontSize: 18 }}>✕</Text>
            </Pressable>
          )}
        </View>

        {/* Mood chips — always rendered */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
          {MOOD_FILTERS.map((mood) => {
            const active = activeMoods.includes(mood)
            return (
              <Pressable
                key={mood}
                onPress={() => toggleMood(mood)}
                style={{ borderRadius: 99, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: active ? accentColor : isDark ? '#282a28' : '#eeeeea' }}
              >
                <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 13, color: active ? isDark ? '#003737' : '#e1fffc' : textSecondary }}>
                  {mood}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>
      </View>

      {/* Results area — scrollable, separate from header */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Loading skeleton — shows immediately on search */}
        {isLoading && <SearchSkeleton isDark={isDark} />}

        {/* Real results */}
        {!isLoading && results.length > 0 && (
          <View style={{ gap: 12 }}>
            <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 11, color: textSecondary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
              {results.length} places near you
            </Text>
            {results.map((result, i) => (
              <Pressable
                key={result.id}
                style={{ backgroundColor: cardBg, borderRadius: 18, overflow: 'hidden' }}
                android_ripple={{ color: accentColor + '20' }}
              >
                {/* Image — first result gets hero treatment */}
                {result.imageUrl ? (
                  <Image
                    source={{ uri: result.imageUrl }}
                    style={{ width: '100%', height: i === 0 ? 180 : 120 }}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={{ width: '100%', height: i === 0 ? 180 : 120, backgroundColor: isDark ? '#1a2e2e' : '#d4f0ed' }} />
                )}

                <View style={{ padding: 14 }}>
                  {/* Tags row */}
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    {result.isOpenNow === true && (
                      <View style={{ borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: '#22c55e20' }}>
                        <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 10, color: '#22c55e' }}>Open Now</Text>
                      </View>
                    )}
                    {result.isOpenNow === false && (
                      <View style={{ borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: isDark ? '#282a28' : '#eeeeea' }}>
                        <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 10, color: textSecondary }}>Closed</Text>
                      </View>
                    )}
                    {result.distanceMins !== null && (
                      <View style={{ borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: `${accentColor}18` }}>
                        <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 10, color: accentColor }}>{result.distanceMins} min away</Text>
                      </View>
                    )}
                    {result.rating && (
                      <View style={{ borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: isDark ? '#282a28' : '#eeeeea' }}>
                        <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 10, color: textSecondary }}>★ {result.rating}</Text>
                      </View>
                    )}
                  </View>

                  <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 16, color: textPrimary, marginBottom: 4 }}>
                    {result.title}
                  </Text>
                  <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 12, color: textSecondary, marginBottom: 4 }}>
                    {result.address}
                  </Text>
                  {result.description ? (
                    <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 13, color: textSecondary, lineHeight: 18, marginBottom: 10 }}>
                      {result.description}
                    </Text>
                  ) : null}

                  {/* Why it fits */}
                  {result.whyItFits && (
                    <View style={{ borderRadius: 10, padding: 10, backgroundColor: isDark ? '#1a2e2e' : '#e8f5f4', marginBottom: 12 }}>
                      <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 10, color: accentColor, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 3 }}>
                        ✦ Why it fits
                      </Text>
                      <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 12, color: textSecondary, lineHeight: 17 }}>
                        {result.whyItFits}
                      </Text>
                    </View>
                  )}

                  <Pressable
                    style={{ alignSelf: 'flex-end', borderRadius: 99, paddingHorizontal: 16, paddingVertical: 9, backgroundColor: accentColor }}
                  >
                    <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 13, color: isDark ? '#003737' : '#e1fffc' }}>
                      Get Directions →
                    </Text>
                  </Pressable>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* Empty state — location needed */}
        {!isLoading && requiresLocation && (
          <View style={{ alignItems: 'center', paddingTop: 40 }}>
            <Text style={{ fontSize: 36, marginBottom: 12 }}>📍</Text>
            <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 15, color: textPrimary, textAlign: 'center', marginBottom: 6 }}>
              Location needed
            </Text>
            <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 13, color: textSecondary, textAlign: 'center' }}>
              Allow location access to find real places near you.
            </Text>
          </View>
        )}

        {/* No results */}
        {!isLoading && !requiresLocation && hasQuery && results.length === 0 && (
          <View style={{ alignItems: 'center', paddingTop: 40 }}>
            <Text style={{ fontSize: 36, marginBottom: 12 }}>🌿</Text>
            <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 14, color: textSecondary, textAlign: 'center' }}>
              No places found nearby.{'\n'}Try a different search or mood.
            </Text>
          </View>
        )}

        {/* Idle state */}
        {!isLoading && !hasQuery && results.length === 0 && (
          <View style={{ alignItems: 'center', paddingTop: 32 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>✦</Text>
            <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 14, color: textSecondary, textAlign: 'center', lineHeight: 22 }}>
              Type something or tap a mood{'\n'}to find your sanctuary.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
