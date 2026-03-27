export type MainTabParamList = {
  Home: undefined;
  Map: undefined;
  History: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
  AlarmDetail: {
    alarmId: string;
  };
};