import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  useColorScheme,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useUserContext } from '@/hooks/useUserContext'

const SANCTUARY_OPTIONS = [
  { id: 'quiet-waterfronts', label: 'Quiet Waterfronts', icon: '🌊' },
  { id: 'forest-trails', label: 'Forest Trails', icon: '🌲' },
  { id: 'quiet-cafes', label: 'Quiet Cafes', icon: '☕' },
  { id: 'art-galleries', label: 'Art Galleries', icon: '🖼' },
  { id: 'libraries', label: 'Libraries', icon: '📚' },
  { id: 'rooftop-spaces', label: 'Rooftop Spaces', icon: '🏙' },
]

export default function ContextScreen() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const { context, isLoading, updateContext, isSaving } = useUserContext()

  const accentColor = isDark ? '#93d2d1' : '#156a67'
  const bg = isDark ? 'bg-dark-surface' : 'bg-surface'
  const cardBg = isDark ? 'bg-dark-surface-container-high' : 'bg-surface-container-low'
  const textPrimary = isDark ? 'text-dark-on-surface' : 'text-on-surface'
  const textSecondary = isDark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'

  const completionPct = context ? Math.round(
    ([
      context.calendarProvider,
      context.healthProvider,
      context.circadianWakeTime,
      context.silenceStart,
      context.preferredSanctuaries?.length,
      context.energyLevel,
    ].filter(Boolean).length /
      6) *
      100,
  ) : 0

  return (
    <SafeAreaView className={`flex-1 ${bg}`} edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-start justify-between mt-4 mb-5">
          <View>
            <Text
              className={textSecondary}
              style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}
            >
              Personal Context
            </Text>
            <Text
              className={`${textPrimary} text-3xl`}
              style={{ fontFamily: 'Manrope_700Bold', letterSpacing: -0.5 }}
            >
              Digital Atrium
            </Text>
            <Text
              className={`${textSecondary} text-sm mt-1`}
              style={{ fontFamily: 'Manrope_400Regular' }}
            >
              Your resting profile and energy synchronization hub.
            </Text>
          </View>
          <Pressable><Text style={{ fontSize: 20 }}>⚙️</Text></Pressable>
        </View>

        {isLoading ? (
          <ActivityIndicator color={accentColor} className="mt-12" />
        ) : (
          <>
            {/* Profile depth */}
            <View className={`${isDark ? 'bg-dark-surface-container' : 'bg-surface-container-low'} rounded-2xl p-4 mb-4`}>
              <Text
                className={`${textPrimary} text-base mb-1`}
                style={{ fontFamily: 'Manrope_700Bold' }}
              >
                Profile Depth
              </Text>
              <Text
                className={textSecondary}
                style={{ fontFamily: 'Manrope_400Regular', fontSize: 13 }}
              >
                Your context is {completionPct}% personalized.
              </Text>
              <Text
                style={{ fontFamily: 'Manrope_800ExtraBold', fontSize: 36, color: accentColor, marginTop: 4 }}
              >
                {completionPct}%
              </Text>
              <View className="h-1.5 rounded-full mt-2" style={{ backgroundColor: isDark ? '#282a28' : '#e1e3de' }}>
                <View
                  className="h-full rounded-full"
                  style={{ width: `${completionPct}%`, backgroundColor: accentColor }}
                />
              </View>
            </View>

            {/* Calendar connections */}
            <View className={`${cardBg} rounded-2xl p-4 mb-4`}>
              <Text
                className={`${textPrimary} text-base mb-3`}
                style={{ fontFamily: 'Manrope_700Bold' }}
              >
                Calendar Connections
              </Text>
              <Text
                className={`${textSecondary} text-sm mb-3`}
                style={{ fontFamily: 'Manrope_400Regular' }}
              >
                Sync your life to find pockets of silence.
              </Text>

              {[
                { id: 'google', name: 'Google Calendar', icon: '📅', connected: context?.calendarProvider === 'google' },
                { id: 'outlook', name: 'Outlook', icon: '📧', connected: context?.calendarProvider === 'outlook' },
              ].map((cal) => (
                <View
                  key={cal.id}
                  className="flex-row items-center justify-between py-3 border-b border-outline/10 last:border-0"
                >
                  <View className="flex-row items-center gap-3">
                    <Text style={{ fontSize: 20 }}>{cal.icon}</Text>
                    <View>
                      <Text
                        className={textPrimary}
                        style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 14 }}
                      >
                        {cal.name}
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'Manrope_400Regular',
                          fontSize: 11,
                          color: cal.connected ? accentColor : isDark ? '#bfc8c8' : '#5d605c',
                        }}
                      >
                        {cal.connected ? 'Active · Work & Personal' : 'Not connected'}
                      </Text>
                    </View>
                  </View>
                  {cal.connected ? (
                    <View className="w-6 h-6 rounded-full items-center justify-center" style={{ backgroundColor: accentColor }}>
                      <Text style={{ color: isDark ? '#003737' : '#e1fffc', fontSize: 12 }}>✓</Text>
                    </View>
                  ) : (
                    <Pressable
                      className="rounded-full px-3 py-1 border"
                      style={{ borderColor: accentColor }}
                    >
                      <Text
                        style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 12, color: accentColor }}
                      >
                        Connect
                      </Text>
                    </Pressable>
                  )}
                </View>
              ))}
            </View>

            {/* Energy blueprint */}
            <View className={`${cardBg} rounded-2xl p-4 mb-4`}>
              <Text
                className={`${textPrimary} text-base mb-1`}
                style={{ fontFamily: 'Manrope_700Bold' }}
              >
                Weekly Energy Blueprint
              </Text>
              <Text
                className={`${textSecondary} text-sm mb-4`}
                style={{ fontFamily: 'Manrope_400Regular' }}
              >
                Map your natural peaks and valleys throughout the week.
              </Text>

              <View className="flex-row items-end gap-2 h-20">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                  const heights = [60, 75, 90, 50, 40, 80, 65]
                  const isToday = i === new Date().getDay() - 1
                  return (
                    <View key={i} className="flex-1 items-center gap-1">
                      <View
                        className="w-full rounded-lg"
                        style={{
                          height: heights[i],
                          backgroundColor: isToday ? accentColor : `${accentColor}30`,
                        }}
                      />
                      <Text
                        style={{
                          fontFamily: 'Manrope_600SemiBold',
                          fontSize: 10,
                          color: isToday ? accentColor : isDark ? '#bfc8c8' : '#5d605c',
                        }}
                      >
                        {day}
                      </Text>
                    </View>
                  )
                })}
              </View>
            </View>

            {/* Focus parameters */}
            <View className="mb-4">
              <Text
                className={`${textSecondary} text-xs mb-3`}
                style={{ fontFamily: 'Manrope_600SemiBold', letterSpacing: 1, textTransform: 'uppercase' }}
              >
                Focus Parameters
              </Text>

              {[
                {
                  icon: '🌙',
                  title: 'Circadian Alignment',
                  subtitle: `Natural wake-up at ${context?.circadianWakeTime ?? '7:15 AM'}`,
                },
                {
                  icon: '🔕',
                  title: 'Silence Protocols',
                  subtitle: `Active: ${context?.silenceStart ?? '10 PM'} – ${context?.silenceEnd ?? '8 AM'}`,
                },
                {
                  icon: '💪',
                  title: 'Bio-metric Sync',
                  subtitle: context?.healthProvider
                    ? `${context.healthProvider} linked`
                    : 'Not connected',
                },
              ].map((param) => (
                <Pressable
                  key={param.title}
                  className={`${cardBg} rounded-2xl p-4 mb-2 flex-row items-center active:opacity-80`}
                >
                  <Text style={{ fontSize: 20, marginRight: 12 }}>{param.icon}</Text>
                  <View className="flex-1">
                    <Text
                      className={textPrimary}
                      style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 14 }}
                    >
                      {param.title}
                    </Text>
                    <Text
                      className={textSecondary}
                      style={{ fontFamily: 'Manrope_400Regular', fontSize: 12 }}
                    >
                      {param.subtitle}
                    </Text>
                  </View>
                  <Text style={{ color: accentColor, fontSize: 16 }}>›</Text>
                </Pressable>
              ))}
            </View>

            {/* Preferred sanctuaries */}
            <View className="mb-6">
              <Text
                className={`${textPrimary} text-base mb-3`}
                style={{ fontFamily: 'Manrope_700Bold' }}
              >
                Preferred Sanctuaries
              </Text>
              <Text
                className={`${textSecondary} text-sm mb-3`}
                style={{ fontFamily: 'Manrope_400Regular' }}
              >
                What environments restore you most?
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {SANCTUARY_OPTIONS.map((s) => {
                  const selected = context?.preferredSanctuaries?.includes(s.id)
                  return (
                    <Pressable
                      key={s.id}
                      onPress={() => {
                        const current = context?.preferredSanctuaries ?? []
                        const next = selected
                          ? current.filter((id) => id !== s.id)
                          : [...current, s.id]
                        updateContext({ preferredSanctuaries: next })
                      }}
                      className="flex-row items-center gap-1 rounded-full px-3 py-2 active:opacity-80"
                      style={{
                        backgroundColor: selected
                          ? accentColor
                          : isDark ? '#282a28' : '#eeeeea',
                      }}
                    >
                      <Text style={{ fontSize: 14 }}>{s.icon}</Text>
                      <Text
                        style={{
                          fontFamily: 'Manrope_600SemiBold',
                          fontSize: 13,
                          color: selected
                            ? isDark ? '#003737' : '#e1fffc'
                            : isDark ? '#bfc8c8' : '#5d605c',
                        }}
                      >
                        {s.label}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>
            </View>

            {/* Save CTA */}
            <Pressable
              onPress={() => updateContext({})}
              disabled={isSaving}
              className="rounded-full py-4 items-center active:opacity-80"
              style={{ backgroundColor: accentColor }}
            >
              <Text
                style={{
                  fontFamily: 'Manrope_700Bold',
                  fontSize: 16,
                  color: isDark ? '#003737' : '#e1fffc',
                }}
              >
                {isSaving ? 'Saving...' : 'Save Context Profile'}
              </Text>
            </Pressable>
            <Text
              className={`${textSecondary} text-xs text-center mt-3`}
              style={{ fontFamily: 'Manrope_400Regular' }}
            >
              Your health & calendar data stays private and on-device.
            </Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
