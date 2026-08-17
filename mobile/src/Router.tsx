import React from 'react';
import { View, ActivityIndicator, Animated, Easing } from 'react-native';
import { useStore, Screen } from './state/store';
import { useAuth } from './state/auth';
import { colors } from './theme';
import TabBar from './ui/TabBar';

import AuthScreen from './screens/AuthScreen';
import SignupScreen from './screens/SignupScreen';
import LoginScreen from './screens/LoginScreen';
import DoorsScreen from './screens/DoorsScreen';
import InviteScreen from './screens/InviteScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import ArtifactScreen from './screens/ArtifactScreen';
import PeopleScreen from './screens/PeopleScreen';
import FascHubScreen from './screens/FascHubScreen';
import FascBucketScreen from './screens/FascBucketScreen';
import FascDiscoverScreen from './screens/FascDiscoverScreen';
import FascTopicsScreen from './screens/FascTopicsScreen';
import FascSeedScreen from './screens/FascSeedScreen';
import FascInterviewScreen from './screens/FascInterviewScreen';
import ToolsScreen from './screens/ToolsScreen';
import ToolRunScreen from './screens/ToolRunScreen';
import ChatScreen from './screens/ChatScreen';
import TranscriptScreen from './screens/TranscriptScreen';
import SynthesisScreen from './screens/SynthesisScreen';
import { CLandScreen, CIntroScreen, CInterviewScreen, CReviewScreen, CDoneScreen } from './screens/CreationFlow';

// Screens that show the floating tab bar.
const TABBED: Screen[] = [
  'home', 'profile', 'tools', 'people', 'artifact',
  'fascHub', 'fascBucket', 'fascDiscover', 'fascTopics', 'fascSeed', 'fascInterview', 'fascResult', 'toolRun',
  'transcript', 'synthesis',
];

// Screens reachable without a session (auth + onboarding continues right after
// signup while the session settles, and the external creation flow is public).
const PUBLIC_SCREENS: Screen[] = [
  'auth', 'login', 'signup', 'doors', 'invite',
  'cLand', 'cIntro', 'cInterview', 'cReview', 'cDone',
];

function ScreenFor({ screen }: { screen: Screen }) {
  switch (screen) {
    case 'auth': return <AuthScreen />;
    case 'signup': return <SignupScreen />;
    case 'login': return <LoginScreen />;
    case 'doors': return <DoorsScreen />;
    case 'invite': return <InviteScreen />;
    case 'home': return <HomeScreen />;
    case 'profile': return <ProfileScreen />;
    case 'artifact': return <ArtifactScreen />;
    case 'people': return <PeopleScreen />;
    case 'fascHub': return <FascHubScreen />;
    case 'fascBucket': return <FascBucketScreen />;
    case 'fascDiscover': return <FascDiscoverScreen />;
    case 'fascTopics': return <FascTopicsScreen />;
    case 'fascSeed': return <FascSeedScreen />;
    case 'fascInterview':
    case 'fascResult': return <FascInterviewScreen />;
    case 'tools': return <ToolsScreen />;
    case 'toolRun': return <ToolRunScreen />;
    case 'chat': return <ChatScreen />;
    case 'transcript': return <TranscriptScreen />;
    case 'synthesis': return <SynthesisScreen />;
    case 'cLand': return <CLandScreen />;
    case 'cIntro': return <CIntroScreen />;
    case 'cInterview': return <CInterviewScreen />;
    case 'cReview': return <CReviewScreen />;
    case 'cDone': return <CDoneScreen />;
    default: return <HomeScreen />;
  }
}

// Cross-fades + gently lifts each screen as it enters, so navigation reads as a
// native transition instead of a hard cut between web-style pages.
function AnimatedScreen({ screen }: { screen: Screen }) {
  const anim = React.useRef(new Animated.Value(1)).current;
  React.useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [screen, anim]);
  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
      }}
    >
      <ScreenFor screen={screen} />
    </Animated.View>
  );
}

export default function Router() {
  const { state, go, hydrate, reset } = useStore();
  const { configured, loading, session } = useAuth();

  // Session gate + data hydration (only when Supabase is configured).
  React.useEffect(() => {
    if (!configured || loading) return;
    if (session) {
      if (!state.hydrated) hydrate();
      if (state.screen === 'auth' || state.screen === 'login') go('home');
    } else {
      if (state.hydrated) reset();
      else if (!PUBLIC_SCREENS.includes(state.screen)) go('auth');
    }
  }, [configured, loading, session, state.screen, state.hydrated, go, hydrate, reset]);

  if (configured && loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.ink} />
      </View>
    );
  }

  const showTabs = TABBED.includes(state.screen);
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AnimatedScreen screen={state.screen} />
      {showTabs ? <TabBar /> : null}
    </View>
  );
}
