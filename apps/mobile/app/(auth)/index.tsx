import { View, Text, Pressable, ImageBackground } from 'react-native'
import { useRouter } from 'expo-router'
import { useSignIn, useSignUp, useOAuth } from '@clerk/clerk-expo'
import { LinearGradient } from 'expo-linear-gradient'
import { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function WelcomeScreen() {
  const router = useRouter()
  const { startOAuthFlow: startGoogleOAuth } = useOAuth({ strategy: 'oauth_google' })
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      const { createdSessionId, setActive } = await startGoogleOAuth()
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId })
        router.replace('/(tabs)/')
      }
    } catch (err) {
      console.error('OAuth error', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="flex-1 bg-dark-surface">
      <LinearGradient
        colors={['rgba(18,20,18,0.0)', 'rgba(18,20,18,0.6)', 'rgba(18,20,18,1)']}
        className="absolute inset-0"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <SafeAreaView className="flex-1 justify-end px-6 pb-12">
        {/* Logo mark */}
        <View className="mb-2">
          <View className="w-10 h-10 rounded-full bg-dark-primary/20 items-center justify-center mb-6">
            <View className="w-3 h-3 rounded-full bg-dark-primary" />
          </View>
          <Text
            className="text-dark-on-surface text-5xl leading-tight mb-3"
            style={{ fontFamily: 'Manrope_700Bold', letterSpacing: -1 }}
          >
            Find your{'\n'}calm.
          </Text>
          <Text
            className="text-dark-on-surface-variant text-base leading-relaxed mb-10"
            style={{ fontFamily: 'Manrope_400Regular' }}
          >
            A proactive sanctuary that learns your rhythm and guides you toward rest, focus, and joy.
          </Text>
        </View>

        {/* CTAs */}
        <Pressable
          onPress={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-dark-primary rounded-full py-4 items-center mb-3 active:opacity-80"
        >
          <Text
            className="text-dark-on-primary text-base"
            style={{ fontFamily: 'Manrope_600SemiBold' }}
          >
            {loading ? 'Connecting...' : 'Continue with Google'}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/(auth)/email')}
          className="w-full border border-dark-on-surface-variant/20 rounded-full py-4 items-center active:opacity-80"
        >
          <Text
            className="text-dark-on-surface-variant text-base"
            style={{ fontFamily: 'Manrope_500Medium' }}
          >
            Continue with email
          </Text>
        </Pressable>

        <Text
          className="text-dark-on-surface-variant/50 text-xs text-center mt-6 leading-relaxed"
          style={{ fontFamily: 'Manrope_400Regular' }}
        >
          By continuing, you agree to our Terms and Privacy Policy.{'\n'}Your data stays private and never sold.
        </Text>
      </SafeAreaView>
    </View>
  )
}
