// app/types.ts
export interface Article {
  id: string;
  title: string;
  content: string;
  // Add other article properties as needed
}

export type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  SignUp: undefined;
  PrivacyPolicy: undefined;
  TermsofService: undefined;
  Settings: undefined;
  HelpCenter: undefined;
  PersonalInfo: undefined;
  ChangePass: undefined;
  EditProfile: undefined;
  SymptomCheckScreen: undefined;
  Rules: {
    destination: 'camera' | 'gallery';
  };
  Result: {
    imageUri: string;
    result: {
      result: string;
      confidence: number;
    };
    ArticleDetails?: { article: Article };
  };
  Profile: undefined;
  Preferences: undefined;
  Main: {
    screen?: string;
    params?: { action?: string };
  };
  Upload: {
    capturedImage?: string;
  };
  Education: undefined;
  Notification: undefined;
  History: undefined;
  Symptoms: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Upload: undefined;
  Education: undefined;
  Settings: undefined;
};
