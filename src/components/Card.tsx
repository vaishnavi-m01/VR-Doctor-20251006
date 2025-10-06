
import React, { ReactNode } from 'react';
import { View, ViewProps } from 'react-native';

export default function Card({ children, className, onPress, ...rest }: ViewProps & { children?: ReactNode; onPress?: () => void }) {
  // Extract background color from className if present, otherwise use default
  const hasCustomBg = className && className.includes('bg-');
  const defaultBg = hasCustomBg ? '' : 'bg-white';
  
  return (
    <View {...rest} className={`${defaultBg} ${className || ''} border border-[#e6eeeb] rounded-2xl shadow-card`}>
      {children}
    </View>
  );
}
 