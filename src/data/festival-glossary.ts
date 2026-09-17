/**
 * The temple's panchang (religious calendar) lists ~170 distinct observance
 * names across the year, but most are recurring patterns — a fortnightly
 * Ekadashi fast, a monthly Sankashti Chaturthi, a Sankranti under twelve
 * different zodiac names — rather than 170 unrelated one-off events. Rather
 * than writing 170 near-duplicate explainer pages, each entry below covers
 * one recognizable concept in plain English, and `matchFestival()` maps any
 * raw calendar string onto the closest concept.
 *
 * `relatedEventId` optionally points at an `events` collection entry so the
 * detail page can surface that event's Tweeble registration link once the
 * temple provides one.
 */
export interface FestivalGlossaryEntry {
  slug: string;
  title: string;
  summary: string;
  explanation: string;
  relatedEventId?: string;
}

export const FESTIVAL_GLOSSARY: FestivalGlossaryEntry[] = [
  {
    slug: 'diwali',
    title: 'Diwali (Deepawali)',
    summary: 'The festival of lights, celebrating the triumph of light over darkness and good over evil.',
    explanation:
      "Diwali is Hinduism's biggest celebration — think of the warmth of Christmas combined with the sparkle of New Year's Eve. Homes are lit with oil lamps and string lights, families share sweets and gifts, and the holiday marks new beginnings: new calendars, new ventures, and a fresh start. It falls on the darkest night of the lunar month, which is part of the symbolism — light overcoming darkness.",
    relatedEventId: 'diwali-celebration',
  },
  {
    slug: 'kali-chaudas-choti-diwali',
    title: 'Choti Diwali (Kali Chaudas)',
    summary: 'The eve of Diwali, a day of preparation and smaller lamp-lighting rituals.',
    explanation:
      "The 'small Diwali' the day before the main event — similar to Christmas Eve leading into Christmas Day. Homes are cleaned and decorated, and smaller lamps are lit in preparation for the next night's larger celebration.",
    relatedEventId: 'diwali-celebration',
  },
  {
    slug: 'dhanteras',
    title: 'Dhanteras',
    summary: 'The opening day of the Diwali season, associated with prosperity and new purchases.',
    explanation:
      "Dhanteras kicks off the five-day Diwali season. It's traditional to buy something new — gold, kitchenware, even a car — as a symbol of inviting prosperity into the year ahead, similar to how some cultures consider it lucky to start a new venture on a particular date.",
    relatedEventId: 'diwali-celebration',
  },
  {
    slug: 'govardhan-puja',
    title: 'Govardhan Puja',
    summary: 'A day honoring nature and gratitude, following Diwali.',
    explanation:
      'Celebrated the day after the main Diwali night, this observance gives thanks to nature — the earth, mountains, and cattle — for sustaining life. It has the same "gratitude" spirit as a harvest festival.',
    relatedEventId: 'diwali-celebration',
  },
  {
    slug: 'bhai-dooj',
    title: 'Bhai Dooj',
    summary: "A day celebrating the bond between brothers and sisters, closing out the Diwali season.",
    explanation:
      "The Hindu equivalent of a dedicated 'siblings day' — sisters pray for their brothers' well-being and brothers, in turn, promise to look out for their sisters. It closes out the five-day Diwali season on a family-centered note.",
    relatedEventId: 'diwali-celebration',
  },
  {
    slug: 'holi',
    title: 'Holi',
    summary: 'The festival of colors, celebrating the arrival of spring and the victory of good over evil.',
    explanation:
      "Holi is the joyful, messy festival where people throw brightly colored powder and water at each other in the street — it's become well known even outside Hindu communities, and versions of it are now run as 'color runs' worldwide. Beyond the fun, it marks the start of spring and retells the story of good triumphing over a tyrannical demon king.",
    relatedEventId: 'holi',
  },
  {
    slug: 'holika-dahan',
    title: 'Holika Dahan',
    summary: "The bonfire ritual the night before Holi, symbolizing good triumphing over evil.",
    explanation:
      "The night before the color-throwing of Holi, communities light a bonfire — much like a New Year's Eve or Fourth of July bonfire — that reenacts a story of a good-hearted devotee protected from a fire meant to destroy him, symbolizing that good ultimately wins out over evil.",
    relatedEventId: 'holi',
  },
  {
    slug: 'rang-panchami',
    title: 'Rang Panchami',
    summary: 'A second round of color-play a few days after Holi, especially observed in some regions.',
    explanation:
      "A follow-up celebration a few days after Holi, with another round of playing with colors — think of it as an encore to the main event for communities that observe it.",
    relatedEventId: 'holi',
  },
  {
    slug: 'navratri',
    title: 'Navratri',
    summary: 'Nine nights honoring the divine feminine, celebrated with fasting, dance, and worship.',
    explanation:
      "Navratri ('nine nights') is a nine-day celebration of the Goddess in her many forms — a season of fasting, worship, and, in many communities, energetic nightly dancing (garba and dandiya raas). It happens twice a year, in spring and autumn, and the autumn Navratri is the larger, better-known one leading into Dussehra.",
    relatedEventId: 'navaratri-pooja',
  },
  {
    slug: 'durga-ashtami-navami',
    title: 'Durga Ashtami & Maha Navami',
    summary: 'The climactic eighth and ninth nights of Navratri, honoring the Goddess Durga at her most powerful.',
    explanation:
      "The most significant nights of the nine-night Navratri festival, when the Goddess Durga's victory over evil is celebrated at its peak, often with special fire rituals and community feasts.",
    relatedEventId: 'navaratri-pooja',
  },
  {
    slug: 'dussehra-vijayadashami',
    title: 'Dussehra (Vijaya Dashami)',
    summary: 'The tenth day marking the triumph of good over evil, closing out Navratri.',
    explanation:
      "Dussehra caps off the nine nights of Navratri and celebrates good defeating evil — in many regions this means giant effigies of the demon king Ravana are burned, similar in spirit to a fireworks-filled Independence Day finale. It's also considered an auspicious day to start something new.",
    relatedEventId: 'navaratri-pooja',
  },
  {
    slug: 'ganesh-chaturthi',
    title: 'Ganesh Chaturthi',
    summary: "The birthday celebration of Lord Ganesha, the elephant-headed remover of obstacles.",
    explanation:
      "A festival honoring Ganesha, the beloved elephant-headed deity known as the remover of obstacles — the one Hindus traditionally pray to before starting anything new, from a business to a wedding. Clay images of Ganesha are installed and worshipped for several days before being ceremonially immersed in water.",
  },
  {
    slug: 'sankashti-chaturthi',
    title: 'Sankashti Chaturthi',
    summary: "A monthly day of fasting and prayer to Lord Ganesha for removing life's obstacles.",
    explanation:
      "A monthly observance — falling on the fourth day after the full moon — where devotees fast and pray to Ganesha to clear obstacles in their lives. Think of it like a monthly day of reflection and intention-setting, built around a specific deity.",
    relatedEventId: 'sankata-hara-chaturthi',
  },
  {
    slug: 'krishna-janmashtami',
    title: 'Krishna Janmashtami',
    summary: "The birthday celebration of Lord Krishna, marked with midnight worship and festivities.",
    explanation:
      "The birthday of Lord Krishna, one of Hinduism's most beloved deities, celebrated with singing, dancing, and worship that often continues until midnight — the hour tradition holds he was born. It's one of the most joyful and widely celebrated festivals of the year, roughly comparable in spirit to a beloved figure's birthday combined with a religious vigil.",
  },
  {
    slug: 'ram-navami',
    title: 'Ram Navami',
    summary: 'The birthday of Lord Rama, celebrating the ideals of duty and righteousness.',
    explanation:
      "Celebrates the birth of Lord Rama, the hero of the epic Ramayana and a model of duty, honesty, and righteous living — Rama occupies a role in Hindu culture similar to how figures embodying moral virtue are honored in other traditions.",
  },
  {
    slug: 'hanuman-jayanti',
    title: 'Hanuman Jayanti',
    summary: 'The birthday celebration of Lord Hanuman, the devoted monkey deity known for strength and loyalty.',
    explanation:
      "Marks the birth of Hanuman, revered for his unwavering devotion, courage, and strength — he's often invoked for protection and to overcome fear, similar to how a patron saint of courage might be invoked in other traditions.",
  },
  {
    slug: 'hanuman-chalisa-recitation',
    title: '108 Hanuman Chalisa Recitation',
    summary: 'A devotional gathering reciting the 40-verse Hanuman Chalisa prayer 108 times.',
    explanation:
      "A community gathering where devotees chant the Hanuman Chalisa — a well-loved 40-verse hymn to Hanuman — 108 times together. The number 108 is considered sacred in Hindu tradition, similar to how repeating a rosary a set number of times carries meaning in other faiths.",
    relatedEventId: '108-hanuman-chalisa',
  },
  {
    slug: 'maha-shivaratri',
    title: 'Maha Shivaratri',
    summary: "The 'Great Night of Shiva,' the temple's most significant annual festival.",
    explanation:
      "The 'Great Night of Shiva' is one of the most important nights of the Hindu year, marked by all-night prayer vigils, chanting, and offerings to Lord Shiva. At Shri Shiv Dham specifically, it holds extra meaning as the anniversary of the temple's own founding.",
    relatedEventId: 'maha-shivratri',
  },
  {
    slug: 'pradosh-vrat',
    title: 'Pradosh Vrat',
    summary: 'A twice-monthly evening fast and prayer observance honoring Lord Shiva.',
    explanation:
      "A fast observed twice each lunar month, in the hour just after sunset, dedicated to Lord Shiva. Different Pradosh days are named for the day of the week they fall on (for example, a Monday Pradosh carries extra significance for Shiva devotees), but the practice — fasting and evening prayer — is the same each time.",
    relatedEventId: 'pradosham-pooja',
  },
  {
    slug: 'ekadashi',
    title: 'Ekadashi',
    summary: 'A twice-monthly fasting day observed by many Hindus for spiritual discipline.',
    explanation:
      "Ekadashi falls on the eleventh day after each new and full moon — roughly twice a month — and is traditionally observed with fasting and extra prayer. Each Ekadashi in the calendar has its own name and associated story, but the underlying practice of periodic fasting for spiritual discipline is shared across all of them, similar to how many faiths set aside recurring days for fasting or reflection.",
  },
  {
    slug: 'amavasya',
    title: 'Amavasya (New Moon)',
    summary: 'The new moon day, considered a time for honoring ancestors and quiet reflection.',
    explanation:
      "Amavasya is the new moon — the darkest night of the lunar month. Many Hindus use this day for quiet reflection, charitable giving, and rituals honoring deceased ancestors, similar to how some cultures set aside a day of remembrance for those who came before them.",
  },
  {
    slug: 'purnima',
    title: 'Purnima (Full Moon)',
    summary: 'The full moon day, considered especially auspicious for worship and charity.',
    explanation:
      "Purnima, the full moon, is considered an especially favorable day for worship, fasting, and charitable acts across the Hindu calendar. Several of the year's most important festivals (like Guru Purnima and Sharad Purnima) fall specifically on a full moon.",
  },
  {
    slug: 'sankranti',
    title: 'Sankranti',
    summary: "The sun's monthly transition into a new zodiac sign, marked twelve times a year.",
    explanation:
      "Sankranti marks the sun's movement from one zodiac sign into the next, and happens twelve times a year — roughly once a month. The best-known is Makar Sankranti in mid-January, celebrated with kite-flying in parts of India, marking the sun's turn back northward and the (astronomical) start of longer days.",
  },
  {
    slug: 'makar-sankranti-pongal',
    title: 'Makar Sankranti / Pongal',
    summary: 'A harvest festival marking the sun\'s turn northward, celebrated with kite-flying and festive food.',
    explanation:
      "The most widely celebrated of the year's twelve Sankranti days, marking the sun's turn northward and celebrated as a harvest festival — with kite-flying in northern India and the Pongal rice dish that gives South India's version of the festival its name. It plays a similar cultural role to a harvest thanksgiving.",
  },
  {
    slug: 'raksha-bandhan',
    title: 'Raksha Bandhan',
    summary: 'A festival celebrating the bond between brothers and sisters with a protective thread.',
    explanation:
      "Sisters tie a decorative thread (rakhi) around their brothers' wrists as a symbol of the bond between them, and brothers respond with a gift and a promise of protection and support. It's a warm, family-centered holiday similar in spirit to a dedicated 'siblings day.'",
  },
  {
    slug: 'karva-chauth',
    title: 'Karva Chauth',
    summary: 'A day observed primarily by married women, fasting for the well-being of their husbands.',
    explanation:
      "Traditionally observed by married women, who fast from sunrise until they see the moon that evening, praying for their husbands' health and long life. It's become a widely recognized symbol of devotion within a marriage, similar to how an anniversary tradition can carry deep personal meaning.",
  },
  {
    slug: 'teej',
    title: 'Teej',
    summary: 'A monsoon-season festival celebrating marital happiness and the arrival of the rains.',
    explanation:
      "A group of related festivals celebrated during the monsoon season, largely by women, honoring marital happiness and the goddess Parvati. Celebrations often include wearing green, decorating with henna, and swinging on decorated swings — a joyful welcome to the rainy season.",
  },
  {
    slug: 'chhath-puja',
    title: 'Chhath Puja',
    summary: 'A festival honoring the Sun God, observed with offerings at sunrise and sunset.',
    explanation:
      "A rigorous, multi-day festival giving thanks to the Sun God for sustaining life on earth, with devotees standing in water at sunrise and sunset to make offerings. It's especially significant to communities from the Bihar and eastern Uttar Pradesh regions of India.",
  },
  {
    slug: 'guru-purnima',
    title: 'Guru Purnima',
    summary: 'A day dedicated to honoring teachers and spiritual guides.',
    explanation:
      "A day set aside to express gratitude to one's teachers and spiritual guides — not unlike a 'Teacher Appreciation Day,' but rooted in the idea that a good teacher lights the way out of ignorance, much as the full moon lights up the night.",
  },
  {
    slug: 'saraswati-puja-vasant-panchami',
    title: 'Saraswati Puja / Vasant Panchami',
    summary: 'A festival honoring the goddess of knowledge, music, and the arts, marking the start of spring.',
    explanation:
      "Honors Saraswati, the goddess of knowledge, music, and the arts, and traditionally marks the first stirrings of spring. Students, musicians, and artists often have their books and instruments blessed on this day — similar to a season-opening blessing for anyone whose work depends on creativity or learning.",
  },
  {
    slug: 'nag-panchami',
    title: 'Nag Panchami',
    summary: 'A day honoring snake deities, reflecting reverence for nature in Hindu tradition.',
    explanation:
      "A day of reverence toward snakes and serpent deities (nagas), reflecting a broader thread in Hindu tradition of honoring and living respectfully alongside the natural world.",
  },
  {
    slug: 'akshaya-tritiya',
    title: 'Akshaya Tritiya',
    summary: "A day considered auspicious for beginnings, particularly financial ones.",
    explanation:
      "Considered one of the most auspicious days of the year for starting something new, especially major purchases or investments — 'akshaya' means 'never-diminishing,' so anything begun on this day is believed to bring lasting prosperity.",
  },
  {
    slug: 'gayatri-jayanti',
    title: 'Gayatri Jayanti',
    summary: 'A day honoring the Gayatri Mantra, one of the most revered prayers in Hindu tradition.',
    explanation:
      "Celebrates the Gayatri Mantra, one of the oldest and most widely chanted prayers in Hindu tradition, understood as a prayer for wisdom and enlightenment.",
  },
  {
    slug: 'gita-jayanti',
    title: 'Gita Jayanti',
    summary: 'The anniversary of the day the Bhagavad Gita was spoken, a foundational Hindu scripture.',
    explanation:
      "Marks the day the Bhagavad Gita — one of Hinduism's most important scriptures, a conversation on duty and purpose between the warrior Arjuna and Lord Krishna — was first spoken. It's a day for reading and reflecting on its teachings.",
  },
  {
    slug: 'tulsi-vivah',
    title: 'Tulsi Vivah',
    summary: 'A ceremony celebrating the symbolic marriage of the sacred Tulsi (basil) plant.',
    explanation:
      "A ceremony celebrating the symbolic wedding of the Tulsi (holy basil) plant, which is treated with great reverence in Hindu households, to Lord Vishnu. It also traditionally marks the close of the wedding-avoidance period during the monsoon season, making it an auspicious day for real weddings to resume.",
  },
  {
    slug: 'vat-savitri-vrat',
    title: 'Vat Savitri Vrat',
    summary: "A day observed by married women, praying for their husbands' well-being under a banyan tree.",
    explanation:
      "Observed by married women who fast and pray, often under or near a banyan tree, for their husbands' long life and well-being — drawing on the story of Savitri, who through devotion and wit won her husband's life back.",
  },
  {
    slug: 'international-yoga-day',
    title: 'International Yoga Day',
    summary: "A global observance celebrating yoga's roots in Indian and Hindu tradition.",
    explanation:
      "Recognized by the United Nations, International Yoga Day celebrates yoga's origins in ancient Indian tradition and its now-worldwide practice as a path to physical and mental well-being.",
  },
  {
    slug: 'varalakshmi-vratam',
    title: 'Varalakshmi Vratam',
    summary: 'A day of prayer to the goddess Lakshmi for prosperity and family well-being.',
    explanation:
      "Primarily observed by married women, this day of prayer to Varalakshmi (a form of the goddess of prosperity) asks for the well-being and good fortune of the whole family.",
  },
  {
    slug: 'satyanarayan-puja',
    title: 'Satyanarayan Puja',
    summary: 'A worship ceremony giving thanks to Lord Vishnu, often held to mark a milestone or express gratitude.',
    explanation:
      "A ceremony of thanksgiving to Lord Vishnu in his form as Satyanarayan ('the true, eternal one'), often performed to mark a happy occasion or simply to express gratitude — similar in spirit to a thanksgiving or blessing service held around a milestone.",
    relatedEventId: 'satyanarayan-pooja',
  },
  {
    slug: 'sundarkand-paath',
    title: 'Sunderkand Paath',
    summary: 'A devotional group recitation of a chapter from the epic Ramayana.',
    explanation:
      "A group recitation of the Sunderkand, a chapter of the epic Ramayana focused on Hanuman's heroic journey to find Sita — recited together for its uplifting, obstacle-overcoming themes, similar to a communal reading of an inspiring text.",
    relatedEventId: 'sunderkand-paath',
  },
  {
    slug: 'vishwakarma-puja',
    title: 'Vishwakarma Puja',
    summary: 'A day honoring the divine architect, especially observed by tradespeople and craftspeople.',
    explanation:
      "Honors Vishwakarma, the divine architect and craftsman in Hindu tradition. It's especially meaningful to engineers, artisans, and factory workers, who often bless their tools and machinery on this day.",
  },
  {
    slug: 'narasimha-jayanti',
    title: 'Narasimha Jayanti',
    summary: 'A celebration of the half-lion, half-man form of Lord Vishnu, protector against tyranny.',
    explanation:
      "Celebrates the appearance of Narasimha, Lord Vishnu's half-man, half-lion form, who appears in Hindu scripture to protect a devoted child from a tyrannical father — a story about divine protection defeating abuse of power.",
  },
  {
    slug: 'kal-bhairav-jayanti',
    title: 'Kal Bhairav Jayanti',
    summary: 'A day honoring a fierce guardian form of Lord Shiva.',
    explanation:
      "Marks the appearance of Kal Bhairav, a fierce protector form of Lord Shiva associated with justice and guarding sacred spaces.",
  },
  {
    slug: 'ganga-dashara',
    title: 'Ganga Dashara',
    summary: "Celebrates the descent of the sacred Ganges River, revered in Hindu tradition.",
    explanation:
      "Marks the day the Ganges River is believed to have descended to earth. The Ganges holds deep reverence in Hindu tradition, similar to how certain natural landmarks carry sacred meaning in other cultures.",
  },
  {
    slug: 'rath-yatra',
    title: 'Rath Yatra',
    summary: 'A festival where deity images are paraded through the community on large chariots.',
    explanation:
      "A festival in which images of deities are placed on large, elaborately decorated chariots and pulled through the streets by devotees, bringing the temple's worship out into the wider community — the origin of the English word 'juggernaut.'",
  },
  {
    slug: 'us-calendar-observance',
    title: 'Calendar Observance',
    summary: 'A widely recognized calendar date the temple also notes for its community.',
    explanation:
      "This is a broadly recognized calendar observance (like Mother's Day, Father's Day, or the New Year) that the temple also marks on its community calendar, alongside its Hindu religious festivals.",
  },
  {
    slug: 'hindu-observance',
    title: 'Hindu Observance',
    summary: "One of the many day-specific observances in the Hindu lunar calendar.",
    explanation:
      "The Hindu calendar tracks the moon's monthly cycle closely, and many days carry their own specific name and small ritual significance — tied to a particular phase of the moon, a regional tradition, or a specific deity's story. This is one of those observances; ask a priest at the temple office if you'd like to learn more about its specific significance.",
  },
];

const RULES: { test: (name: string) => boolean; slug: string }[] = [
  { test: (n) => /dev diwali/i.test(n), slug: 'satyanarayan-puja' },
  { test: (n) => /kali chaudas/i.test(n), slug: 'kali-chaudas-choti-diwali' },
  { test: (n) => /dhan\s*teras/i.test(n), slug: 'dhanteras' },
  { test: (n) => /govardhan/i.test(n), slug: 'govardhan-puja' },
  { test: (n) => /bhai\s*dooj/i.test(n), slug: 'bhai-dooj' },
  { test: (n) => /diwali|deepawali/i.test(n), slug: 'diwali' },
  { test: (n) => /holika dahan/i.test(n), slug: 'holika-dahan' },
  { test: (n) => /rang panchami/i.test(n), slug: 'rang-panchami' },
  { test: (n) => /\bholi\b/i.test(n), slug: 'holi' },
  { test: (n) => /durga ast|maha navmi/i.test(n), slug: 'durga-ashtami-navami' },
  { test: (n) => /vijya dashmi|dashahra|vijaya dashami/i.test(n), slug: 'dussehra-vijayadashami' },
  { test: (n) => /navratri|navratamri/i.test(n), slug: 'navratri' },
  { test: (n) => /ganesh (chaturthi|sthapna|visarjan)|kalank chaturthi/i.test(n), slug: 'ganesh-chaturthi' },
  { test: (n) => /sankasht/i.test(n), slug: 'sankashti-chaturthi' },
  { test: (n) => /janmastami|kansa vadh/i.test(n), slug: 'krishna-janmashtami' },
  { test: (n) => /ram navmi|sita navmi/i.test(n), slug: 'ram-navami' },
  { test: (n) => /108 hanuman chalisa/i.test(n), slug: 'hanuman-chalisa-recitation' },
  { test: (n) => /hanuman jayanti/i.test(n), slug: 'hanuman-jayanti' },
  { test: (n) => /maha shivaratri|maha shivratri/i.test(n), slug: 'maha-shivaratri' },
  { test: (n) => /pradosh/i.test(n), slug: 'pradosh-vrat' },
  { test: (n) => /ekadashi|ekadasi/i.test(n), slug: 'ekadashi' },
  { test: (n) => /makar sankranti|pongal/i.test(n), slug: 'makar-sankranti-pongal' },
  { test: (n) => /sankranti/i.test(n), slug: 'sankranti' },
  { test: (n) => /raksha bandhan/i.test(n), slug: 'raksha-bandhan' },
  { test: (n) => /karwa chauth|karva chauth/i.test(n), slug: 'karva-chauth' },
  { test: (n) => /teej/i.test(n), slug: 'teej' },
  { test: (n) => /chath pooja|chhath/i.test(n), slug: 'chhath-puja' },
  { test: (n) => /guru purnima/i.test(n), slug: 'guru-purnima' },
  { test: (n) => /saraswati|vasant panchami/i.test(n), slug: 'saraswati-puja-vasant-panchami' },
  { test: (n) => /nag panchami/i.test(n), slug: 'nag-panchami' },
  { test: (n) => /akshy?a tritya|akshaya tritiya/i.test(n), slug: 'akshaya-tritiya' },
  { test: (n) => /gayatri jayanti/i.test(n), slug: 'gayatri-jayanti' },
  { test: (n) => /gita jayanti/i.test(n), slug: 'gita-jayanti' },
  { test: (n) => /tulsi vivah/i.test(n), slug: 'tulsi-vivah' },
  { test: (n) => /vat savitri/i.test(n), slug: 'vat-savitri-vrat' },
  { test: (n) => /yoga day/i.test(n), slug: 'international-yoga-day' },
  { test: (n) => /varalakshmi/i.test(n), slug: 'varalakshmi-vratam' },
  { test: (n) => /satyanarayan/i.test(n), slug: 'satyanarayan-puja' },
  { test: (n) => /sunderkand|sunder kand/i.test(n), slug: 'sundarkand-paath' },
  { test: (n) => /vishvakarma|vishwakarma/i.test(n), slug: 'vishwakarma-puja' },
  { test: (n) => /narasimha jayanti/i.test(n), slug: 'narasimha-jayanti' },
  { test: (n) => /kal bhairav/i.test(n), slug: 'kal-bhairav-jayanti' },
  { test: (n) => /ganga dashara/i.test(n), slug: 'ganga-dashara' },
  { test: (n) => /rath yatra/i.test(n), slug: 'rath-yatra' },
  { test: (n) => /amavasya|amavas/i.test(n), slug: 'amavasya' },
  { test: (n) => /purnima/i.test(n), slug: 'purnima' },
  { test: (n) => /mother.?s day|father.?s day|children.?s day|new year|hindi diwas/i.test(n), slug: 'us-calendar-observance' },
];

export function matchFestival(name: string): FestivalGlossaryEntry {
  for (const rule of RULES) {
    if (rule.test(name)) {
      const entry = FESTIVAL_GLOSSARY.find((e) => e.slug === rule.slug);
      if (entry) return entry;
    }
  }
  return FESTIVAL_GLOSSARY.find((e) => e.slug === 'hindu-observance')!;
}
