export type MainTabParamList = {
  Home: undefined;
  Map: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  AlarmDetail: {
    alarmId: string;
  };
};