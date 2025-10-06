import { View, Pressable, Text } from 'react-native';

export type Option = { label: string; value: string; };
type Props = {
  options: Option[];
  value?: string;
  onChange?: (v: string) => void;
  ariaLabel?: string;
}

export default function Segmented({ options, value, onChange }: Props){
  return (
    <View className="flex-row rounded-xl overflow-hidden border border-[#e0ece7] bg-white">
      {options.map((opt, i)=>{
        const active = value===opt.value;
        return (
          <Pressable key={opt.value}
            className={`flex-1 py-2 px-3 items-center border-r border-[#e0ece7] ${i===options.length-1?'border-r-0':''} ${active?'bg-[#4FC264]':''}`}
            onPress={()=>onChange && onChange(opt.value)}>
            <Text className={`font-medium text-base ${active?'text-white ':'text-[#4b5f5a]'}`}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
