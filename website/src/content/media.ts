// Editorial imagery for page compositions (hero, section openers, auth, about).
//
// TEMPORARY: these are illustrative architectural photographs from Unsplash, used under the
// Unsplash License (https://unsplash.com/license) until BRIGHTHOMES supplies its own photography.
// They set the mood only, always carry the "Illustrative image" label, and are never captioned
// or presented as BRIGHTHOMES work. To replace one, drop a new file into src/assets/editorial/
// and update its entry here; no page needs to change. Project and listing photos come from the API.

import architectDrafting from '../assets/editorial/architect-drafting.jpg'
import blueprints from '../assets/editorial/blueprints.jpg'
import constructionFrame from '../assets/editorial/construction-frame.jpg'
import cranesSunset from '../assets/editorial/cranes-sunset.jpg'
import facadeMonochrome from '../assets/editorial/facade-monochrome.jpg'
import heroDuskResidence from '../assets/editorial/hero-dusk-residence.jpg'
import residencePool from '../assets/editorial/residence-pool.jpg'

export type EditorialImage = {
  src: string
  alt: string
  /** Always true for the current set; flip to false for real BRIGHTHOMES photography. */
  illustrative: boolean
  credit: { photographer: string; url: string }
}

export const editorial = {
  hero: {
    src: heroDuskResidence,
    alt: 'A contemporary two-storey residence with warm interior lighting at dusk',
    illustrative: true,
    credit: { photographer: 'Arthur BAUDRY', url: 'https://unsplash.com/photos/4vioYQ9Nn9Y' },
  },
  construction: {
    src: constructionFrame,
    alt: 'A concrete building frame under construction against a blue sky',
    illustrative: true,
    credit: { photographer: 'Tolu Olubode', url: 'https://unsplash.com/photos/PlBsJ5MybGc' },
  },
  realEstate: {
    src: residencePool,
    alt: 'A white contemporary house beside a swimming pool',
    illustrative: true,
    credit: { photographer: 'Ярослав Алексеенко', url: 'https://unsplash.com/photos/_TPTXZd9mOo' },
  },
  drafting: {
    src: architectDrafting,
    alt: 'An architect drawing on a plan with a pencil and ruler',
    illustrative: true,
    credit: { photographer: 'Daniel McCullough', url: 'https://unsplash.com/photos/HtBlQdxfG9k' },
  },
  cranes: {
    src: cranesSunset,
    alt: 'Tower cranes over a building site at sunset',
    illustrative: true,
    credit: { photographer: 'Samuel Regan-Asante', url: 'https://unsplash.com/photos/g9A2llpDObU' },
  },
  facade: {
    src: facadeMonochrome,
    alt: 'A black and white contemporary building facade seen from below',
    illustrative: true,
    credit: { photographer: 'Luke van Zyl', url: 'https://unsplash.com/photos/koH7IVuwRLw' },
  },
  blueprints: {
    src: blueprints,
    alt: 'Architectural drawings with drafting pencils and a metal ruler',
    illustrative: true,
    credit: { photographer: 'Lucas Kepner', url: 'https://unsplash.com/photos/Yn8D5B8C-eY' },
  },
} satisfies Record<string, EditorialImage>

export type EditorialKey = keyof typeof editorial

/**
 * Mood image for each service row and service detail page, by service slug. Services without an
 * entry fall back to the drawing image. Purely presentational; nothing here is a claim of work.
 */
const serviceImageBySlug: Record<string, EditorialKey> = {
  'architectural-drawing': 'drafting',
  'structural-drawing': 'blueprints',
  'site-supervision': 'construction',
  'construction-management': 'cranes',
  'real-estate': 'realEstate',
  renovation: 'facade',
  'survey-plan': 'blueprints',
  'building-approval': 'drafting',
}

export function serviceImage(slug: string): EditorialImage {
  return editorial[serviceImageBySlug[slug] ?? 'drafting']
}
