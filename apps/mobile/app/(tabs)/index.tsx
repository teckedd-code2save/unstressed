import {
  Alert,
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  useColorScheme,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useUser } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useRightNow } from '@/hooks/useRightNow'
import { formatTimeOfDay, getEnergyEmoji } from '@/lib/utils'

export default function RightNowScreen() {
  const { user } = useUser()
  const router = useRouter()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const { data, isLoading } = useRightNow()

  const bg = isDark ? 'bg-dark-surface' : 'bg-surface'
  const cardBg = isDark ? 'bg-dark-surface-container-high' : 'bg-surface-container-low'
  const textPrimary = isDark ? 'text-dark-on-surface' : 'text-on-surface'
  const textSecondary = isDark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'
  const accentColor = isDark ? '#93d2d1' : '#156a67'

  const openSearch = (seedQuery?: string, seedMoods?: string[]) => {
    router.push({
      pathname: '/(tabs)/search',
      params: {
        ...(seedQuery?.trim() ? { q: seedQuery.trim() } : {}),
        ...(seedMoods?.length ? { moods: seedMoods.join('|') } : {}),
      },
    })
  }

  const openForecast = () => {
    const items = data?.upcomingMomentum ?? []
    if (!items.length) {
      Alert.alert('Upcoming Momentum', 'No forecast is available yet.')
      return
    }

    Alert.alert(
      'Upcoming Momentum',
      items.map((item) => `${item.time}  ${item.title}\n${item.description}`).join('\n\n'),
    )
  }

  return (
    <SafeAreaView className={`flex-1 ${bg}`} edges={['top']}>
      {/* Top bar */}
      <View className="flex-row items-center justify-between px-5 pt-2 pb-1">
        <View className="flex-row items-center gap-3">
          {user?.imageUrl ? (
            <Image
              source={{ uri: user.imageUrl }}
              className="w-9 h-9 rounded-full"
            />
          ) : (
            <View className={`w-9 h-9 rounded-full ${isDark ? 'bg-dark-surface-container-highest' : 'bg-primary-container'} items-center justify-center`}>
              <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 14, color: accentColor }}>
                {user?.firstName?.[0] ?? 'U'}
              </Text>
            </View>
          )}
          <Text
            className={textPrimary}
            style={{ fontFamily: 'Manrope_700Bold', fontSize: 16 }}
          >
            Unstressed
          </Text>
        </View>
        <Pressable className="p-1" onPress={() => router.push('/(tabs)/context')}>
          <Text style={{ fontSize: 18 }}>⚙️</Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View className="flex-1 items-center justify-center pt-20">
            <ActivityIndicator color={accentColor} />
          </View>
        ) : (
          <>
            {/* Hero: Time + headline suggestion */}
            <View className="mt-4 mb-6">
              <Text
                className={`${textSecondary} text-sm mb-1`}
                style={{ fontFamily: 'Manrope_500Medium' }}
              >
                {formatTimeOfDay()}
              </Text>
              <Text
                className={`${textPrimary} text-4xl leading-tight`}
                style={{ fontFamily: 'Manrope_700Bold', letterSpacing: -1 }}
              >
                {data?.headline ?? 'Time to find your calm.'}
              </Text>

              {/* Mood chips */}
              <View className="flex-row flex-wrap gap-2 mt-3">
                {(data?.moodTags ?? ['Quiet', 'Nearby', '30 mins']).map((tag) => (
                  <View
                    key={tag}
                    className={`${isDark ? 'bg-dark-surface-container-highest' : 'bg-surface-container'} rounded-full px-3 py-1`}
                  >
                    <Text
                      className={`${textSecondary} text-xs`}
                      style={{ fontFamily: 'Manrope_500Medium' }}
                    >
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Hero suggestion card */}
            {data?.heroSuggestion && (
              <Pressable
                className="rounded-2xl overflow-hidden mb-4 active:opacity-90"
                onPress={() => openSearch(data.heroSuggestion?.title, data.moodTags)}
              >
                {data.heroSuggestion.imageUrl ? (
                  <Image
                    source={{ uri: data.heroSuggestion.imageUrl }}
                    className="w-full h-44"
                    resizeMode="cover"
                  />
                ) : (
                  <LinearGradient
                    colors={isDark ? ['#23403f', '#121412'] : ['#d9f0ee', '#b9ddd9']}
                    className="w-full h-44"
                  />
                )}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.75)']}
                  className="absolute inset-0"
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                />
                <View className="absolute bottom-0 left-0 right-0 p-4 flex-row justify-between items-end">
                  <View className="flex-1 mr-3">
                    <Text
                      className="text-white text-xl leading-tight"
                      style={{ fontFamily: 'Manrope_700Bold' }}
                    >
                      {data.heroSuggestion.title}
                    </Text>
                    <Text
                      className="text-white/70 text-xs mt-1"
                      style={{ fontFamily: 'Manrope_400Regular' }}
                    >
                      {data.heroSuggestion.description}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => openSearch(data.heroSuggestion?.title, data.moodTags)}
                    className="rounded-full px-4 py-2 items-center justify-center"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Text
                      style={{
                        fontFamily: 'Manrope_600SemiBold',
                        fontSize: 13,
                        color: isDark ? '#003737' : '#e1fffc',
                      }}
                    >
                      Let's Go →
                    </Text>
                  </Pressable>
                </View>
              </Pressable>
            )}

            {/* Energy insight card */}
            {data?.energyInsight && (
              <View className={`${cardBg} rounded-2xl p-4 mb-4`}>
                <Text
                  className={`${textSecondary} text-xs mb-1`}
                  style={{ fontFamily: 'Manrope_600SemiBold', letterSpacing: 1, textTransform: 'uppercase' }}
                >
                  {getEnergyEmoji(data.energyInsight.level)}  Energy Insight
                </Text>
                <Text
                  className={`${textPrimary} text-base`}
                  style={{ fontFamily: 'Manrope_700Bold' }}
                >
                  {data.energyInsight.title}
                </Text>
                <Text
                  className={`${textSecondary} text-sm mt-1 leading-relaxed`}
                  style={{ fontFamily: 'Manrope_400Regular' }}
                >
                  {data.energyInsight.body}
                </Text>
                <View className="flex-row items-center justify-between mt-3">
                  <View className={`rounded-full px-2 py-1`} style={{ backgroundColor: `${accentColor}20` }}>
                    <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 11, color: accentColor }}>
                      ACTIVE NOW
                    </Text>
                  </View>
                  <Text style={{ color: accentColor, fontSize: 16 }}>›</Text>
                </View>
              </View>
            )}

            {/* Recommended micro-action */}
            {data?.recommendation && (
              <View
                className="rounded-2xl p-4 mb-4"
                style={{ backgroundColor: isDark ? '#1a2e2e' : '#e8f5f4' }}
              >
                <Text style={{ fontSize: 20, marginBottom: 6 }}>⚡</Text>
                <Text
                  className={`${textPrimary} text-lg`}
                  style={{ fontFamily: 'Manrope_700Bold' }}
                >
                  {data.recommendation.title}
                </Text>
                <Text
                  className={`${textSecondary} text-sm mt-1`}
                  style={{ fontFamily: 'Manrope_400Regular' }}
                >
                  {data.recommendation.subtitle}
                </Text>
                <Pressable
                  onPress={() => openSearch(data.recommendation?.title, data.moodTags)}
                  className="mt-4 rounded-full py-3 items-center active:opacity-80"
                  style={{ backgroundColor: accentColor }}
                >
                  <Text
                    style={{
                      fontFamily: 'Manrope_600SemiBold',
                      fontSize: 14,
                      color: isDark ? '#003737' : '#e1fffc',
                    }}
                  >
                    {data.recommendation.cta} ▶
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Upcoming momentum timeline */}
            <View className="mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text
                  className={`${textPrimary} text-base`}
                  style={{ fontFamily: 'Manrope_700Bold' }}
                >
                  Upcoming Momentum
                </Text>
                <Pressable onPress={openForecast}>
                  <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 13, color: accentColor }}>
                    Full Forecast →
                  </Text>
                </Pressable>
              </View>

              {(data?.upcomingMomentum ?? []).map((item, i) => (
                <View key={i} className="flex-row items-start mb-3">
                  <View className="items-center mr-3 pt-1">
                    <View
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: accentColor }}
                    />
                    {i < (data?.upcomingMomentum?.length ?? 0) - 1 && (
                      <View
                        className="w-px flex-1 mt-1"
                        style={{ backgroundColor: `${accentColor}30`, minHeight: 24 }}
                      />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`${textSecondary} text-xs`}
                      style={{ fontFamily: 'Manrope_600SemiBold' }}
                    >
                      {item.time}
                    </Text>
                    <Text
                      className={`${textPrimary} text-sm`}
                      style={{ fontFamily: 'Manrope_600SemiBold' }}
                    >
                      {item.title}
                    </Text>
                    <Text
                      className={`${textSecondary} text-xs`}
                      style={{ fontFamily: 'Manrope_400Regular' }}
                    >
                      {item.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Contextual AI insight */}
            {data?.contextualInsight && (
              <View className={`${isDark ? 'bg-dark-surface-container' : 'bg-surface-container'} rounded-2xl p-4 mb-2`}>
                <Text
                  className={`${textSecondary} text-xs mb-2`}
                  style={{ fontFamily: 'Manrope_600SemiBold', letterSpacing: 1, textTransform: 'uppercase' }}
                >
                  ✦ AI Insight
                </Text>
                <Text
                  className={`${textPrimary} text-lg`}
                  style={{ fontFamily: 'Manrope_700Bold', letterSpacing: -0.3 }}
                >
                  {data.contextualInsight.headline}
                </Text>
                <Text
                  className={`${textSecondary} text-sm mt-2 leading-relaxed`}
                  style={{ fontFamily: 'Manrope_400Regular' }}
                >
                  {data.contextualInsight.body}
                </Text>
                <View className="flex-row gap-3 mt-4">
                  <Pressable
                    onPress={() => router.push('/(tabs)/context')}
                    className="flex-1 rounded-full py-3 items-center active:opacity-80"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Text
                      style={{
                        fontFamily: 'Manrope_600SemiBold',
                        fontSize: 13,
                        color: isDark ? '#003737' : '#e1fffc',
                      }}
                    >
                      Optimize
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => Alert.alert('Saved', 'We will keep adapting suggestions to this energy pattern.')}
                    className="flex-1 rounded-full py-3 items-center border border-outline/30 active:opacity-80"
                  >
                    <Text
                      className={textSecondary}
                      style={{ fontFamily: 'Manrope_500Medium', fontSize: 13 }}
                    >
                      Noted
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
