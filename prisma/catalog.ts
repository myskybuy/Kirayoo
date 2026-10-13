// Demo item catalog used by the seed. `photo` is the slug of local photos in
// public/demo/<photo>-1.jpg, -2.jpg (downloaded once from Wikimedia Commons by
// tools/fetch-demo-photos.mjs — see public/demo/CREDITS.md). Never hotlinked.
import type { Category } from '@prisma/client';

export type CatalogItem = {
  photo: string;
  query: string;
  title: string;
  category: Category;
  day: number;
  week?: number;
  deposit: number;
  desc: string;
  minDays?: number;
  maxDays?: number;
};

export const CATALOG: CatalogItem[] = [
  { photo: 'mirrorless', query: 'Sony Alpha mirrorless camera', title: 'Sony A7 III + 28–70mm kit', category: 'CAMERAS', day: 1200, week: 7000, deposit: 15000, desc: 'Full-frame mirrorless body with the 28–70mm kit lens, 2 batteries, charger, 64 GB card and padded bag.' },
  { photo: 'dslr', query: 'Canon EOS DSLR camera', title: 'Canon EOS 200D DSLR kit', category: 'CAMERAS', day: 600, week: 3500, deposit: 8000, desc: 'Beginner-friendly DSLR with 18–55mm lens, battery, charger, 32 GB card and strap.' },
  { photo: 'actioncam', query: 'GoPro action camera', title: 'GoPro Hero action camera', category: 'CAMERAS', day: 400, week: 2200, deposit: 5000, desc: 'Waterproof action camera with chest mount, helmet mount, selfie stick and 2 batteries.' },
  { photo: 'drone', query: 'DJI Mavic drone', title: 'DJI mini drone with 3 batteries', category: 'CAMERAS', day: 900, week: 5000, deposit: 15000, desc: 'Compact drone, remote, 3 batteries and charging hub. Fly only where it is allowed.', minDays: 2 },
  { photo: 'lens', query: 'telephoto zoom lens camera', title: 'Sony 70–200mm f/4 G lens', category: 'CAMERAS', day: 600, deposit: 10000, desc: 'Sharp telephoto zoom for weddings, sports and wildlife. Comes with hood and both caps.' },
  { photo: 'tripod', query: 'camera tripod', title: 'Carbon travel tripod', category: 'CAMERAS', day: 150, week: 800, deposit: 2000, desc: 'Light carbon tripod with ball head and quick-release plate. Folds to 40 cm.' },
  { photo: 'drill', query: 'cordless drill', title: 'Bosch 500W impact drill', category: 'TOOLS', day: 180, week: 900, deposit: 2000, desc: 'Impact drill with a set of masonry, wood and metal bits plus wall plugs. Carry case included.' },
  { photo: 'washer', query: 'pressure washer equipment', title: 'Electric pressure washer 1800W', category: 'TOOLS', day: 300, week: 1500, deposit: 3000, desc: 'Great for cars, bikes and balconies. 5 m hose, foam bottle and two nozzles.' },
  { photo: 'ladder', query: 'aluminium ladder', title: 'Aluminium folding ladder 8 ft', category: 'TOOLS', day: 150, week: 700, deposit: 1500, desc: 'Sturdy folding ladder, anti-slip feet, holds up to 150 kg.' },
  { photo: 'grinder', query: 'Winkelschleifer angle grinder Makita', title: 'Angle grinder 4 inch', category: 'TOOLS', day: 150, deposit: 1500, desc: 'Angle grinder with cutting and grinding discs, side handle and guard. Safety goggles included.' },
  { photo: 'mower', query: 'electric lawn mower', title: 'Electric lawn mower', category: 'TOOLS', day: 350, week: 1800, deposit: 4000, desc: 'Corded electric mower with grass box and 15 m extension cable.' },
  { photo: 'toolkit', query: 'hand tool set box', title: 'Home tool kit (108 pieces)', category: 'TOOLS', day: 120, week: 600, deposit: 1500, desc: 'Hammer, screwdrivers, spanners, pliers, sockets and measuring tape in one case.' },
  { photo: 'speaker', query: 'loudspeaker Bluetooth speaker', title: 'JBL party speaker with lights', category: 'PARTY', day: 800, week: 4500, deposit: 8000, desc: 'Loud Bluetooth party speaker with light show, mic input and wheels. Runs 12 h on battery.' },
  { photo: 'lights', query: 'string lights fairy lights', title: 'Fairy lights (20 strings)', category: 'PARTY', day: 400, deposit: 2000, desc: '20 warm-white LED strings, 10 m each, with extension boards and plugs.' },
  { photo: 'fountain', query: 'chocolate fountain', title: 'Chocolate fountain (3 tier)', category: 'PARTY', day: 600, deposit: 3000, desc: 'Three-tier chocolate fountain for birthdays and weddings. Cleaned before every rental.' },
  { photo: 'chairs', query: 'folding chairs event', title: 'Folding chairs (set of 10)', category: 'PARTY', day: 500, week: 2500, deposit: 3000, desc: 'Ten steel folding chairs with padded seats. Delivery recommended.' },
  { photo: 'karaoke', query: 'karaoke microphone', title: 'Karaoke wireless mic set', category: 'PARTY', day: 300, week: 1500, deposit: 2500, desc: 'Two wireless microphones with receiver. Works with any speaker or TV.' },
  { photo: 'tent', query: 'dome tent camping', title: '4-person dome tent', category: 'CAMPING', day: 300, week: 1500, deposit: 3000, desc: 'Waterproof dome tent for four with rain fly, pegs, ropes and carry bag.' },
  { photo: 'sleepingbag', query: 'sleeping bag', title: 'Sleeping bag (comfort 5°C)', category: 'CAMPING', day: 120, week: 600, deposit: 1500, desc: 'Warm mummy sleeping bag, washed after every use. Compression sack included.' },
  { photo: 'campchairs', query: 'camping chair', title: 'Camping chairs (set of 4) + table', category: 'CAMPING', day: 200, week: 1000, deposit: 2000, desc: '4 folding chairs with cup holders and a 90 cm aluminium table. All fit in two carry bags.' },
  { photo: 'backpack', query: 'backpack hiking gear', title: 'Trekking backpack 60 L', category: 'CAMPING', day: 150, week: 800, deposit: 2000, desc: 'Comfortable 60 L backpack with rain cover and hip belt pockets.' },
  { photo: 'stove', query: 'camping stove', title: 'Camping gas stove + cookset', category: 'CAMPING', day: 100, week: 500, deposit: 1000, desc: 'Portable gas stove with pot, pan and kettle. Gas canister not included.' },
  { photo: 'ps5', query: 'PlayStation 5 console', title: 'PlayStation 5 + 2 controllers', category: 'GAMING', day: 700, week: 4000, deposit: 15000, desc: 'PS5 disc edition, two DualSense controllers, HDMI cable and 3 games.' },
  { photo: 'switch', query: 'Nintendo Switch console', title: 'Nintendo Switch with games', category: 'GAMING', day: 450, week: 2500, deposit: 10000, desc: 'Switch console with dock, Joy-Cons and Mario Kart + party games.' },
  { photo: 'xbox', query: 'Xbox controller console', title: 'Xbox Series S + controller', category: 'GAMING', day: 500, week: 2800, deposit: 10000, desc: 'Compact Xbox with one controller and Game Pass games already installed.' },
  { photo: 'vr', query: 'virtual reality headset', title: 'VR headset (Quest 2)', category: 'GAMING', day: 600, week: 3500, deposit: 12000, desc: 'Standalone VR headset with both controllers and charging cable. Sanitised after use.' },
  { photo: 'wheel', query: 'racing wheel gaming steering', title: 'Racing wheel + pedals', category: 'GAMING', day: 350, deposit: 6000, desc: 'Force-feedback steering wheel with pedals. Works with PC and PlayStation.' },
  { photo: 'projector', query: 'video projector', title: 'Full HD home projector', category: 'PROJECTORS', day: 700, week: 4000, deposit: 10000, desc: '1080p projector, 3500 lumens, HDMI and USB. Perfect for movie nights and match screenings.' },
  { photo: 'screen', query: 'projection screen', title: 'Projector screen 100 inch', category: 'PROJECTORS', day: 200, week: 1000, deposit: 2000, desc: 'Foldable 100" screen with tripod stand. Sets up in 5 minutes.' },
  { photo: 'miniprojector', query: 'pico projector device', title: 'Mini portable projector', category: 'PROJECTORS', day: 350, week: 1800, deposit: 5000, desc: 'Pocket projector with built-in battery and speaker. Connects to phones.' },
  { photo: 'guitar', query: 'acoustic guitar', title: 'Yamaha acoustic guitar', category: 'MUSIC', day: 200, week: 1000, deposit: 4000, desc: 'Full-size acoustic guitar, freshly strung, with gig bag, capo and picks.' },
  { photo: 'piano', query: 'digital piano keyboard', title: 'Digital piano (88 keys)', category: 'MUSIC', day: 500, week: 2800, deposit: 10000, desc: 'Weighted-key digital piano with stand, sustain pedal and headphones.', minDays: 3 },
  { photo: 'cajon', query: 'cajon drum', title: 'Cajon box drum', category: 'MUSIC', day: 150, week: 700, deposit: 2000, desc: 'Wooden cajon with snare wires and a padded seat cover.' },
  { photo: 'dj', query: 'DJ controller', title: 'DJ controller (2 decks)', category: 'MUSIC', day: 700, week: 4000, deposit: 12000, desc: 'Two-deck DJ controller with headphones and laptop stand.' },
  { photo: 'eguitar', query: 'electric guitar amplifier', title: 'Electric guitar + practice amp', category: 'MUSIC', day: 450, week: 2500, deposit: 8000, desc: 'Electric guitar with 20 W amp, cable, strap and tuner.' },
  { photo: 'mtb', query: 'mountain bike bicycle', title: 'Mountain bike (21 gears)', category: 'SPORTS', day: 300, week: 1500, deposit: 6000, desc: '21-gear mountain bike with helmet and lock. Serviced every month.' },
  { photo: 'roadbike', query: 'road bicycle', title: 'Road bike (size M)', category: 'SPORTS', day: 500, week: 2800, deposit: 10000, desc: 'Light road bike for long weekend rides. Helmet, lights and pump included.' },
  { photo: 'badminton', query: 'badminton racket shuttlecock', title: 'Badminton set (4 rackets + net)', category: 'SPORTS', day: 80, week: 400, deposit: 800, desc: 'Four rackets, shuttles and a portable net with poles.' },
  { photo: 'kayak', query: 'inflatable kayak', title: 'Inflatable kayak (2 person)', category: 'SPORTS', day: 600, deposit: 8000, desc: 'Two-person inflatable kayak with paddles, pump and life jackets.', minDays: 1 },
  { photo: 'cricket', query: 'cricket bat ball', title: 'Cricket kit (bat, pads, gloves)', category: 'SPORTS', day: 200, week: 1000, deposit: 2500, desc: 'English willow bat, pads, gloves, helmet and stumps for a weekend match.' },
];
