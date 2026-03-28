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
import { useCollections } from '@/hooks/useCollections'

export default function CollectionsScreen() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const { trips, folders, recentlySaved, isLoading } = useCollections()

  const accentColor = isDark ? '#93d2d1' : '#156a67'
  const bg = isDark ? 'bg-dark-surface' : 'bg-surface'
  const cardBg = isDark ? 'bg-dark-surface-container-high' : 'bg-surface-container-low'
  const textPrimary = isDark ? 'text-dark-on-surface' : 'text-on-surface'
  const textSecondary = isDark ? 'text-dark-on-surface-variant' : 'text-on-surface-variant'
  const showPlannedFeature = (feature: string) => {
    Alert.alert('In progress', `${feature} is queued for implementation.`)
  }

  return (
    <SafeAreaView className={`flex-1 ${bg}`} edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-start justify-between mt-4 mb-1">
          <View>
            <Text
              className={textSecondary}
              style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}
            >
              Your Sanctuary
            </Text>
            <Text
              className={`${textPrimary} text-4xl`}
              style={{ fontFamily: 'Manrope_700Bold', letterSpacing: -1 }}
            >
              Collections
            </Text>
          </View>
          <View className="flex-row gap-3 pt-2">
            <Pressable onPress={() => showPlannedFeature('Collections search')}><Text style={{ fontSize: 20 }}>🔍</Text></Pressable>
            <Pressable onPress={() => showPlannedFeature('Collections settings')}><Text style={{ fontSize: 20 }}>⚙️</Text></Pressable>
          </View>
        </View>

        {/* Tab bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-5 mt-3"
          contentContainerStyle={{ gap: 8 }}
        >
          {['All Trips', 'Saved Places', 'Shared Folders', 'Archive'].map((tab, i) => (
            <Pressable
              key={tab}
              onPress={() => showPlannedFeature(`${tab} filter`)}
              className="rounded-full px-4 py-2"
              style={{ backgroundColor: i === 0 ? accentColor : isDark ? '#282a28' : '#eeeeea' }}
            >
              <Text
                style={{
                  fontFamily: 'Manrope_600SemiBold',
                  fontSize: 13,
                  color: i === 0 ? (isDark ? '#003737' : '#e1fffc') : isDark ? '#bfc8c8' : '#5d605c',
                }}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {isLoading ? (
          <ActivityIndicator color={accentColor} className="mt-12" />
        ) : (
          <>
            {/* Planned trips */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <Text
                  className={`${textPrimary} text-base`}
                  style={{ fontFamily: 'Manrope_700Bold' }}
                >
                  Planned Trips
                </Text>
                <Pressable onPress={() => showPlannedFeature('All trips view')}>
                  <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 13, color: accentColor }}>
                    View all
                  </Text>
                </Pressable>
              </View>

              <View className="gap-3">
                {trips.map((trip) => (
                  <Pressable
                    key={trip.id}
                    onPress={() => showPlannedFeature(trip.name)}
                    className={`${cardBg} rounded-2xl overflow-hidden active:opacity-90`}
                  >
                    {trip.coverImage ? (
                      <Image
                        source={{ uri: trip.coverImage }}
                        className="w-full h-40"
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        className="w-full h-40"
                        style={{ backgroundColor: isDark ? '#1a2e2e' : '#d9f0ee' }}
                      />
                    )}
                    <View className="absolute top-3 left-3 rounded-full px-2 py-1 bg-black/40">
                      <Text
                        style={{
                          fontFamily: 'Manrope_600SemiBold',
                          fontSize: 10,
                          color: 'white',
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                        }}
                      >
                        {trip.daysUntil ? `In ${trip.daysUntil} days` : trip.dateRange}
                      </Text>
                    </View>
                    <View className="p-4">
                      <Text
                        className={`${textPrimary} text-lg`}
                        style={{ fontFamily: 'Manrope_700Bold' }}
                      >
                        {trip.name}
                      </Text>
                      <View className="flex-row items-center justify-between mt-1">
                        <Text
                          className={textSecondary}
                          style={{ fontFamily: 'Manrope_400Regular', fontSize: 13 }}
                        >
                          {trip.subtitle}
                        </Text>
                        {trip.memberAvatars?.length ? (
                          <View className="flex-row">
                            {trip.memberAvatars.slice(0, 3).map((avatar, i) => (
                              <View
                                key={i}
                                className="w-6 h-6 rounded-full overflow-hidden border-2"
                                style={{
                                  marginLeft: i > 0 ? -6 : 0,
                                  borderColor: isDark ? '#121412' : '#faf9f6',
                                }}
                              >
                                <Image source={{ uri: avatar }} className="w-full h-full" />
                              </View>
                            ))}
                          </View>
                        ) : null}
                      </View>
                    </View>
                  </Pressable>
                ))}

                {/* Add new trip CTA */}
                <Pressable
                  onPress={() => showPlannedFeature('Trip creation')}
                  className="rounded-2xl border-2 border-dashed items-center py-8 active:opacity-80"
                  style={{ borderColor: `${accentColor}40` }}
                >
                  <Text style={{ fontSize: 24, marginBottom: 6, color: accentColor }}>+</Text>
                  <Text
                    className={textSecondary}
                    style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 14 }}
                  >
                    Plan something new
                  </Text>
                  <Text
                    className={textSecondary}
                    style={{ fontFamily: 'Manrope_400Regular', fontSize: 12 }}
                  >
                    Ready to escape the noise?
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Saved folders */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <Text
                  className={`${textPrimary} text-base`}
                  style={{ fontFamily: 'Manrope_700Bold' }}
                >
                  Saved Collections
                </Text>
                <Pressable
                  onPress={() => showPlannedFeature('Folder creation')}
                  className="flex-row items-center gap-1 rounded-full px-3 py-1.5"
                  style={{ backgroundColor: accentColor }}
                >
                  <Text
                    style={{
                      fontFamily: 'Manrope_600SemiBold',
                      fontSize: 12,
                      color: isDark ? '#003737' : '#e1fffc',
                    }}
                  >
                    + New Folder
                  </Text>
                </Pressable>
              </View>

              <View className="gap-3">
                {folders.map((folder) => (
                  <Pressable
                    key={folder.id}
                    onPress={() => showPlannedFeature(folder.name)}
                    className={`${cardBg} rounded-2xl p-4 flex-row items-center active:opacity-90`}
                  >
                    <View
                      className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                      style={{ backgroundColor: `${accentColor}20` }}
                    >
                      <Text style={{ fontSize: 22 }}>{folder.icon}</Text>
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`${textPrimary} text-base`}
                        style={{ fontFamily: 'Manrope_600SemiBold' }}
                      >
                        {folder.name}
                      </Text>
                      <Text
                        className={textSecondary}
                        style={{ fontFamily: 'Manrope_400Regular', fontSize: 12 }}
                      >
                        {folder.description}
                      </Text>
                      <View className="flex-row gap-2 mt-1">
                        {folder.tags?.map((tag) => (
                          <Text
                            key={tag}
                            className={textSecondary}
                            style={{ fontFamily: 'Manrope_400Regular', fontSize: 11 }}
                          >
                            {tag}
                          </Text>
                        ))}
                      </View>
                    </View>
                    <View className="items-end">
                      <Text
                        style={{ fontFamily: 'Manrope_700Bold', fontSize: 16, color: accentColor }}
                      >
                        {folder.itemCount}
                      </Text>
                      <Text
                        className={textSecondary}
                        style={{ fontFamily: 'Manrope_400Regular', fontSize: 10 }}
                      >
                        places
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Recently saved */}
            {recentlySaved.length > 0 && (
              <View>
                <Text
                  className={`${textPrimary} text-base mb-3`}
                  style={{ fontFamily: 'Manrope_700Bold' }}
                >
                  Recently Saved
                </Text>
                <View className="gap-3">
                  {recentlySaved.map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={() => showPlannedFeature(item.name)}
                      className={`${cardBg} rounded-2xl p-3 flex-row items-center gap-3 active:opacity-90`}
                    >
                      {item.imageUrl ? (
                        <Image
                          source={{ uri: item.imageUrl }}
                          className="w-16 h-16 rounded-xl"
                          resizeMode="cover"
                        />
                      ) : (
                        <View
                          className="w-16 h-16 rounded-xl items-center justify-center"
                          style={{ backgroundColor: `${accentColor}20` }}
                        >
                          <Text style={{ fontSize: 20 }}>{item.collectionName.slice(0, 1)}</Text>
                        </View>
                      )}
                      <View className="flex-1">
                        <Text
                          className={`${textPrimary} text-sm`}
                          style={{ fontFamily: 'Manrope_600SemiBold' }}
                        >
                          {item.name}
                        </Text>
                        <Text
                          className={textSecondary}
                          style={{ fontFamily: 'Manrope_400Regular', fontSize: 12 }}
                        >
                          {item.location}
                        </Text>
                        <Text
                          className={textSecondary}
                          style={{ fontFamily: 'Manrope_400Regular', fontSize: 11 }}
                        >
                          Saved to '{item.collectionName}'
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
