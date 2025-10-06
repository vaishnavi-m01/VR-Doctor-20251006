import React, { PropsWithChildren } from 'react';
import { ScrollView, ScrollViewProps } from 'react-native';

type Props = PropsWithChildren<{
  className?: string;
  contentContainerStyle?: any;
}> & Omit<ScrollViewProps, 'className'>;

export default function ScrollViewWithBottomBar({ 
  children, 
  className = "", 
  contentContainerStyle,
  ...props 
}: Props) {
  return (
    <ScrollView 
      className={`${className} pb-[400px]`}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={false}
      {...props}
    >
      {children}
    </ScrollView>
  );
}
