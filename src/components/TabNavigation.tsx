import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { ChevronRightIcon } from 'react-native-heroicons/outline';

export type TabItem = {
  id: string;
  title: string;
  route?: string;
  onPress?: () => void;
};

type TabNavigationProps = {
  tabs: TabItem[];
  activeTabId: string;
  onTabPress: (tabId: string) => void;
  className?: string;
};

export default function TabNavigation({ 
  tabs, 
  activeTabId, 
  onTabPress, 
  className = "" 
}: TabNavigationProps) {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      className={`${className}`}
      contentContainerStyle={{ paddingHorizontal: 16 }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onTabPress(tab.id)}
            className={`mr-3 px-4 py-2 rounded-full flex-row items-center ${
              isActive 
                ? 'bg-[#0e4336]' 
                : 'bg-[#F6F7F7]'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                isActive 
                  ? 'text-white' 
                  : 'text-[#0e4336]'
              }`}
            >
              {tab.title}
            </Text>
            {isActive && (
              <ChevronRightIcon 
                size={16} 
                color="white" 
                className="ml-2"
              />
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
