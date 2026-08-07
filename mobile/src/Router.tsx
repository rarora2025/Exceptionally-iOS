import React from 'react';
import { View } from 'react-native';
import { useStore, Screen } from './state/store';
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
import FascSeedScreen from './screens/FascSeedScreen';
import FascInterviewScreen from './screens/FascInterviewScreen';
import ToolsScreen from './screens/ToolsScreen';
import ToolRunScreen from './screens/ToolRunScreen';
import ChatScreen from './screens/ChatScreen';

// Screens that show the floating tab bar.
const TABBED: Screen[] = [
  'home', 'profile', 'tools', 'people', 'artifact',
  'fascHub', 'fascBucket', 'fascSeed', 'fascInterview', 'fascResult', 'toolRun',
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
    case 'fascSeed': return <FascSeedScreen />;
    case 'fascInterview':
    case 'fascResult': return <FascInterviewScreen />;
    case 'tools': return <ToolsScreen />;
    case 'toolRun': return <ToolRunScreen />;
    case 'chat': return <ChatScreen />;
    default: return <HomeScreen />;
  }
}

export default function Router() {
  const { state } = useStore();
  const showTabs = TABBED.includes(state.screen);
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenFor screen={state.screen} />
      {showTabs ? <TabBar /> : null}
    </View>
  );
}
