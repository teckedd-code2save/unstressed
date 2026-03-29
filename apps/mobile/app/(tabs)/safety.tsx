import { Alert, Pressable, ScrollView, Text, useColorScheme, View, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSafety } from '@/hooks/useSafety'

export default function SafetyScreen() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const { dashboard, isLoading, isSubmitting, sendCheckIn } = useSafety()

  const accentColor = isDark ? '#93d2d1' : '#156a67'
  const warnColor = '#d97706'
  const dangerColor = '#c2410c'
  const bg = isDark ? 'bg-dark-surface' : 'bg-surface'
  const cardBg = isDark ? 'bg-dark-surface-container-high' : 'bg-surface-container-low'
  const textPrimary = isDark ? 'text-dark-on-surface' : 'text-on-surface'
  const textSecondary = isDark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'

  const submitCheckIn = async (status: 'SAFE' | 'DELAYED' | 'HELP', note?: string) => {
    await sendCheckIn({ status, note })
    Alert.alert('Check-in sent', `Your ${status.toLowerCase()} update has been recorded.`)
  }

  return (
    <SafeAreaView className={`flex-1 ${bg}`} edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-4 mb-5">
          <Text
            className={textSecondary}
            style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}
          >
            Social Safety
          </Text>
          <Text
            className={`${textPrimary} text-4xl`}
            style={{ fontFamily: 'Manrope_700Bold', letterSpacing: -1 }}
          >
            Safe & Seen
          </Text>
          <Text
            className={`${textSecondary} text-sm mt-1`}
            style={{ fontFamily: 'Manrope_400Regular' }}
          >
            Quiet location sharing, check-ins, and support circles without panic.
          </Text>
        </View>

        {isLoading ? (
          <ActivityIndicator color={accentColor} className="mt-10" />
        ) : (
          <>
            {dashboard?.activeShare ? (
              <View className={`${cardBg} rounded-3xl p-5 mb-5`}>
                <Text className={textSecondary} style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}>
                  Active share
                </Text>
                <Text className={`${textPrimary} text-2xl mt-1`} style={{ fontFamily: 'Manrope_700Bold' }}>
                  {dashboard.activeShare.destinationLabel}
                </Text>
                <Text className={textSecondary} style={{ fontFamily: 'Manrope_400Regular', fontSize: 13, marginTop: 4 }}>
                  Visible to {dashboard.activeShare.viewers.map((viewer) => viewer.displayName).join(', ')} until{' '}
                  {new Date(dashboard.activeShare.expiresAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </Text>

                <View className="flex-row gap-3 mt-4">
                  <Pressable
                    disabled={isSubmitting}
                    onPress={() => submitCheckIn('SAFE', 'All good. Staying on track.')}
                    className="flex-1 rounded-full py-3 items-center"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 13, color: isDark ? '#003737' : '#e1fffc' }}>
                      I’m Safe
                    </Text>
                  </Pressable>
                  <Pressable
                    disabled={isSubmitting}
                    onPress={() => submitCheckIn('DELAYED', 'Running late, but okay.')}
                    className="flex-1 rounded-full py-3 items-center"
                    style={{ backgroundColor: warnColor }}
                  >
                    <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 13, color: '#fff7ed' }}>
                      Delayed
                    </Text>
                  </Pressable>
                </View>

                <Pressable
                  disabled={isSubmitting}
                  onPress={() => submitCheckIn('HELP', 'Need someone to call and check in now.')}
                  className="rounded-full py-3 items-center mt-3"
                  style={{ backgroundColor: dangerColor }}
                >
                  <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 13, color: '#fff7ed' }}>
                    Request Help
                  </Text>
                </Pressable>
              </View>
            ) : null}

            <View className="mb-5">
              <Text className={`${textPrimary} text-base mb-3`} style={{ fontFamily: 'Manrope_700Bold' }}>
                Safety Circles
              </Text>
              <View className="gap-3">
                {(dashboard?.circles ?? []).map((circle) => (
                  <View key={circle.id} className={`${cardBg} rounded-2xl p-4`}>
                    <View className="flex-row items-center justify-between">
                      <View>
                        <Text className={textPrimary} style={{ fontFamily: 'Manrope_700Bold', fontSize: 16 }}>
                          {circle.name}
                        </Text>
                        <Text className={textSecondary} style={{ fontFamily: 'Manrope_400Regular', fontSize: 12, marginTop: 2 }}>
                          {circle.memberCount} members • check-in every {circle.quietCheckInIntervalMins} mins
                        </Text>
                      </View>
                      <View className="rounded-full px-3 py-1" style={{ backgroundColor: `${accentColor}22` }}>
                        <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 11, color: accentColor }}>
                          {circle.liveShareEnabled ? 'LIVE' : 'PAUSED'}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <View>
              <Text className={`${textPrimary} text-base mb-3`} style={{ fontFamily: 'Manrope_700Bold' }}>
                Recent Check-ins
              </Text>
              <View className="gap-3">
                {(dashboard?.recentCheckIns ?? []).map((checkIn) => (
                  <View key={checkIn.id} className={`${cardBg} rounded-2xl p-4`}>
                    <View className="flex-row items-center justify-between">
                      <Text className={textPrimary} style={{ fontFamily: 'Manrope_700Bold', fontSize: 15 }}>
                        {checkIn.status}
                      </Text>
                      <Text className={textSecondary} style={{ fontFamily: 'Manrope_500Medium', fontSize: 11 }}>
                        {new Date(checkIn.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </Text>
                    </View>
                    {checkIn.note ? (
                      <Text className={textSecondary} style={{ fontFamily: 'Manrope_400Regular', fontSize: 13, marginTop: 6 }}>
                        {checkIn.note}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
