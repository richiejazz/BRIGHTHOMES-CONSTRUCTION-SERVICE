import { Search, X } from 'lucide-react-native'
import { Pressable, StyleSheet, TextInput, View } from 'react-native'

import { fonts, layout, makeStyles, space, useTheme } from '../../theme'

/** Filled search field with a clear button. */
export function SearchField({ value, onChangeText, placeholder, autoFocus = false }: { value: string; onChangeText: (value: string) => void; placeholder: string; autoFocus?: boolean }) {
  const styles = useStyles()
  const { colors } = useTheme()
  return (
    <View style={styles.wrap}>
      <Search size={18} color={colors.textMuted} strokeWidth={1.5} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSubtle}
        accessibilityLabel={placeholder}
        returnKeyType="search"
        autoFocus={autoFocus}
        autoCorrect={false}
        selectionColor={colors.accent}
        cursorColor={colors.accent}
        style={styles.input}
      />
      {value ? (
        <Pressable onPress={() => onChangeText('')} accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={8} style={styles.clear}>
          <X size={18} color={colors.textMuted} strokeWidth={1.5} />
        </Pressable>
      ) : null}
    </View>
  )
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    wrap: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginHorizontal: layout.gutter, minHeight: 48, paddingHorizontal: space.lg, backgroundColor: c.surface },
    input: { flex: 1, minHeight: 46, fontFamily: fonts.regular, fontSize: 16, color: c.text },
    clear: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: -10 },
  }),
)
