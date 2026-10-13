import type { ImageSourcePropType } from 'react-native'

// Editorial imagery bundled with the app (hero, section openers, auth and about screens).
//
// TEMPORARY: these are illustrative architectural photographs from Unsplash, used under the
// Unsplash License (https://unsplash.com/license) until BRIGHTHOMES supplies its own
// photography. They set the mood only and are never captioned or presented as BRIGHTHOMES work.
// To replace one, drop a new file into assets/editorial/ and update its entry here; no screen
// needs to change. Listing and project photos come from the API, not from this file.

export type EditorialImage = {
  source: ImageSourcePropType
  alt: string
  credit: { photographer: string; url: string }
}

export const editorial = {
  hero: {
    source: require('../../assets/editorial/hero-dusk-residence.jpg'),
    alt: 'A contemporary two-storey residence with warm interior lighting at dusk',
    credit: { photographer: 'Arthur BAUDRY', url: 'https://unsplash.com/photos/4vioYQ9Nn9Y' },
  },
  construction: {
    source: require('../../assets/editorial/construction-frame.jpg'),
    alt: 'A concrete building frame under construction against a blue sky',
    credit: { photographer: 'Tolu Olubode', url: 'https://unsplash.com/photos/PlBsJ5MybGc' },
  },
  realEstate: {
    source: require('../../assets/editorial/residence-pool.jpg'),
    alt: 'A white contemporary house beside a swimming pool',
    credit: { photographer: 'Ярослав Алексеенко', url: 'https://unsplash.com/photos/_TPTXZd9mOo' },
  },
  drafting: {
    source: require('../../assets/editorial/architect-drafting.jpg'),
    alt: 'An architect drawing on a plan with a pencil and ruler',
    credit: { photographer: 'Daniel McCullough', url: 'https://unsplash.com/photos/HtBlQdxfG9k' },
  },
  cranes: {
    source: require('../../assets/editorial/cranes-sunset.jpg'),
    alt: 'Tower cranes over a building site at sunset',
    credit: { photographer: 'Samuel Regan-Asante', url: 'https://unsplash.com/photos/g9A2llpDObU' },
  },
  facade: {
    source: require('../../assets/editorial/facade-monochrome.jpg'),
    alt: 'A black and white contemporary building facade seen from below',
    credit: { photographer: 'Luke van Zyl', url: 'https://unsplash.com/photos/koH7IVuwRLw' },
  },
  blueprints: {
    source: require('../../assets/editorial/blueprints.jpg'),
    alt: 'Architectural drawings with drafting pencils and a metal ruler',
    credit: { photographer: 'Lucas Kepner', url: 'https://unsplash.com/photos/Yn8D5B8C-eY' },
  },
} satisfies Record<string, EditorialImage>
