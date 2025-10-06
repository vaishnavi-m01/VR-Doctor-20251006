import { PropsWithChildren, useState } from 'react';
import { Pressable } from 'react-native';
import { View, Text } from 'react-native';

type Props = PropsWithChildren<{ icon?: string; title?: string; desc?: string; error?: boolean; }>

const ICON_COL = 16;

export default function FormCard({ icon, title, desc, children, error }: Props) {
  const [checked, setChecked] = useState(false);
  return (
    <View
      className="bg-[#fff] border border-[#fff] rounded-2xl shadow-card mb-2 mt-2"
      style={{ paddingTop: 8, paddingBottom: 8, paddingRight: 8, paddingLeft: 0 }}
    >

      {icon ? (
        <View
          className="w-5 h-5 rounded-md bg-[#eaf7f2] items-center justify-center"
          style={{ position: 'absolute', left: 0, top: 12, zIndex: 2 }}
        >
          <Text className="text-ink font-extrabold text-xs">{icon}</Text>
        </View>
      ) : (
        <Pressable
          onPress={() => setChecked(!checked)}
          style={{
            position: 'absolute',
            left: 16,
            top: 20,
            // right:5,
            width: 28,
            height: 28,
            borderRadius: 8,
            borderWidth: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: checked ? '#22c55e' : '#ffffff',
            borderColor: checked ? '#16a34a' : '#e5e7eb',
            zIndex: 3,
          }}
        >
          {checked && <Text style={{ color: '#fff', fontWeight: 'bold' }}>✔︎</Text>}
        </Pressable>
      )}




      <View style={{ paddingLeft: 0 }}>
        <View className="mb-2 justify-center flex-1" style={{ paddingLeft: ICON_COL, paddingTop: 2 }}>
          <Text
            className={`text-base font-semibold ${error ? "text-red-500" : "text-[#0b1f1c]"}`}
          >
            {title}
          </Text>
          {!!desc && <Text className="text-xs text-muted mt-4 ml-[14px]">{desc}</Text>}
        </View>

        {/* Form content */}
        <View style={{ paddingLeft: ICON_COL }}>{children}</View>
      </View>
    </View>
  );
}
