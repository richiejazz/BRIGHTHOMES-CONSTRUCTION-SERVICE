import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View } from 'react-native'

export default function HomeScreen() {
  return <View style={styles.container}><Text style={styles.eyebrow}>FOUNDATION</Text><Text style={styles.title}>BRIGHTHOMES</Text><Text style={styles.tagline}>Building Dreams, Constructing Reality.</Text><Text style={styles.caption}>The mobile experience is being established independently from the website.</Text><StatusBar style="dark" /></View>
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 32, backgroundColor: '#F6F3EE' },
  eyebrow: { color: '#786D62', fontSize: 12, fontWeight: '700', letterSpacing: 3, marginBottom: 20 },
  title: { color: '#242321', fontSize: 36, fontWeight: '800', letterSpacing: -1 },
  tagline: { color: '#524D47', fontSize: 18, marginTop: 16 },
  caption: { color: '#786D62', fontSize: 14, lineHeight: 21, marginTop: 48 },
})
