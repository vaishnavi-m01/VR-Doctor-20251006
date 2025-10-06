import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/types';
import { Feather } from '@expo/vector-icons';

type BottomDockProps = {
  activeScreen: keyof RootStackParamList;
};

export default function BottomDock({ activeScreen }: BottomDockProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  type DockItemProps = {
    label: string;
    active: boolean;
    screenName: keyof RootStackParamList;
    iconName: string;
  };

  const Item = React.forwardRef<Pressable, DockItemProps>(({ label, active, screenName, iconName }, ref) => (
    <Pressable
      ref={ref}
      className="flex-1 items-center justify-center py-2 relative"
      onPress={() => navigation.navigate(screenName as any)}
      accessible={true}
      accessibilityLabel={`${label} tab`}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
    >
      <View className="flex-row items-center gap-1.5">
        <Feather
          name={iconName as any}
          size={22}
          color={active ? '#fff' : 'rgba(255,255,255,0.75)'}
        />
        <Text
          style={{
            color: active ? '#fff' : 'rgba(255,255,255,0.75)',
            fontWeight: '700',
            letterSpacing: 1,
            fontSize: 14,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </Text>
      </View>
      {active && (
        <View 
          className="absolute -bottom-0.5 self-center w-16 h-1.5 rounded-sm bg-brand-accent-green"
        />
      )}
    </Pressable>
  ));

  Item.displayName = 'DockItem';

  return (
    <View className="absolute bottom-4 w-full items-center z-50">
      <View className="w-[94%] max-w-[600px] bg-brand-dark-green rounded-3xl flex-row items-center justify-center py-2 px-2 shadow-lg relative">
        {/* Profile Floating Button */}
        <View className="absolute -left-8 top-1/2 -mt-7 z-10">
          <View className="w-14 h-14 rounded-full bg-white items-center justify-center">
            <Pressable
              className="w-12 h-12 rounded-full bg-brand-accent-green items-center justify-center border-2 border-white"
              onPress={() => navigation.navigate('Profile')}
              accessible={true}
              accessibilityLabel="Profile and settings"
              accessibilityRole="button"
            >
              <Feather name="user" size={26} color="#fff" />
            </Pressable>
          </View>
        </View>

        {/* Tab Items */}
        <Item label="HOME" screenName="Home" active={activeScreen === 'Home'} iconName="home" />
        <Item label="PARTICIPANTS" screenName="Participants" active={activeScreen === 'Participants'} iconName="user" />
        <Item label="REPORTS" screenName="Reports" active={activeScreen === 'Reports'} iconName="file-text" />

        {/* Floating Plus Button */}
        <View className="absolute -right-8 top-1/2 -mt-7 z-10">
          <View className="w-14 h-14 rounded-full bg-white items-center justify-center">
            <Pressable
              className="w-12 h-12 rounded-full bg-brand-accent-green items-center justify-center border-2 border-white"
              onPress={() =>
              navigation.navigate('SocioDemographic', {
                // patientId: Date.now(),
                // age: age
               })
              }
              accessible={true}
              accessibilityLabel="Add new participant"
              accessibilityRole="button"
            >
              <Feather name="plus" size={28} color="#fff" />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}