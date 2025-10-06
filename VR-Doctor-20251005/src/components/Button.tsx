import React from 'react';
import { Pressable, Text, PressableProps } from 'react-native';

type ButtonProps = {
  children?: React.ReactNode;
  label?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'light';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  onPress?: () => void;
} & PressableProps;

export default function Button({ 
  children, 
  label, 
  variant = 'primary', 
  size = 'medium',
  className, 
  onPress,
  ...props 
}: ButtonProps) {
  const base = "rounded-xl items-center justify-center";
  
  const sizeClasses = {
    small: "px-3 py-2",
    medium: "px-4 py-3", 
    large: "px-6 py-4"
  };
  
  const variantClasses = {
    primary: "bg-[#0EA06C] shadow-custom",
    secondary: "bg-[#E5F4F0] border border-[#0EA06C]",
    outline: "bg-transparent border border-[#0EA06C]",
    light: "bg-[#E5F4F0] border border-[#0EA06C]"
  };
  
  const textColor = variant === 'outline' ? "text-[#0EA06C]" : 
                   variant === 'secondary' || variant === 'light' ? "text-[#0EA06C]" : 
                   "text-white";

  const content = label || children;

  return (
    <Pressable 
      className={`${base} ${sizeClasses[size]} ${variantClasses[variant]} ${className || ''}`} 
      onPress={onPress}
      {...props}
      accessible={true}
      accessibilityRole="button"
    >
      <Text className={`font-zen-medium ${textColor}`}>{content}</Text>
    </Pressable>
  );
}

// Keep the old Btn component for backward compatibility
export function Btn({ children, variant = 'primary', className, ...props }: ButtonProps) {
  const base = "px-4 py-3 rounded-xl items-center justify-center";
  
  const cls = variant === 'primary' 
    ? `${base} bg-brand-dark-green shadow-custom`  
    : `${base} bg-brand-light-green border border-brand-border-green`;
  
  const textColor = variant === 'primary' ? "text-white" : "text-brand-text-green";

  return (
    <Pressable 
      className={`${cls} ${className || ''}`} 
      {...props}
      accessible={true}
      accessibilityRole="button"
    >
      <Text className={`font-zen-medium ${textColor}`}>{children}</Text>
    </Pressable>
  );
}
