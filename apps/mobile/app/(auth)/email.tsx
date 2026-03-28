import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { useSignIn, useSignUp } from '@clerk/clerk-expo'
import { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function EmailAuthScreen() {
  const router = useRouter()
  const { signIn, setActive: setSignInActive, isLoaded: signInLoaded } = useSignIn()
  const { signUp, setActive: setSignUpActive, isLoaded: signUpLoaded } = useSignUp()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [stage, setStage] = useState<'input' | 'verify'>('input')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!signInLoaded || !signUpLoaded) return
    setLoading(true)
    setError('')
    try {
      if (isSignUp) {
        await signUp.create({ emailAddress: email, password })
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
        setStage('verify')
      } else {
        const result = await signIn.create({ identifier: email, password })
        if (result.status === 'complete' && setSignInActive) {
          await setSignInActive({ session: result.createdSessionId })
          router.replace('/')
        }
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!signUpLoaded) return
    setLoading(true)
    setError('')
    try {
      const result = await signUp.attemptEmailAddressVerification({ code })
      if (result.status === 'complete' && setSignUpActive) {
        await setSignUpActive({ session: result.createdSessionId })
        router.replace('/')
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message ?? 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 px-6 pt-8"
      >
        <Pressable onPress={() => router.back()} className="mb-8">
          <Text className="text-on-surface-variant" style={{ fontFamily: 'Manrope_500Medium' }}>
            ← Back
          </Text>
        </Pressable>

        <Text
          className="text-on-surface text-3xl mb-2"
          style={{ fontFamily: 'Manrope_700Bold', letterSpacing: -0.5 }}
        >
          {stage === 'verify' ? 'Check your email' : isSignUp ? 'Create account' : 'Welcome back'}
        </Text>
        <Text
          className="text-on-surface-variant text-base mb-8"
          style={{ fontFamily: 'Manrope_400Regular' }}
        >
          {stage === 'verify'
            ? `We sent a code to ${email}`
            : 'Your sanctuary awaits.'}
        </Text>

        {stage === 'input' ? (
          <>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email address"
              placeholderTextColor="#5d605c"
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-surface-container-low rounded-xl px-4 py-4 text-on-surface mb-3"
              style={{ fontFamily: 'Manrope_400Regular' }}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="#5d605c"
              secureTextEntry
              className="bg-surface-container-low rounded-xl px-4 py-4 text-on-surface mb-6"
              style={{ fontFamily: 'Manrope_400Regular' }}
            />
          </>
        ) : (
          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder="6-digit code"
            placeholderTextColor="#5d605c"
            keyboardType="number-pad"
            className="bg-surface-container-low rounded-xl px-4 py-4 text-on-surface mb-6"
            style={{ fontFamily: 'Manrope_400Regular', letterSpacing: 8, fontSize: 20 }}
          />
        )}

        {error ? (
          <Text className="text-error text-sm mb-4" style={{ fontFamily: 'Manrope_400Regular' }}>
            {error}
          </Text>
        ) : null}

        <Pressable
          onPress={stage === 'verify' ? handleVerify : handleSubmit}
          disabled={loading}
          className="bg-primary rounded-full py-4 items-center mb-4 active:opacity-80"
        >
          <Text
            className="text-on-primary text-base"
            style={{ fontFamily: 'Manrope_600SemiBold' }}
          >
            {loading ? 'Please wait...' : stage === 'verify' ? 'Verify' : isSignUp ? 'Create account' : 'Sign in'}
          </Text>
        </Pressable>

        {stage === 'input' && (
          <Pressable onPress={() => setIsSignUp(!isSignUp)}>
            <Text
              className="text-on-surface-variant text-sm text-center"
              style={{ fontFamily: 'Manrope_400Regular' }}
            >
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <Text className="text-primary" style={{ fontFamily: 'Manrope_600SemiBold' }}>
                {isSignUp ? 'Sign in' : 'Sign up'}
              </Text>
            </Text>
          </Pressable>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
