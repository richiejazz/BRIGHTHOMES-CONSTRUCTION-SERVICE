import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'
import * as ImagePicker from 'expo-image-picker'
import { Platform } from 'react-native'

import type { UploadableImage } from '../api/account'

const UPLOAD_EDGE = 1024

export type PickResult = { status: 'picked'; image: UploadableImage } | { status: 'cancelled' } | { status: 'denied' }

/**
 * Let the user choose a photo, square-cropped where the platform supports it, and shrink it
 * before upload so large camera photos don't use mobile data unnecessarily. The server still
 * produces the final 512px image.
 */
export async function pickAvatar(): Promise<PickResult> {
  if (Platform.OS !== 'web') {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) return { status: 'denied' }
  }
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 1 })
  if (result.canceled || !result.assets[0]) return { status: 'cancelled' }
  const asset = result.assets[0]

  const context = ImageManipulator.manipulate(asset.uri)
  if (asset.width > UPLOAD_EDGE || asset.height > UPLOAD_EDGE) context.resize(asset.width >= asset.height ? { width: UPLOAD_EDGE } : { height: UPLOAD_EDGE })
  const rendered = await context.renderAsync()
  const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.85 })

  const image: UploadableImage = { uri: saved.uri, name: 'avatar.jpg', type: 'image/jpeg' }
  // In the web preview the result is a blob/data URL, which FormData needs as a Blob.
  if (Platform.OS === 'web') image.blob = await (await fetch(saved.uri)).blob()
  return { status: 'picked', image }
}
