import React from 'react'
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native'
import { Colors, Spacing, Radius, FontSize } from '@/utils/theme'

interface Props extends TextInputProps {
  label?: string
  hint?: string
}

export default function FormInput({ label, hint, style, ...props }: Props) {
  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        placeholderTextColor={Colors.text.muted}
        style={[styles.input, style]}
        {...props}
      />
      {hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { gap: 5 },
  label: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  input: {
    backgroundColor: Colors.bg.elevated,
    borderWidth: 0.5,
    borderColor: Colors.bg.border,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 13,
    color: Colors.text.primary,
    fontSize: FontSize.base,
  },
  hint: { fontSize: FontSize.xs, color: Colors.text.muted },
})
