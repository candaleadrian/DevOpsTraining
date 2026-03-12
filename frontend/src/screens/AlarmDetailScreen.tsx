import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/types';
import { InfoCard, ScreenLayout } from '../ui/ScreenLayout';

type AlarmDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'AlarmDetail'>;

export function AlarmDetailScreen({ route }: AlarmDetailScreenProps) {
  return (
    <ScreenLayout
      eyebrow="Alarm Detail"
      title="Alarm Configuration"
      description="A dedicated detail screen matters because alarm creation and editing grow quickly in complexity. Keeping it isolated protects the rest of the app from becoming tightly coupled."
    >
      <InfoCard label="Alarm ID" value={route.params.alarmId} />
      <InfoCard label="Planned fields" value="Name, coordinates, trigger radius, and notification state" />
    </ScreenLayout>
  );
}