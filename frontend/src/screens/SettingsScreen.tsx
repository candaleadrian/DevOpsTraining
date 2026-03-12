import { ScreenLayout, InfoCard } from '../ui/ScreenLayout';

export function SettingsScreen() {
  return (
    <ScreenLayout
      eyebrow="Settings"
      title="Environment and Preferences"
      description="Settings become important early in mobile projects because they centralize API base URLs, notification preferences, and debug switches for development environments."
    >
      <InfoCard label="Environment" value="Development" />
      <InfoCard label="Planned controls" value="Notification radius, backend URL, and account preferences" />
    </ScreenLayout>
  );
}