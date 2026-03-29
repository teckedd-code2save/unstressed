import { Alert, Pressable, ScrollView, Text, useColorScheme, View, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useGroupsDashboard } from '@/hooks/useGroupsDashboard'

function formatWindow(start: string, end: string) {
  const startDate = new Date(start)
  const endDate = new Date(end)
  return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}

export default function GroupsScreen() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const { dashboard, isLoading } = useGroupsDashboard()

  const accentColor = isDark ? '#93d2d1' : '#156a67'
  const bg = isDark ? 'bg-dark-surface' : 'bg-surface'
  const cardBg = isDark ? 'bg-dark-surface-container-high' : 'bg-surface-container-low'
  const textPrimary = isDark ? 'text-dark-on-surface' : 'text-on-surface'
  const textSecondary = isDark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'
  const showPlannedFeature = (feature: string) => {
    Alert.alert('Phase in progress', `${feature} will become interactive in the next slice.`)
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
            Group Planning
          </Text>
          <Text
            className={`${textPrimary} text-4xl`}
            style={{ fontFamily: 'Manrope_700Bold', letterSpacing: -1 }}
          >
            Plan Together
          </Text>
          <Text
            className={`${textSecondary} text-sm mt-1`}
            style={{ fontFamily: 'Manrope_400Regular' }}
          >
            Voting, consensus, and calm itineraries for your circles.
          </Text>
        </View>

        {isLoading ? (
          <ActivityIndicator color={accentColor} className="mt-10" />
        ) : (
          <>
            {dashboard?.activePlan ? (
              <View className={`${cardBg} rounded-3xl p-5 mb-5`}>
                <Text
                  className={textSecondary}
                  style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}
                >
                  Active Plan
                </Text>
                <Text
                  className={`${textPrimary} text-2xl mt-1`}
                  style={{ fontFamily: 'Manrope_700Bold' }}
                >
                  {dashboard.activePlan.title}
                </Text>
                <Text
                  className={`${textSecondary} text-sm mt-1`}
                  style={{ fontFamily: 'Manrope_400Regular' }}
                >
                  {formatWindow(dashboard.activePlan.window.start, dashboard.activePlan.window.end)}
                </Text>

                <View className="flex-row flex-wrap gap-2 mt-3">
                  {dashboard.activePlan.participants.map((participant) => (
                    <View
                      key={participant.userId}
                      className="rounded-full px-3 py-1"
                      style={{ backgroundColor: participant.voteStatus === 'SUBMITTED' ? `${accentColor}22` : isDark ? '#282a28' : '#eeeeea' }}
                    >
                      <Text
                        style={{
                          fontFamily: 'Manrope_600SemiBold',
                          fontSize: 12,
                          color: participant.voteStatus === 'SUBMITTED' ? accentColor : isDark ? '#bfc8c8' : '#5d605c',
                        }}
                      >
                        {participant.displayName}: {participant.voteStatus.toLowerCase()}
                      </Text>
                    </View>
                  ))}
                </View>

                <View className="mt-4 gap-3">
                  {dashboard.activePlan.options.map((option) => (
                    <Pressable
                      key={option.id}
                      onPress={() => showPlannedFeature(`Vote details for ${option.title}`)}
                      className="rounded-2xl p-4"
                      style={{ backgroundColor: isDark ? '#1a2e2e' : '#e8f5f4' }}
                    >
                      <View className="flex-row items-start justify-between">
                        <View className="flex-1 pr-3">
                          <Text className={textPrimary} style={{ fontFamily: 'Manrope_700Bold', fontSize: 16 }}>
                            {option.title}
                          </Text>
                          <Text className={textSecondary} style={{ fontFamily: 'Manrope_400Regular', fontSize: 13, marginTop: 4 }}>
                            {option.whyItFits}
                          </Text>
                        </View>
                        <View className="items-end">
                          <Text style={{ fontFamily: 'Manrope_800ExtraBold', fontSize: 20, color: accentColor }}>
                            {option.score}
                          </Text>
                          <Text className={textSecondary} style={{ fontFamily: 'Manrope_500Medium', fontSize: 11 }}>
                            {option.votes} votes
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null}

            <View className="mb-5">
              <Text className={`${textPrimary} text-base mb-3`} style={{ fontFamily: 'Manrope_700Bold' }}>
                Your Circles
              </Text>
              <View className="gap-3">
                {(dashboard?.groups ?? []).map((group) => (
                  <Pressable
                    key={group.id}
                    onPress={() => showPlannedFeature(group.name)}
                    className={`${cardBg} rounded-2xl p-4 active:opacity-80`}
                  >
                    <View className="flex-row items-center justify-between">
                      <View>
                        <Text className={textPrimary} style={{ fontFamily: 'Manrope_700Bold', fontSize: 16 }}>
                          {group.name}
                        </Text>
                        <Text className={textSecondary} style={{ fontFamily: 'Manrope_400Regular', fontSize: 12, marginTop: 2 }}>
                          {group.memberCount} members • {group.pendingVotes} pending votes
                        </Text>
                      </View>
                      <View className="rounded-full px-3 py-1" style={{ backgroundColor: `${accentColor}22` }}>
                        <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 11, color: accentColor }}>
                          {group.role}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

            <View>
              <Text className={`${textPrimary} text-base mb-3`} style={{ fontFamily: 'Manrope_700Bold' }}>
                Itinerary Draft
              </Text>
              <View className="gap-3">
                {(dashboard?.activePlan?.itineraryDraft ?? []).map((item) => (
                  <View key={item.id} className={`${cardBg} rounded-2xl p-4`}>
                    <Text className={textSecondary} style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 11 }}>
                      {new Date(item.startsAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </Text>
                    <Text className={textPrimary} style={{ fontFamily: 'Manrope_700Bold', fontSize: 15, marginTop: 4 }}>
                      {item.title}
                    </Text>
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
