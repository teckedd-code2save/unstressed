import { useEffect, useState } from 'react'
import { Alert, Pressable, ScrollView, Text, useColorScheme, View, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useGroupsDashboard } from '@/hooks/useGroupsDashboard'

function formatWindow(start: string | null, end: string | null) {
  if (!start || !end) return 'Scheduling window to be confirmed'
  const startDate = new Date(start)
  const endDate = new Date(end)
  return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}

export default function GroupsScreen() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const { dashboard, isLoading, isSubmittingVote, submitVote } = useGroupsDashboard()
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)

  const accentColor = isDark ? '#93d2d1' : '#156a67'
  const bg = isDark ? 'bg-dark-surface' : 'bg-surface'
  const cardBg = isDark ? 'bg-dark-surface-container-high' : 'bg-surface-container-low'
  const textPrimary = isDark ? 'text-dark-on-surface' : 'text-on-surface'
  const textSecondary = isDark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'
  const groups = dashboard?.groups ?? []
  const activeGroupId = dashboard?.activePlan?.groupId ?? groups[0]?.id ?? null
  const visibleGroupId = selectedGroupId ?? activeGroupId
  const visibleGroup = groups.find((group) => group.id === visibleGroupId) ?? null
  const visiblePlan = dashboard?.activePlan?.groupId === visibleGroupId ? dashboard.activePlan : null

  useEffect(() => {
    if (!selectedGroupId && activeGroupId) {
      setSelectedGroupId(activeGroupId)
    }
  }, [activeGroupId, selectedGroupId])

  const handleVote = async (optionId: string, optionTitle: string) => {
    try {
      await submitVote(optionId)
      Alert.alert('Vote recorded', `${optionTitle} is now your selected option.`)
    } catch (error) {
      Alert.alert('Unable to submit vote', error instanceof Error ? error.message : 'Please try again.')
    }
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
            {visiblePlan ? (
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
                  {visiblePlan.title}
                </Text>
                <Text
                  className={`${textSecondary} text-sm mt-1`}
                  style={{ fontFamily: 'Manrope_400Regular' }}
                >
                  {formatWindow(visiblePlan.window.start, visiblePlan.window.end)}
                </Text>

                <View className="flex-row flex-wrap gap-2 mt-3">
                  {visiblePlan.participants.map((participant) => (
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
                  {visiblePlan.options.map((option) => (
                    <Pressable
                      key={option.id}
                      disabled={isSubmittingVote}
                      onPress={() => handleVote(option.id, option.title)}
                      className="rounded-2xl p-4"
                      style={{
                        backgroundColor: option.isSelectedByUser
                          ? (isDark ? '#113737' : '#d6f2ef')
                          : (isDark ? '#1a2e2e' : '#e8f5f4'),
                        opacity: isSubmittingVote ? 0.7 : 1,
                      }}
                    >
                      <View className="flex-row items-start justify-between">
                        <View className="flex-1 pr-3">
                          <Text className={textPrimary} style={{ fontFamily: 'Manrope_700Bold', fontSize: 16 }}>
                            {option.title}
                          </Text>
                          <Text className={textSecondary} style={{ fontFamily: 'Manrope_400Regular', fontSize: 13, marginTop: 4 }}>
                            {option.whyItFits}
                          </Text>
                          <Text
                            style={{
                              fontFamily: 'Manrope_600SemiBold',
                              fontSize: 11,
                              marginTop: 8,
                              color: option.isSelectedByUser ? accentColor : (isDark ? '#aeb8b8' : '#5d605c'),
                              textTransform: 'uppercase',
                              letterSpacing: 0.6,
                            }}
                          >
                            {option.isSelectedByUser ? 'Your vote' : 'Tap to vote'}
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
            ) : (
              <View className={`${cardBg} rounded-3xl p-5 mb-5`}>
                <Text
                  className={textSecondary}
                  style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}
                >
                  Group Snapshot
                </Text>
                <Text className={`${textPrimary} text-2xl mt-1`} style={{ fontFamily: 'Manrope_700Bold' }}>
                  {visibleGroup?.name ?? 'Your group'}
                </Text>
                <Text className={`${textSecondary} text-sm mt-2`} style={{ fontFamily: 'Manrope_400Regular' }}>
                  {visibleGroup?.nextDecisionAt
                    ? `Next decision point: ${new Date(visibleGroup.nextDecisionAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}`
                    : 'No active voting round is open for this circle yet.'}
                </Text>
              </View>
            )}

            <View className="mb-5">
              <Text className={`${textPrimary} text-base mb-3`} style={{ fontFamily: 'Manrope_700Bold' }}>
                Your Circles
              </Text>
              <View className="gap-3">
                {groups.map((group) => (
                  <Pressable
                    key={group.id}
                    onPress={() => setSelectedGroupId(group.id)}
                    className={`${cardBg} rounded-2xl p-4 active:opacity-80`}
                    style={{
                      borderWidth: group.id === visibleGroupId ? 1 : 0,
                      borderColor: group.id === visibleGroupId ? accentColor : 'transparent',
                    }}
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
                {(visiblePlan?.itineraryDraft ?? []).map((item) => (
                  <View key={item.id} className={`${cardBg} rounded-2xl p-4`}>
                    <Text className={textSecondary} style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 11 }}>
                      {new Date(item.startsAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </Text>
                    <Text className={textPrimary} style={{ fontFamily: 'Manrope_700Bold', fontSize: 15, marginTop: 4 }}>
                      {item.title}
                    </Text>
                  </View>
                ))}
                {!visiblePlan ? (
                  <View className={`${cardBg} rounded-2xl p-4`}>
                    <Text className={textSecondary} style={{ fontFamily: 'Manrope_400Regular', fontSize: 13 }}>
                      Select a circle with an active plan to view the working itinerary.
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
