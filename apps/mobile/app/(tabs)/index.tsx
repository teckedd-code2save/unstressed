import { useRef, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  useColorScheme,
  Animated,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useUser } from '@clerk/clerk-expo'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { useRightNow } from '@/hooks/useRightNow'
import { formatTimeOfDay, getEnergyEmoji } from '@/lib/utils'

function SkeletonLoader({ isDark }: { isDark: boolean }) {
  const pulse = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    )
    anim.start()
    return () => anim.stop()
  }, [pulse])

  const skeletonBg = isDark ? '#2a2c2a' : '#e5e5e0'

  return (
    <View className="pt-6 gap-4">
      <Animated.View style={{ opacity: pulse, height: 40, width: '65%', borderRadius: 12, backgroundColor: skeletonBg }} />
      <Animated.View style={{ opacity: pulse, height: 180, width: '100%', borderRadius: 16, backgroundColor: skeletonBg }} />
      <Animated.View style={{ opacity: pulse, height: 100, width: '100%', borderRadius: 16, backgroundColor: skeletonBg }} />
    </View>
  )
}

export default function RightNowScreen() {
  const { user } = useUser()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const { data, isLoading } = useRightNow()

  const bg = isDark ? 'bg-dark-surface' : 'bg-surface'
  const cardBg = isDark ? 'bg-dark-surface-container-high' : 'bg-surface-container-low'
  const textPrimary = isDark ? 'text-dark-on-surface' : 'text-on-surface'
  const textSecondary = isDark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'
  const accentColor = isDark ? '#93d2d1' : '#156a67'

  const hapticLight = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

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
        <Pressable className="p-1">
          <Text style={{ fontSize: 18 }}>⚙️</Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <SkeletonLoader isDark={isDark} />
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
              <Pressable className="rounded-2xl overflow-hidden mb-4 active:opacity-90">
                {data.heroSuggestion.imageUrl ? (
                  <Image
                    source={{ uri: data.heroSuggestion.imageUrl }}
                    className="w-full h-44"
                    resizeMode="cover"
                  />
                ) : (
                  <LinearGradient
                    colors={isDark ? ["#0d3333", "#1a5c5c", "#93d2d1"] : ["#156a67", "#2a9d97", "#93d2d1"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ width: '100%', height: 176 }}
                  />
                )}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.75)']}
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
                    onPress={hapticLight}
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
                  onPress={hapticLight}
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
                <Pressable>
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
                    onPress={hapticLight}
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
                    onPress={hapticLight}
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
