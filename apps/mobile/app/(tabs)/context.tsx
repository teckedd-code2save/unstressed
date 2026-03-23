import React from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  useColorScheme,
  ActivityIndicator,
  Modal,
  TextInput,
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

  const [connectingCal, setConnectingCal] = React.useState<string | null>(null)
  const [activeModal, setActiveModal] = React.useState<'circadian' | 'silence' | 'biometric' | null>(null)
  const [editWake, setEditWake] = React.useState(context?.circadianWakeTime ?? '07:15')
  const [editSilenceStart, setEditSilenceStart] = React.useState(context?.silenceStart ?? '22:00')
  const [editSilenceEnd, setEditSilenceEnd] = React.useState(context?.silenceEnd ?? '08:00')
  const [editHealth, setEditHealth] = React.useState<string | null>(context?.healthProvider ?? null)

  // Sync modal state when context loads
  React.useEffect(() => {
    if (context) {
      setEditWake(context.circadianWakeTime ?? '07:15')
      setEditSilenceStart(context.silenceStart ?? '22:00')
      setEditSilenceEnd(context.silenceEnd ?? '08:00')
      setEditHealth(context.healthProvider ?? null)
    }
  }, [context])

  const accentColor = isDark ? '#93d2d1' : '#156a67'
  const bg = isDark ? 'bg-dark-surface' : 'bg-surface'
  const cardBg = isDark ? 'bg-dark-surface-container-high' : 'bg-surface-container-low'
  const textPrimary = isDark ? 'text-dark-on-surface' : 'text-on-surface'
  const textSecondary = isDark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'
  const surfaceBg = isDark ? '#1e201e' : '#faf9f6'
  const inputBg = isDark ? '#282a28' : '#eeeeea'
  const textColor = isDark ? '#fff' : '#1a1a1a'

  const completionPct = context ? Math.round(
    ([
      context.calendarProvider,
      context.healthProvider,
      context.circadianWakeTime,
      context.silenceStart,
      context.preferredSanctuaries?.length,
      context.energyLevel,
    ].filter(Boolean).length / 6) * 100,
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
              <Text className={`${textPrimary} text-base mb-1`} style={{ fontFamily: 'Manrope_700Bold' }}>
                Profile Depth
              </Text>
              <Text className={textSecondary} style={{ fontFamily: 'Manrope_400Regular', fontSize: 13 }}>
                Your context is {completionPct}% personalized.
              </Text>
              <Text style={{ fontFamily: 'Manrope_800ExtraBold', fontSize: 36, color: accentColor, marginTop: 4 }}>
                {completionPct}%
              </Text>
              <View className="h-1.5 rounded-full mt-2" style={{ backgroundColor: isDark ? '#282a28' : '#e1e3de' }}>
                <View className="h-full rounded-full" style={{ width: `${completionPct}%`, backgroundColor: accentColor }} />
              </View>
            </View>

            {/* Calendar connections */}
            <View className={`${cardBg} rounded-2xl p-4 mb-4`}>
              <Text className={`${textPrimary} text-base mb-1`} style={{ fontFamily: 'Manrope_700Bold' }}>
                Calendar Connections
              </Text>
              <Text className={`${textSecondary} text-sm mb-3`} style={{ fontFamily: 'Manrope_400Regular' }}>
                Sync your life to find pockets of silence.
              </Text>

              {[
                { id: 'google', name: 'Google Calendar', icon: '📅' },
                { id: 'outlook', name: 'Outlook', icon: '📧' },
              ].map((cal, idx) => {
                const isConnected = context?.calendarProvider === cal.id
                const isConnecting = connectingCal === cal.id
                return (
                  <View
                    key={cal.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: 12,
                      borderBottomWidth: idx === 0 ? 1 : 0,
                      borderBottomColor: isDark ? '#282a28' : '#e5e7e3',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <Text style={{ fontSize: 20 }}>{cal.icon}</Text>
                      <View>
                        <Text className={textPrimary} style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 14 }}>
                          {cal.name}
                        </Text>
                        <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 11, color: isConnected ? accentColor : isDark ? '#bfc8c8' : '#5d605c' }}>
                          {isConnected ? 'Active · Work & Personal' : 'Not connected'}
                        </Text>
                      </View>
                    </View>
                    {isConnected ? (
                      <Pressable
                        onPress={() => updateContext({ calendarProvider: null as any })}
                        style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, backgroundColor: isDark ? '#282a28' : '#e5e7e3' }}
                      >
                        <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 12, color: '#ef4444' }}>
                          Disconnect
                        </Text>
                      </Pressable>
                    ) : (
                      <Pressable
                        onPress={async () => {
                          setConnectingCal(cal.id)
                          await updateContext({ calendarProvider: cal.id as any })
                          setConnectingCal(null)
                        }}
                        disabled={isConnecting}
                        style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, borderWidth: 1, borderColor: accentColor, opacity: isConnecting ? 0.6 : 1 }}
                      >
                        <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 12, color: accentColor }}>
                          {isConnecting ? 'Connecting...' : 'Connect'}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                )
              })}
            </View>

            {/* Energy blueprint */}
            <View className={`${cardBg} rounded-2xl p-4 mb-4`}>
              <Text className={`${textPrimary} text-base mb-1`} style={{ fontFamily: 'Manrope_700Bold' }}>
                Weekly Energy Blueprint
              </Text>
              <Text className={`${textSecondary} text-sm mb-4`} style={{ fontFamily: 'Manrope_400Regular' }}>
                Map your natural peaks and valleys throughout the week.
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 80 }}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                  const heights = [60, 75, 90, 50, 40, 80, 65]
                  const isToday = i === new Date().getDay() - 1
                  return (
                    <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                      <View style={{ width: '100%', borderRadius: 6, height: heights[i], backgroundColor: isToday ? accentColor : `${accentColor}30` }} />
                      <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 10, color: isToday ? accentColor : isDark ? '#bfc8c8' : '#5d605c' }}>
                        {day}
                      </Text>
                    </View>
                  )
                })}
              </View>
            </View>

            {/* Focus parameters */}
            <View className="mb-4">
              <Text className={`${textSecondary} text-xs mb-3`} style={{ fontFamily: 'Manrope_600SemiBold', letterSpacing: 1, textTransform: 'uppercase' }}>
                Focus Parameters
              </Text>
              {[
                { icon: '🌙', title: 'Circadian Alignment', subtitle: `Natural wake-up at ${context?.circadianWakeTime ?? '7:15 AM'}`, modal: 'circadian' as const },
                { icon: '🔕', title: 'Silence Protocols', subtitle: `Active: ${context?.silenceStart ?? '10 PM'} – ${context?.silenceEnd ?? '8 AM'}`, modal: 'silence' as const },
                { icon: '💪', title: 'Bio-metric Sync', subtitle: context?.healthProvider ? `${context.healthProvider} linked` : 'Not connected', modal: 'biometric' as const },
              ].map((param) => (
                <Pressable
                  key={param.title}
                  onPress={() => setActiveModal(param.modal)}
                  className={`${cardBg} rounded-2xl p-4 mb-2 flex-row items-center active:opacity-80`}
                >
                  <Text style={{ fontSize: 20, marginRight: 12 }}>{param.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text className={textPrimary} style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 14 }}>{param.title}</Text>
                    <Text className={textSecondary} style={{ fontFamily: 'Manrope_400Regular', fontSize: 12 }}>{param.subtitle}</Text>
                  </View>
                  <Text style={{ color: accentColor, fontSize: 16 }}>›</Text>
                </Pressable>
              ))}
            </View>

            {/* Preferred sanctuaries */}
            <View className="mb-6">
              <Text className={`${textPrimary} text-base mb-3`} style={{ fontFamily: 'Manrope_700Bold' }}>
                Preferred Sanctuaries
              </Text>
              <Text className={`${textSecondary} text-sm mb-3`} style={{ fontFamily: 'Manrope_400Regular' }}>
                What environments restore you most?
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {SANCTUARY_OPTIONS.map((s) => {
                  const selected = context?.preferredSanctuaries?.includes(s.id)
                  return (
                    <Pressable
                      key={s.id}
                      onPress={() => {
                        const current = context?.preferredSanctuaries ?? []
                        const next = selected ? current.filter((id) => id !== s.id) : [...current, s.id]
                        updateContext({ preferredSanctuaries: next })
                      }}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: selected ? accentColor : isDark ? '#282a28' : '#eeeeea' }}
                    >
                      <Text style={{ fontSize: 14 }}>{s.icon}</Text>
                      <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 13, color: selected ? isDark ? '#003737' : '#e1fffc' : isDark ? '#bfc8c8' : '#5d605c' }}>
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
              style={{ backgroundColor: accentColor, borderRadius: 99, paddingVertical: 16, alignItems: 'center' }}
            >
              <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 16, color: isDark ? '#003737' : '#e1fffc' }}>
                {isSaving ? 'Saving...' : 'Save Context Profile'}
              </Text>
            </Pressable>
            <Text className={`${textSecondary} text-xs text-center mt-3`} style={{ fontFamily: 'Manrope_400Regular' }}>
              Your health & calendar data stays private and on-device.
            </Text>
          </>
        )}
      </ScrollView>

      {/* ── Circadian Modal ────────────────────────────────── */}
      <Modal visible={activeModal === 'circadian'} transparent animationType="slide" onRequestClose={() => setActiveModal(null)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={() => setActiveModal(null)} />
        <View style={{ backgroundColor: surfaceBg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 }}>
          <View style={{ width: 36, height: 4, backgroundColor: isDark ? '#484849' : '#d1d5db', borderRadius: 2, alignSelf: 'center', marginBottom: 20 }} />
          <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 18, color: textColor, marginBottom: 16 }}>Circadian Alignment</Text>
          <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 13, color: isDark ? '#bfc8c8' : '#5d605c', marginBottom: 8 }}>Natural wake-up time (HH:MM)</Text>
          <TextInput
            value={editWake}
            onChangeText={setEditWake}
            style={{ backgroundColor: inputBg, borderRadius: 12, padding: 14, fontFamily: 'Manrope_500Medium', fontSize: 16, color: textColor }}
            keyboardType="numbers-and-punctuation"
            placeholder="07:15"
            placeholderTextColor={isDark ? '#484849' : '#9ca3af'}
          />
          <Pressable
            onPress={() => { updateContext({ circadianWakeTime: editWake }); setActiveModal(null) }}
            style={{ backgroundColor: accentColor, borderRadius: 99, padding: 14, alignItems: 'center', marginTop: 16 }}
          >
            <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 15, color: isDark ? '#003737' : '#e1fffc' }}>Save</Text>
          </Pressable>
        </View>
      </Modal>

      {/* ── Silence Modal ─────────────────────────────────── */}
      <Modal visible={activeModal === 'silence'} transparent animationType="slide" onRequestClose={() => setActiveModal(null)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={() => setActiveModal(null)} />
        <View style={{ backgroundColor: surfaceBg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 }}>
          <View style={{ width: 36, height: 4, backgroundColor: isDark ? '#484849' : '#d1d5db', borderRadius: 2, alignSelf: 'center', marginBottom: 20 }} />
          <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 18, color: textColor, marginBottom: 16 }}>Silence Protocols</Text>
          <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 13, color: isDark ? '#bfc8c8' : '#5d605c', marginBottom: 8 }}>Silence starts (HH:MM)</Text>
          <TextInput
            value={editSilenceStart}
            onChangeText={setEditSilenceStart}
            style={{ backgroundColor: inputBg, borderRadius: 12, padding: 14, fontFamily: 'Manrope_500Medium', fontSize: 16, color: textColor, marginBottom: 12 }}
            keyboardType="numbers-and-punctuation"
            placeholder="22:00"
            placeholderTextColor={isDark ? '#484849' : '#9ca3af'}
          />
          <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 13, color: isDark ? '#bfc8c8' : '#5d605c', marginBottom: 8 }}>Silence ends (HH:MM)</Text>
          <TextInput
            value={editSilenceEnd}
            onChangeText={setEditSilenceEnd}
            style={{ backgroundColor: inputBg, borderRadius: 12, padding: 14, fontFamily: 'Manrope_500Medium', fontSize: 16, color: textColor }}
            keyboardType="numbers-and-punctuation"
            placeholder="08:00"
            placeholderTextColor={isDark ? '#484849' : '#9ca3af'}
          />
          <Pressable
            onPress={() => { updateContext({ silenceStart: editSilenceStart, silenceEnd: editSilenceEnd }); setActiveModal(null) }}
            style={{ backgroundColor: accentColor, borderRadius: 99, padding: 14, alignItems: 'center', marginTop: 16 }}
          >
            <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 15, color: isDark ? '#003737' : '#e1fffc' }}>Save</Text>
          </Pressable>
        </View>
      </Modal>

      {/* ── Bio-metric Modal ──────────────────────────────── */}
      <Modal visible={activeModal === 'biometric'} transparent animationType="slide" onRequestClose={() => setActiveModal(null)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={() => setActiveModal(null)} />
        <View style={{ backgroundColor: surfaceBg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 }}>
          <View style={{ width: 36, height: 4, backgroundColor: isDark ? '#484849' : '#d1d5db', borderRadius: 2, alignSelf: 'center', marginBottom: 20 }} />
          <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 18, color: textColor, marginBottom: 16 }}>Bio-metric Sync</Text>
          {[
            { id: 'apple_health', label: 'Apple Health', icon: '🍎' },
            { id: 'google_fit', label: 'Google Fit', icon: '🏃' },
            { id: 'oura', label: 'Oura Ring', icon: '💍' },
          ].map((opt) => (
            <Pressable
              key={opt.id}
              onPress={() => setEditHealth(opt.id)}
              style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                padding: 14, borderRadius: 12, marginBottom: 8,
                backgroundColor: editHealth === opt.id ? `${accentColor}25` : inputBg,
                borderWidth: 1, borderColor: editHealth === opt.id ? accentColor : 'transparent',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ fontSize: 20 }}>{opt.icon}</Text>
                <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 14, color: textColor }}>{opt.label}</Text>
              </View>
              {editHealth === opt.id && <Text style={{ color: accentColor, fontSize: 16 }}>✓</Text>}
            </Pressable>
          ))}
          <Pressable
            onPress={() => { updateContext({ healthProvider: editHealth as any }); setActiveModal(null) }}
            style={{ backgroundColor: accentColor, borderRadius: 99, padding: 14, alignItems: 'center', marginTop: 8 }}
          >
            <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 15, color: isDark ? '#003737' : '#e1fffc' }}>Save</Text>
          </Pressable>
        </View>
      </Modal>

    </SafeAreaView>
  )
}
