import { ScreenLayout, InfoCard } from '../ui/ScreenLayout';

export function MapScreen() {
  return (
    <ScreenLayout
      eyebrow="Map"
      title="Geospatial Workspace"
      description="This screen will eventually host the interactive map and the user's saved alarm points. Right now it is a placeholder with the correct architectural role."
    >
      <InfoCard label="Planned feature" value="Map view with saved proximity alarm locations" />
      <InfoCard label="Future dependency" value="react-native-maps plus location permissions and geofencing logic" />
    </ScreenLayout>
  );
}