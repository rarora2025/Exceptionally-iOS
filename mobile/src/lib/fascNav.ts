import type { Screen, AppState } from '../state/store';

// Where tapping a fascination bucket should land. Once a bucket has been done,
// it jumps straight to the result (topics for Industries, loves/dislikes for
// the others) and skips the intro. The intro / start-over page is only reached
// via "Redo the interview".
export function bucketEntry(
  state: Pick<AppState, 'fascTopics' | 'fascPulls'>,
  key: string,
): Screen {
  if (key === 'domains') return state.fascTopics[key]?.length ? 'fascTopics' : 'fascBucket';
  return state.fascPulls[key]?.pulls?.length ? 'fascPullsResult' : 'fascBucket';
}
