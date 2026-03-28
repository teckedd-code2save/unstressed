import {
  Alert,
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Image,
  useColorScheme,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, useCallback } from 'react'
import { useSearch } from '@/hooks/useSearch'
import { debounce } from '@/lib/utils'

const MOOD_FILTERS = [
  'Solitude',
  'Deep Focus',
  'Creative Flow',
  'Restorative Sleep',
  'Vibrant Energy',
  'Nature Escape',
]

export default function SearchScreen() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const [query, setQuery] = useState('')
  const [activeMoods, setActiveMoods] = useState<string[]>([])
  const { results, isLoading, search } = useSearch()

  const accentColor = isDark ? '#93d2d1' : '#156a67'
  const bg = isDark ? 'bg-dark-surface' : 'bg-surface'
  const cardBg = isDark ? 'bg-dark-surface-container-high' : 'bg-surface-container-low'
  const textPrimary = isDark ? 'text-dark-on-surface' : 'text-on-surface'
  const textSecondary = isDark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'
  const showPlannedFeature = (feature: string) => {
    Alert.alert('In progress', `${feature} is not wired up yet.`)
  }

  const debouncedSearch = useCallback(
    debounce((q: string, moods: string[]) => search(q, moods), 400),
    [search],
  )

  const handleQueryChange = (text: string) => {
    setQuery(text)
    debouncedSearch(text, activeMoods)
  }

  const toggleMood = (mood: string) => {
    const next = activeMoods.includes(mood)
      ? activeMoods.filter((m) => m !== mood)
      : [...activeMoods, mood]
    setActiveMoods(next)
    debouncedSearch(query, next)
  }

  return (
    <SafeAreaView className={`flex-1 ${bg}`} edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="mt-4 mb-5">
          <Text
            className={`${textPrimary} text-4xl leading-tight`}
            style={{ fontFamily: 'Manrope_700Bold', letterSpacing: -1 }}
          >
            Finding Clarity.
          </Text>
          <Text
            className={`${textSecondary} text-base mt-1`}
            style={{ fontFamily: 'Manrope_400Regular' }}
          >
            Tell us how you feel or where your mind is wandering.
          </Text>
        </View>

        {/* Search input */}
        <View
          className={`flex-row items-center ${cardBg} rounded-xl px-4 py-3 mb-4`}
        >
          <Text className="mr-2 text-base" style={{ color: accentColor }}>🔍</Text>
          <TextInput
            value={query}
            onChangeText={handleQueryChange}
            placeholder="Where would you like your mind to go?"
            placeholderTextColor={isDark ? '#bfc8c8' : '#5d605c'}
            className={`flex-1 text-sm ${textPrimary}`}
            style={{ fontFamily: 'Manrope_400Regular' }}
          />
          {query.length > 0 && (
            <Pressable
              onPress={() => {
                setQuery('')
                search('', activeMoods)
              }}
              className="rounded-full px-3 py-1"
              style={{ backgroundColor: accentColor }}
            >
              <Text
                style={{
                  fontFamily: 'Manrope_600SemiBold',
                  fontSize: 12,
                  color: isDark ? '#003737' : '#e1fffc',
                }}
              >
                Search
              </Text>
            </Pressable>
          )}
        </View>

        {/* Mood filter chips */}
        <Text
          className={`${textSecondary} text-xs mb-2`}
          style={{ fontFamily: 'Manrope_600SemiBold', letterSpacing: 1, textTransform: 'uppercase' }}
        >
          Filter by mood
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6"
          contentContainerStyle={{ gap: 8 }}
        >
          {MOOD_FILTERS.map((mood) => {
            const active = activeMoods.includes(mood)
            return (
              <Pressable
                key={mood}
                onPress={() => toggleMood(mood)}
                className="rounded-full px-4 py-2 active:opacity-80"
                style={{
                  backgroundColor: active
                    ? accentColor
                    : isDark
                    ? '#282a28'
                    : '#eeeeea',
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Manrope_600SemiBold',
                    fontSize: 13,
                    color: active
                      ? isDark ? '#003737' : '#e1fffc'
                      : isDark ? '#bfc8c8' : '#5d605c',
                  }}
                >
                  {mood}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>

        {/* Results */}
        {isLoading ? (
          <ActivityIndicator color={accentColor} className="mt-8" />
        ) : results.length > 0 ? (
          <View className="gap-4">
            {results.map((result, i) => (
              <Pressable
                key={result.id}
                className={`${cardBg} rounded-2xl overflow-hidden active:opacity-90`}
                onPress={() => showPlannedFeature(result.title)}
              >
                {i === 0 && (
                  <View className="relative">
                    {result.imageUrl ? (
                      <Image
                        source={{ uri: result.imageUrl }}
                        className="w-full h-48"
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        className="w-full h-48"
                        style={{ backgroundColor: isDark ? '#1a2e2e' : '#d9f0ee' }}
                      />
                    )}
                    <View
                      className="absolute top-3 left-3 rounded-full px-2 py-1"
                      style={{ backgroundColor: accentColor }}
                    >
                      <Text
                        style={{
                          fontFamily: 'Manrope_700Bold',
                          fontSize: 10,
                          color: isDark ? '#003737' : '#e1fffc',
                          letterSpacing: 0.5,
                          textTransform: 'uppercase',
                        }}
                      >
                        Featured
                      </Text>
                    </View>
                  </View>
                )}
                <View className="p-4">
                  {/* Context tags */}
                  <View className="flex-row flex-wrap gap-2 mb-2">
                    {result.contextTags.map((tag) => (
                      <View
                        key={tag}
                        className="rounded-full px-2 py-0.5"
                        style={{ backgroundColor: `${accentColor}20` }}
                      >
                        <Text
                          style={{
                            fontFamily: 'Manrope_500Medium',
                            fontSize: 10,
                            color: accentColor,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                          }}
                        >
                          Context: {tag}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <Text
                    className={`${textPrimary} text-lg`}
                    style={{ fontFamily: 'Manrope_700Bold' }}
                  >
                    {result.title}
                  </Text>
                  <Text
                    className={`${textSecondary} text-sm mt-1 leading-relaxed`}
                    style={{ fontFamily: 'Manrope_400Regular' }}
                  >
                    {result.description}
                  </Text>

                  {/* Why it fits */}
                  {result.whyItFits && (
                    <View
                      className="mt-3 rounded-xl p-3"
                      style={{
                        backgroundColor: isDark ? '#1a2e2e' : '#e8f5f4',
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: 'Manrope_600SemiBold',
                          fontSize: 11,
                          color: accentColor,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                          marginBottom: 4,
                        }}
                      >
                        Why it fits your context
                      </Text>
                      <Text
                        className={textSecondary}
                        style={{ fontFamily: 'Manrope_400Regular', fontSize: 13, lineHeight: 18 }}
                      >
                        {result.whyItFits}
                      </Text>
                    </View>
                  )}

                  <View className="flex-row items-center justify-between mt-4">
                    <View className="flex-row items-center gap-2">
                      <Text
                        className={textSecondary}
                        style={{ fontFamily: 'Manrope_500Medium', fontSize: 12 }}
                      >
                        {result.distanceMins} mins away
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => showPlannedFeature(`Directions for ${result.title}`)}
                      className="flex-row items-center gap-1 rounded-full px-4 py-2"
                      style={{ backgroundColor: accentColor }}
                    >
                      <Text
                        style={{
                          fontFamily: 'Manrope_600SemiBold',
                          fontSize: 13,
                          color: isDark ? '#003737' : '#e1fffc',
                        }}
                      >
                        Explore Path →
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        ) : query || activeMoods.length ? (
          <View className="items-center pt-12">
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🌿</Text>
            <Text
              className={textSecondary}
              style={{ fontFamily: 'Manrope_500Medium', textAlign: 'center' }}
            >
              No sanctuaries found for this mood.{'\n'}Try adjusting your filters.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  )
}
