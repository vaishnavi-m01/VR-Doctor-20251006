import React from 'react';
import { View, Pressable, Text, ScrollView } from 'react-native';

type Tab = { key: string; label: string };

export default function TabPills({
  tabs,
  active,
  onChange,
}: {
  tabs: Tab[];
  active: string;
  onChange: (k: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-3 px-1"
    >
      <View className="flex-row gap-2">
        {tabs.map((t) => {
          const isActive = active === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => onChange(t.key)}
              className={`px-4 py-2 rounded-full ${isActive
                  ? 'bg-brand-dark-green border border-brand-dark-green'
                  : 'bg-brand-light-green'
                }`}
              accessible={true}
              accessibilityLabel={`${t.label} tab`}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Text
                className={`text-sm font-zen ${isActive
                    ? 'text-white font-zen-bold'
                    : 'text-brand-text-green font-zen-medium'
                  }`}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}



// import React from 'react';
// import { ScrollView, Pressable, Text, View } from 'react-native';

// type Tab = { key: string; label: string };

// export default function TabPills({
//   tabs,
//   active,
//   onChange,
// }: {
//   tabs: Tab[];
//   active: string;
//   onChange: (key: string) => void;
// }) {
//   return (
//     <ScrollView
//       horizontal
//       showsHorizontalScrollIndicator={false}
//       contentContainerStyle={{ paddingHorizontal: 4 }}
//       className="mb-3"
//     >
//       <View className="flex-row border border-gray-300 rounded-xl overflow-hidden">
//         {tabs.map((t, index) => {
//           const isActive = active === t.key;
//           return (
//             <Pressable
//               key={t.key}
//               onPress={() => onChange(t.key)}
//               className={`
//                 w-[140px] px-4 py-2
//                 ${index !== 0 ? 'border-l border-gray-300' : ''}
//                 ${isActive ? 'bg-black' : 'bg-white'}
//               `}
//             >
//               <Text
//                 className={`
//                   text-center
//                   ${isActive ? 'text-white font-extrabold' : 'text-gray-700 font-bold'}
//                 `}
//               >
//                 {t.label}
//               </Text>
//             </Pressable>
//           );
//         })}
//       </View>
//     </ScrollView>
//   );
// }
