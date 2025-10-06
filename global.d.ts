/// <reference types="nativewind/types" />

declare module 'react-native' {
  export const View: any;
  export const Text: any;
  export const ScrollView: any;
  export const Pressable: any;
  export const Alert: any;
  export const ActivityIndicator: any;
  export const TextInput: any;
  export const TouchableOpacity: any;
  export const Image: any;
  export const SafeAreaView: any;
  export const StyleSheet: any;
  export const Keyboard: any;
  export const TouchableWithoutFeedback: any;
  export const RefreshControl: any;
  export const Switch: any;
  export const KeyboardAvoidingView: any;
  export const Platform: any;

  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface ScrollViewProps {
    className?: string;
  }
  interface PressableProps {
    className?: string;
    disabled?: boolean;
  }
  interface TextInputProps {
    className?: string;
    placeholder?: string;
    value?: string;
    onChangeText?: (text: string) => void;
    keyboardType?: string;
    multiline?: boolean;
    numberOfLines?: number;
    editable?: boolean;
    maxLength?: number;
  }
  interface TouchableOpacityProps {
    className?: string;
  }
  interface ImageProps {
    className?: string;
  }
  interface SafeAreaViewProps {
    className?: string;
  }
}