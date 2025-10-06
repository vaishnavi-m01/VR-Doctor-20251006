import React, { useState } from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import TabbedContent, { TabItem, ContentItem } from '../../components/TabbedContent';

export default function TabbedContentDemo() {
  const [activeTabId, setActiveTabId] = useState('assessment');

  const tabs: TabItem[] = [
    { id: 'info-section', title: 'Info Section' },
    { id: 'assessment', title: 'Assessment' },
    { id: 'therapy', title: 'Therapy' },
    { id: 'orientation', title: 'Orientation' },
    { id: 'urgent', title: 'Urgent' },
  ];

  const contentItems: ContentItem[] = [
    {
      id: 'distress-thermometer',
      title: 'Distress Thermometer',
      subtitle: 'Distress thermometer',
      iconColor: '#F59E0B', // Yellow
      onPress: () => console.log('Distress Thermometer pressed'),
    },
    {
      id: 'habits-beliefs',
      title: 'Habits & Personal Beliefs',
      subtitle: 'Spiritual / Belief',
      iconColor: '#F97316', // Orange
      onPress: () => console.log('Habits & Personal Beliefs pressed'),
    },
    {
      id: 'edmonton-factg',
      title: 'Edmonton & FACT G27',
      subtitle: 'Edmonton & Fact-G',
      iconColor: '#3B82F6', // Blue
      onPress: () => console.log('Edmonton & FACT G27 pressed'),
    },
  ];

  const handleTabPress = (tabId: string) => {
    setActiveTabId(tabId);
    console.log('Tab pressed:', tabId);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="flex-1">
        <View className="bg-white px-4 py-6 border-b border-gray-200">
          <Text className="text-2xl font-bold text-[#0e4336]">Tabbed Content Demo</Text>
          <Text className="text-gray-600 mt-2">Horizontal tabs with content items</Text>
        </View>
        
        <TabbedContent
          tabs={tabs}
          activeTabId={activeTabId}
          onTabPress={handleTabPress}
          contentItems={contentItems}
          className="mt-4"
        />
      </View>
    </SafeAreaView>
  );
}
