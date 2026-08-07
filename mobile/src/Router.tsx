import React from 'react';
import { useStore } from './state/store';
import AuthScreen from './screens/AuthScreen';
import SignupScreen from './screens/SignupScreen';
import LoginScreen from './screens/LoginScreen';
import DoorsScreen from './screens/DoorsScreen';
import InviteScreen from './screens/InviteScreen';
import Placeholder from './screens/Placeholder';

export default function Router() {
  const { state } = useStore();
  switch (state.screen) {
    case 'auth':
      return <AuthScreen />;
    case 'signup':
      return <SignupScreen />;
    case 'login':
      return <LoginScreen />;
    case 'doors':
      return <DoorsScreen />;
    case 'invite':
      return <InviteScreen />;
    default:
      return <Placeholder name={state.screen} />;
  }
}
