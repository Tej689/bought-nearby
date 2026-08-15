import {
  ME,
  rankingKey,
  type Category,
  type DB,
  type Item,
  type Sentiment,
  type Store,
  type User,
} from '../types'

/**
 * Real NYC stores, real neighborhoods, real coordinates. Judges on a city
 * track notice immediately whether you actually know the city, and a map of
 * invented store names reads as a mockup no matter how good the code is.
 */
export const STORES: Store[] = [
  // Kitchen & food
  { id: 'whisk', name: 'Whisk', neighborhood: 'Williamsburg', lat: 40.7175, lng: -73.9573, isLocal: true },
  { id: 'kalustyans', name: "Kalustyan's", neighborhood: 'Murray Hill', lat: 40.744, lng: -73.982, isLocal: true },
  { id: 'sahadis', name: "Sahadi's", neighborhood: 'Brooklyn Heights', lat: 40.6906, lng: -73.9954, isLocal: true },
  { id: 'fishs-eddy', name: 'Fishs Eddy', neighborhood: 'Flatiron', lat: 40.7383, lng: -73.9895, isLocal: true },
  { id: 'the-meadow', name: 'The Meadow', neighborhood: 'West Village', lat: 40.7355, lng: -74.006, isLocal: true },
  { id: 'ninth-street', name: 'Ninth Street Espresso', neighborhood: 'East Village', lat: 40.7265, lng: -73.979, isLocal: true },

  // Tech
  { id: 'bh-photo', name: 'B&H Photo', neighborhood: 'Midtown West', lat: 40.7538, lng: -73.9962, isLocal: true },
  { id: 'adorama', name: 'Adorama', neighborhood: 'Flatiron', lat: 40.74, lng: -73.993, isLocal: true },
  { id: 'rudys-music', name: "Rudy's Music", neighborhood: 'SoHo', lat: 40.7215, lng: -74.003, isLocal: true },

  // Clothing
  { id: 'beacons', name: "Beacon's Closet", neighborhood: 'Greenpoint', lat: 40.7285, lng: -73.954, isLocal: true },
  { id: 'awoke', name: 'Awoke Vintage', neighborhood: 'Williamsburg', lat: 40.7162, lng: -73.9601, isLocal: true },
  { id: 'brooklyn-denim', name: 'Brooklyn Denim Co.', neighborhood: 'Williamsburg', lat: 40.7135, lng: -73.964, isLocal: true },
  { id: 'cure-thrift', name: 'Cure Thrift Shop', neighborhood: 'East Village', lat: 40.731, lng: -73.9866, isLocal: true },

  // Fitness
  { id: 'paragon', name: 'Paragon Sports', neighborhood: 'Union Square', lat: 40.736, lng: -73.992, isLocal: true },
  { id: 'westerly', name: 'Westerly Natural Market', neighborhood: "Hell's Kitchen", lat: 40.766, lng: -73.986, isLocal: true },

  // Home
  { id: 'coming-soon', name: 'Coming Soon', neighborhood: 'Lower East Side', lat: 40.7145, lng: -73.991, isLocal: true },
  { id: 'abc-carpet', name: 'ABC Carpet & Home', neighborhood: 'Flatiron', lat: 40.7375, lng: -73.9895, isLocal: true },
  { id: 'mcnally', name: 'McNally Jackson', neighborhood: 'Nolita', lat: 40.7237, lng: -73.9962, isLocal: true },

  // Beauty
  { id: 'co-bigelow', name: 'C.O. Bigelow', neighborhood: 'West Village', lat: 40.7345, lng: -73.999, isLocal: true },
  { id: 'aedes', name: 'Aedes Perfumery', neighborhood: 'West Village', lat: 40.7355, lng: -74.0, isLocal: true },

  // Chains — logged like anything else, but never ranked on the map.
  { id: 'target-atlantic', name: 'Target', neighborhood: 'Atlantic Terminal', lat: 40.684, lng: -73.977, isLocal: false },
  { id: 'bestbuy-union', name: 'Best Buy', neighborhood: 'Union Square', lat: 40.735, lng: -73.991, isLocal: false },
  { id: 'sephora-soho', name: 'Sephora', neighborhood: 'SoHo', lat: 40.724, lng: -74.001, isLocal: false },
  { id: 'uniqlo-5th', name: 'Uniqlo', neighborhood: 'Midtown', lat: 40.754, lng: -73.984, isLocal: false },
]

export const USERS: User[] = [
  { id: ME, name: 'You', avatar: '🧃' },
  { id: 'sarah', name: 'Sarah Kim', avatar: '🌊' },
  { id: 'marcus', name: 'Marcus Bell', avatar: '🔥' },
  { id: 'priya', name: 'Priya Raman', avatar: '🪷' },
  { id: 'dev', name: 'Dev Osei', avatar: '🎸' },
]

/** [name, storeId, price, category, sentiment] — listed best-first per bucket. */
type SeedRow = [string, string, number, Category, Sentiment]

const SEED_ITEMS: Record<string, SeedRow[]> = {
  me: [
    ['Lodge cast iron skillet', 'whisk', 62, 'kitchen', 'worth_it'],
    ['Misono chef’s knife', 'whisk', 95, 'kitchen', 'worth_it'],
    ['Fellow pour-over kettle', 'ninth-street', 68, 'kitchen', 'worth_it'],
    ['Za’atar blend', 'kalustyans', 12, 'kitchen', 'worth_it'],
    ['Olive oil tin', 'sahadis', 24, 'kitchen', 'worth_it'],
    ['Microplane grater', 'whisk', 18, 'kitchen', 'worth_it'],
    ['Wooden spoon set', 'fishs-eddy', 22, 'kitchen', 'worth_it'],
    ['Silicone spatula set', 'fishs-eddy', 14, 'kitchen', 'fine'],
    ['Avocado slicer', 'target-atlantic', 8, 'kitchen', 'regret'],

    ['AirPods Pro', 'bestbuy-union', 249, 'tech', 'worth_it'],
    ['Anker power bank', 'bh-photo', 55, 'tech', 'worth_it'],
    ['SD card reader', 'adorama', 32, 'tech', 'worth_it'],
    ['USB-C hub', 'bh-photo', 40, 'tech', 'fine'],
    ['Bluetooth tracker 4-pack', 'target-atlantic', 70, 'tech', 'regret'],

    ['Wool overcoat', 'beacons', 85, 'clothing', 'worth_it'],
    ['Levi’s 501', 'awoke', 45, 'clothing', 'worth_it'],
    ['Oxford shirt', 'uniqlo-5th', 40, 'clothing', 'fine'],
    ['Canvas sneakers', 'uniqlo-5th', 50, 'clothing', 'regret'],

    ['Adjustable dumbbells', 'paragon', 180, 'fitness', 'worth_it'],
    ['Yoga mat', 'paragon', 45, 'fitness', 'fine'],

    ['Ceramic table lamp', 'coming-soon', 140, 'home', 'worth_it'],
    ['Linen throw', 'abc-carpet', 60, 'home', 'fine'],

    ['Face sunscreen', 'co-bigelow', 38, 'beauty', 'worth_it'],
  ],
  sarah: [
    ['Sony WH-1000XM5', 'bh-photo', 350, 'tech', 'worth_it'],
    ['Camera strap', 'adorama', 45, 'tech', 'worth_it'],
    ['Phone case', 'target-atlantic', 15, 'tech', 'regret'],
    ['Rose face oil', 'aedes', 62, 'beauty', 'worth_it'],
    ['Apothecary hand cream', 'co-bigelow', 24, 'beauty', 'worth_it'],
    ['Vintage denim jacket', 'beacons', 60, 'clothing', 'worth_it'],
    ['Espresso tamper', 'ninth-street', 30, 'kitchen', 'worth_it'],
  ],
  marcus: [
    ['Le Creuset dutch oven', 'whisk', 210, 'kitchen', 'worth_it'],
    ['Pomegranate molasses', 'kalustyans', 9, 'kitchen', 'worth_it'],
    ['Olive wood board', 'sahadis', 38, 'kitchen', 'fine'],
    ['Kettlebell 24kg', 'paragon', 120, 'fitness', 'worth_it'],
    ['Running shoes', 'paragon', 145, 'fitness', 'worth_it'],
    ['Protein shaker', 'target-atlantic', 12, 'fitness', 'fine'],
    ['Beard oil', 'westerly', 22, 'beauty', 'fine'],
  ],
  priya: [
    ['Ceramic vase', 'coming-soon', 95, 'home', 'worth_it'],
    ['Linen duvet', 'abc-carpet', 220, 'home', 'worth_it'],
    ['Art book', 'mcnally', 45, 'home', 'fine'],
    ['Selvedge jeans', 'brooklyn-denim', 165, 'clothing', 'worth_it'],
    ['Thrifted blazer', 'cure-thrift', 35, 'clothing', 'fine'],
    ['Flaky sea salt', 'the-meadow', 16, 'kitchen', 'worth_it'],
    ['Perfume oil', 'aedes', 88, 'beauty', 'worth_it'],
  ],
  dev: [
    ['Boss delay pedal', 'rudys-music', 180, 'tech', 'worth_it'],
    ['Cheap earbuds', 'bestbuy-union', 30, 'tech', 'fine'],
    ['Raw denim', 'brooklyn-denim', 190, 'clothing', 'worth_it'],
    ['Vintage band tee', 'cure-thrift', 22, 'clothing', 'worth_it'],
    ['Trail runners', 'paragon', 135, 'fitness', 'worth_it'],
    ['Single origin chocolate', 'the-meadow', 28, 'kitchen', 'worth_it'],
  ],
}

/** Fixed base date keeps seeded timestamps stable across reloads. */
const BASE = Date.parse('2026-08-01T12:00:00Z')
const HOUR = 3600_000

export function buildSeedDB(): DB {
  const items: Record<string, Item> = {}
  const rankings: Record<string, string[]> = {}
  let n = 0

  for (const [ownerId, rows] of Object.entries(SEED_ITEMS)) {
    rows.forEach(([name, storeId, price, category, sentiment]) => {
      const id = `${ownerId}-${n}`
      items[id] = {
        id,
        name,
        photo: null,
        storeId,
        price,
        category,
        sentiment,
        ownerId,
        // Spread purchases backwards through the last couple of weeks so the
        // feed has a believable chronology rather than 50 identical stamps.
        createdAt: BASE - n * 7 * HOUR,
      }
      const key = rankingKey(ownerId, category, sentiment)
      ;(rankings[key] ??= []).push(id)
      n++
    })
  }

  return { users: USERS, stores: STORES, items, rankings }
}
