import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ChevronRightIcon } from 'react-native-heroicons/outline';
import TabNavigation from './TabNavigation';

export type TabItem = {
  id: string;
  title: string;
  route?: string;
  onPress?: () => void;
};

export type ContentItem = {
  id: string;
  title: string;
  subtitle: string;
  iconColor: string;
  onPress?: () => void;
};

type TabbedContentProps = {
  tabs: TabItem[];
  activeTabId: string;
  onTabPress: (tabId: string) => void;
  contentItems: ContentItem[];
  className?: string;
};

export default function TabbedContent({
  tabs,
  activeTabId,
  onTabPress,
  contentItems,
  className = ""
}: TabbedContentProps) {
  return (
    <View className={`bg-white ${className}`}>
      {/* Tab Navigation */}
      <View className="py-4">
        <TabNavigation
          tabs={tabs}
          activeTabId={activeTabId}
          onTabPress={onTabPress}
        />
      </View>
      
      {/* Content Items */}
      <View className="px-4">
        {contentItems.map((item) => (
          <Pressable
            key={item.id}
            onPress={item.onPress}
            className="flex-row items-center justify-between p-4 rounded-xl mb-3 bg-[#F6F7F7]"
          >
            {/* Left: Icon */}
            <View 
              className="w-10 h-10 rounded-lg mr-4 items-center justify-center"
              style={{ backgroundColor: item.iconColor }}
            >
              <Text className="text-white text-lg">📄</Text>
            </View>
            
            {/* Middle: Title and Subtitle */}
            <View className="flex-1">
              <Text className="text-base font-semibold text-[#0e4336] mb-1">
                {item.title}
              </Text>
              <Text className="text-sm text-gray-600">
                {item.subtitle}
              </Text>
            </View>
            
            {/* Right: Chevron */}
            <ChevronRightIcon size={20} color="#6b7280" />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
