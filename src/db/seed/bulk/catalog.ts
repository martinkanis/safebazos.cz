import {
  Aperture,
  Archive,
  Armchair,
  Bath,
  Bed,
  Bike,
  Bird,
  Blocks,
  Book,
  BookOpen,
  BrickWall,
  Briefcase,
  Building,
  CalendarClock,
  Camera,
  Car,
  Cat,
  CookingPot,
  Coins,
  Cpu,
  Crown,
  Disc3,
  Dog,
  Drum,
  Dumbbell,
  Fish,
  Flame,
  Flower2,
  Footprints,
  Gamepad2,
  Gem,
  GraduationCap,
  Guitar,
  HandCoins,
  HardHat,
  Headphones,
  House,
  Lamp,
  LandPlot,
  Laptop,
  Monitor,
  Motorbike,
  Mountain,
  Newspaper,
  Package,
  Piano,
  Printer,
  Puzzle,
  Rabbit,
  Search,
  Shirt,
  Smartphone,
  Snowflake,
  Sofa,
  Speaker,
  Store,
  Table,
  TabletSmartphone,
  Tent,
  Theater,
  Ticket,
  Tractor,
  Truck,
  Turtle,
  Tv,
  Warehouse,
  WashingMachine,
  Watch,
  Wrench,
  type IconNode,
} from 'lucide'

/** Textové šablony pro generovaná demo data — jen seed, v aplikaci se nepoužívají. */

export interface SubcategoryCatalog {
  items: string[]
  /** Rozsah ceny v Kč; null = cena typicky „dohodou“ / „v textu“ (práce, služby). */
  priceRange: [min: number, max: number] | null
  icon: IconNode
}

export interface MainCategoryCatalog {
  titleHooks: string[]
  /** Skupiny vět popisu — z každé skupiny se vybere jedna. */
  sentenceGroups: string[][]
  subcategories: Record<string, SubcategoryCatalog>
}

const GOODS_SENTENCES: string[][] = [
  [
    'Stav odpovídá stáří, vše plně funkční.',
    'Jako nové, používané jen krátce.',
    'Drobné známky používání, jinak bez vad.',
    'Velmi zachovalé, pečlivě udržované.',
    'Nepoužívané, stále v původním balení.',
  ],
  [
    'Prodávám kvůli stěhování.',
    'Důvod prodeje: nevyužiji.',
    'Prodávám, protože jsem pořídil novější model.',
    'Uvolňuji místo doma.',
    'Dostal jsem jako dárek, mám už jiné.',
  ],
  [
    'Osobní předání po domluvě, případně pošlu s bezpečnou platbou.',
    'Pošlu Zásilkovnou nebo předám osobně.',
    'Pouze osobní odběr.',
    'Možnost vyzkoušení na místě.',
    'Při rychlém jednání sleva.',
  ],
]

const GOODS_HOOKS = [
  'TOP stav',
  'jako nové',
  'málo používané',
  'původní balení',
  'rychlé jednání',
  'se zárukou',
]

export const CATALOG: Record<string, MainCategoryCatalog> = {
  zvirata: {
    titleHooks: ['s PP', 'očkovaní', 'zdravá zvířata', 'odběr ihned'],
    sentenceGroups: [
      [
        'Zvířata jsou zdravá, odčervená a zvyklá na lidi.',
        'Rodiče k vidění na místě.',
        'Chováme doma, s dětmi a ostatními zvířaty.',
      ],
      ['K odběru s kompletní výbavou do začátku.', 'Zájemcům rádi poradíme s chovem.'],
      ['Pouze osobní předání, zvířata neposíláme.', 'Předání po osobní domluvě.'],
    ],
    subcategories: {
      psi: {
        items: [
          'Štěňata labradora',
          'Štěně jorkšírského teriéra',
          'Štěňata border kolie',
          'Štěně jezevčíka',
          'Štěňata zlatého retrívra',
        ],
        priceRange: [3000, 25000],
        icon: Dog,
      },
      kocky: {
        items: [
          'Koťata britské krátkosrsté',
          'Kotě mainské mývalí',
          'Koťata ragdoll',
          'Domácí koťata',
        ],
        priceRange: [500, 15000],
        icon: Cat,
      },
      ptactvo: {
        items: ['Andulky mladé', 'Korely pár', 'Slepice nosnice', 'Kanárci zpěváci'],
        priceRange: [150, 3000],
        icon: Bird,
      },
      hlodavci: {
        items: ['Morčata mláďata', 'Králík zakrslý beran', 'Křečci džungarští', 'Činčila s klecí'],
        priceRange: [100, 2500],
        icon: Rabbit,
      },
      akvaristika: {
        items: [
          'Akvárium 60 l s vybavením',
          'Vnější filtr Eheim',
          'Skalára mladé kusy',
          'Akvarijní rostliny mix',
        ],
        priceRange: [100, 6000],
        icon: Fish,
      },
      teraristika: {
        items: [
          'Terárium 60×40×40',
          'Užovka červená s teráriem',
          'Gekončík noční',
          'Želva zelenavá',
        ],
        priceRange: [500, 8000],
        icon: Turtle,
      },
      kone: {
        items: [
          'Klisna českého teplokrevníka',
          'Westernové sedlo',
          'Kůň na rekreační ježdění',
          'Koňská deka a ohlávka',
        ],
        priceRange: [2000, 90000],
        icon: Crown,
      },
      'chovatelske-potreby': {
        items: [
          'Přepravka pro psa',
          'Kočičí škrabadlo velké',
          'Pelech pro psa 90 cm',
          'Klec pro papouška',
        ],
        priceRange: [150, 3500],
        icon: Package,
      },
      ostatni: {
        items: ['Pštrosí vejce k líhnutí', 'Oplocenka pro kozy', 'Včelí úly Langstroth'],
        priceRange: [200, 9000],
        icon: Bird,
      },
    },
  },
  deti: {
    titleHooks: GOODS_HOOKS,
    sentenceGroups: [
      GOODS_SENTENCES[0]!,
      [
        'Po jednom dítěti, nekuřácká domácnost.',
        'Vyprané a připravené k předání.',
        'Dítě vyrostlo.',
      ],
      GOODS_SENTENCES[2]!,
    ],
    subcategories: {
      kocarky: {
        items: [
          'Kočárek Cybex Priam',
          'Kombinovaný kočárek Thule Urban Glide',
          'Sportovní kočárek Baby Jogger',
          'Kočárek Bugaboo Fox',
        ],
        priceRange: [1500, 18000],
        icon: Puzzle,
      },
      autosedacky: {
        items: [
          'Autosedačka Britax Römer',
          'Vajíčko Maxi-Cosi s bází',
          'Autosedačka Cybex Sirona',
          'Podsedák Recaro',
        ],
        priceRange: [400, 7000],
        icon: Car,
      },
      obleceni: {
        items: [
          'Balík oblečení pro holčičku vel. 86',
          'Zimní kombinéza vel. 98',
          'Mikiny pro kluka 122',
          'Body a overaly 62–68',
        ],
        priceRange: [100, 1500],
        icon: Shirt,
      },
      obuv: {
        items: [
          'Zimní boty Reima vel. 27',
          'Capáčky Bobux',
          'Holínky Crocs vel. 30',
          'Sandály Primigi vel. 25',
        ],
        priceRange: [150, 1200],
        icon: Footprints,
      },
      hracky: {
        items: [
          'LEGO Duplo velký box',
          'Dřevěná kuchyňka',
          'LEGO City policejní stanice',
          'Odrážedlo Puky',
          'Stavebnice Magformers',
        ],
        priceRange: [150, 4500],
        icon: Blocks,
      },
      nabytek: {
        items: [
          'Dětská postýlka s matrací',
          'Rostoucí židle Stokke Tripp Trapp',
          'Přebalovací komoda',
          'Patrová postel',
        ],
        priceRange: [500, 8000],
        icon: Bed,
      },
      ostatni: {
        items: [
          'Chůvička Philips Avent',
          'Nosítko Ergobaby',
          'Odsávačka Medela',
          'Ohrádka skládací',
        ],
        priceRange: [300, 4000],
        icon: Puzzle,
      },
    },
  },
  reality: {
    titleHooks: ['ihned k nastěhování', 'po rekonstrukci', 'klidná lokalita', 'bez realitky'],
    sentenceGroups: [
      [
        'Nemovitost je v dobrém stavu, okna plastová.',
        'Po kompletní rekonstrukci.',
        'Novostavba, energetická třída B.',
      ],
      [
        'V blízkosti MHD, obchody a škola.',
        'Klidná lokalita se zelení.',
        'Parkování přímo u domu.',
      ],
      ['Prohlídky po domluvě.', 'Jednám přímo, bez realitní kanceláře.', 'Volné ihned.'],
    ],
    subcategories: {
      byty: {
        items: [
          'Byt 2+kk, 54 m²',
          'Byt 3+1, 72 m², balkon',
          'Pronájem bytu 1+kk',
          'Byt 4+kk s terasou',
        ],
        priceRange: [9000, 6500000],
        icon: Building,
      },
      domy: {
        items: [
          'Rodinný dům 5+1 se zahradou',
          'Řadový dům 4+kk',
          'Dům k rekonstrukci',
          'Bungalov 4+kk',
        ],
        priceRange: [2500000, 12000000],
        icon: House,
      },
      pozemky: {
        items: [
          'Stavební pozemek 900 m²',
          'Zahrada s chatkou',
          'Louka 3 500 m²',
          'Pozemek se sítěmi',
        ],
        priceRange: [150000, 4000000],
        icon: LandPlot,
      },
      'chaty-chalupy': {
        items: [
          'Chata u lesa',
          'Roubenka v Krkonoších',
          'Chalupa po rekonstrukci',
          'Chatka u rybníka',
        ],
        priceRange: [600000, 5500000],
        icon: Tent,
      },
      garaze: {
        items: ['Garáž v řadě', 'Pronájem garážového stání', 'Zděná garáž s elektřinou'],
        priceRange: [1500, 650000],
        icon: Warehouse,
      },
      komercni: {
        items: ['Kancelář 40 m²', 'Obchodní prostor v centru', 'Sklad 200 m²'],
        priceRange: [8000, 40000],
        icon: Store,
      },
    },
  },
  prace: {
    titleHooks: ['ihned', 'HPP', 'i pro studenty', 'flexibilní doba'],
    sentenceGroups: [
      [
        'Nabízíme férové jednání a pravidelnou výplatu.',
        'Zaučení zajistíme.',
        'Hledám dlouhodobou spolupráci.',
      ],
      ['Nástup možný ihned.', 'Pracovní doba po domluvě.', 'Vhodné i pro důchodce a studenty.'],
      ['Více informací ve zprávě.', 'Ozvěte se přes zprávy SafeBazos.'],
    ],
    subcategories: {
      'nabidka-prace': {
        items: [
          'Řidič dodávky sk. B',
          'Prodavač/ka do prodejny',
          'Skladník s VZV',
          'Kuchař do restaurace',
          'Elektrikář',
        ],
        priceRange: null,
        icon: Briefcase,
      },
      'hledam-praci': {
        items: [
          'Hledám práci jako účetní',
          'Hledám brigádu o víkendech',
          'Zedník hledá práci',
          'Hledám práci na HPP – administrativa',
        ],
        priceRange: null,
        icon: Search,
      },
      brigady: {
        items: [
          'Brigáda – inventury',
          'Pomoc na stavbě',
          'Roznos letáků',
          'Sezónní výpomoc v sadu',
        ],
        priceRange: null,
        icon: CalendarClock,
      },
    },
  },
  auto: {
    titleHooks: ['servisní knížka', 'nehavarováno', 'po STK', 'první majitel', 'tažné zařízení'],
    sentenceGroups: [
      [
        'Pravidelně servisováno, doložím faktury.',
        'Nehavarováno, doložím Cebia.',
        'STK platná dva roky.',
        'Nová rozvodová sada a brzdy.',
      ],
      [
        'Klimatizace, tempomat, vyhřívaná sedadla.',
        'Dvě sady kol (letní i zimní).',
        'Nekuřácké vozidlo.',
        'Garážováno.',
      ],
      ['Možnost prohlídky v servisu.', 'Převod na úřadě zajistím.', 'Při rychlém jednání sleva.'],
    ],
    subcategories: {
      skoda: {
        items: [
          'Škoda Octavia III Combi 2.0 TDI',
          'Škoda Fabia II 1.2 HTP',
          'Škoda Superb 2.0 TDI',
          'Škoda Kodiaq 2.0 TDI 4x4',
          'Škoda Rapid 1.0 TSI',
        ],
        priceRange: [45000, 650000],
        icon: Car,
      },
      volkswagen: {
        items: [
          'VW Golf VII 1.4 TSI',
          'VW Passat B8 Variant',
          'VW Polo 1.0 MPI',
          'VW Tiguan 2.0 TDI',
        ],
        priceRange: [60000, 700000],
        icon: Car,
      },
      ford: {
        items: [
          'Ford Focus kombi 1.5 TDCi',
          'Ford Fiesta 1.25',
          'Ford Mondeo 2.0',
          'Ford Kuga 2.0 TDCi',
        ],
        priceRange: [40000, 450000],
        icon: Car,
      },
      renault: {
        items: [
          'Renault Clio 1.2',
          'Renault Mégane Grandtour',
          'Renault Captur TCe',
          'Renault Kangoo',
        ],
        priceRange: [35000, 350000],
        icon: Car,
      },
      peugeot: {
        items: ['Peugeot 308 SW 1.6 HDi', 'Peugeot 208 1.2 PureTech', 'Peugeot 3008'],
        priceRange: [45000, 420000],
        icon: Car,
      },
      bmw: {
        items: ['BMW 320d Touring', 'BMW X3 xDrive20d', 'BMW 118i', 'BMW 530d'],
        priceRange: [120000, 900000],
        icon: Car,
      },
      audi: {
        items: ['Audi A4 Avant 2.0 TDI', 'Audi A6 3.0 TDI quattro', 'Audi A3 Sportback', 'Audi Q5'],
        priceRange: [120000, 950000],
        icon: Car,
      },
      'mercedes-benz': {
        items: [
          'Mercedes-Benz C 220d',
          'Mercedes-Benz E 350',
          'Mercedes-Benz A 180',
          'Mercedes-Benz Vito',
        ],
        priceRange: [150000, 1100000],
        icon: Car,
      },
      toyota: {
        items: ['Toyota Corolla Hybrid', 'Toyota Yaris 1.33', 'Toyota RAV4 4x4', 'Toyota Auris TS'],
        priceRange: [80000, 650000],
        icon: Car,
      },
      'hyundai-kia': {
        items: ['Hyundai i30 kombi', 'Kia Ceed 1.4', 'Hyundai Tucson', 'Kia Sportage'],
        priceRange: [80000, 550000],
        icon: Car,
      },
      'ostatni-znacky': {
        items: ['Dacia Duster 4x4', 'Mazda 6 kombi', 'Volvo V60 D4', 'Opel Astra 1.6'],
        priceRange: [60000, 550000],
        icon: Car,
      },
      'nahradni-dily': {
        items: [
          'Přední světlomet Octavia III',
          'Převodovka 6st. DSG',
          'Alternátor Bosch',
          'Sada brzdových kotoučů',
        ],
        priceRange: [300, 25000],
        icon: Wrench,
      },
      'pneumatiky-kola': {
        items: [
          'Zimní pneu Michelin 205/55 R16',
          'Alu kola 17" 5x112',
          'Letní pneu Continental 225/45 R17',
          'Plechové disky 15"',
        ],
        priceRange: [1500, 22000],
        icon: Disc3,
      },
    },
  },
  motorky: {
    titleHooks: ['garážováno', 'po servisu', 'nízký nájezd', 'STK platná'],
    sentenceGroups: [
      ['Pravidelný servis, nový olej a filtry.', 'Nízký nájezd, bez pádu.', 'Garážováno, nekuřák.'],
      [
        'Nové pneumatiky a řetězová sada.',
        'Kufry a padací rámy v ceně.',
        'Originální výfuk přiložím.',
      ],
      ['Prohlídka možná kdykoliv.', 'Převod zajistím.', 'Pouze osobní převzetí.'],
    ],
    subcategories: {
      motocykly: {
        items: ['Honda CBF 600', 'Yamaha MT-07', 'Kawasaki Z650', 'BMW R 1200 GS', 'Suzuki SV650'],
        priceRange: [45000, 280000],
        icon: Motorbike,
      },
      skutry: {
        items: ['Honda PCX 125', 'Yamaha NMAX 125', 'Piaggio Liberty 50', 'Vespa Primavera'],
        priceRange: [15000, 75000],
        icon: Motorbike,
      },
      ctyrkolky: {
        items: ['Čtyřkolka CF Moto 450', 'Dětská čtyřkolka 110 cc', 'Can-Am Outlander'],
        priceRange: [15000, 250000],
        icon: Motorbike,
      },
      dily: {
        items: ['Výfuk Akrapovič', 'Řetězová sada DID', 'Boční kufry Givi', 'Brzdové destičky EBC'],
        priceRange: [300, 15000],
        icon: Wrench,
      },
      'obleceni-helmy': {
        items: [
          'Helma Shoei vel. M',
          'Kožená bunda Dainese vel. 52',
          'Moto boty Alpinestars 43',
          'Textilní kalhoty Rev’it',
        ],
        priceRange: [800, 12000],
        icon: HardHat,
      },
    },
  },
  stroje: {
    titleHooks: ['plně funkční', 'po servisu', 'málo používané'],
    sentenceGroups: [
      [
        'Stroj je plně funkční, pravidelně servisovaný.',
        'Používáno jen na hobby práce.',
        'Po generální opravě.',
      ],
      ['Doklady a návod k dispozici.', 'Příslušenství v ceně.', 'Možnost předvedení v provozu.'],
      ['Odvoz vlastní, pomohu naložit.', 'Při rychlém jednání sleva.'],
    ],
    subcategories: {
      zemedelske: {
        items: ['Traktor Zetor 7211', 'Malotraktor Vari', 'Rotavátor 1,5 m', 'Mulčovač za traktor'],
        priceRange: [8000, 320000],
        icon: Tractor,
      },
      stavebni: {
        items: ['Míchačka 150 l', 'Vibrační deska', 'Lešení 100 m²', 'Minibagr Kubota'],
        priceRange: [2500, 450000],
        icon: HardHat,
      },
      naradi: {
        items: [
          'Aku vrtačka Makita 18V',
          'Úhlová bruska Bosch',
          'Pokosová pila DeWalt',
          'Kompresor 50 l',
        ],
        priceRange: [800, 15000],
        icon: Wrench,
      },
      ostatni: {
        items: ['Svářečka invertor', 'Elektrocentrála 3 kW', 'Tlaková myčka Kärcher'],
        priceRange: [1500, 18000],
        icon: Wrench,
      },
    },
  },
  'dum-a-zahrada': {
    titleHooks: GOODS_HOOKS,
    sentenceGroups: GOODS_SENTENCES,
    subcategories: {
      zahrada: {
        items: [
          'Sekačka Honda s pojezdem',
          'Zahradní set ratan',
          'Křovinořez Stihl',
          'Trampolína 305 cm',
          'Zahradní gril Weber',
        ],
        priceRange: [500, 15000],
        icon: Flower2,
      },
      'stavebni-material': {
        items: [
          'Zámková dlažba 30 m²',
          'Pórobeton Ytong zbytek',
          'Střešní tašky Bramac',
          'OSB desky 18 mm',
        ],
        priceRange: [500, 20000],
        icon: BrickWall,
      },
      kuchyne: {
        items: [
          'Kuchyňská linka 3 m',
          'Mikrovlnná trouba Whirlpool',
          'Sada hrnců Tescoma',
          'Robot Kenwood',
        ],
        priceRange: [300, 25000],
        icon: CookingPot,
      },
      koupelna: {
        items: [
          'Vana akrylátová 170 cm',
          'Umyvadlo se skříňkou',
          'Sprchový kout 90×90',
          'Baterie Grohe',
        ],
        priceRange: [500, 9000],
        icon: Bath,
      },
      topeni: {
        items: ['Krbová kamna', 'Plynový kotel Viessmann', 'Radiátor 60×100', 'Olejový radiátor'],
        priceRange: [500, 35000],
        icon: Flame,
      },
      ostatni: {
        items: ['Žebřík hliníkový 3×9', 'Vysavač Dyson V11', 'Lampa stojací', 'Koberec 200×300'],
        priceRange: [300, 9000],
        icon: Lamp,
      },
    },
  },
  pc: {
    titleHooks: GOODS_HOOKS,
    sentenceGroups: [
      GOODS_SENTENCES[0]!,
      ['Doklad o koupi přiložím.', 'Čistá instalace systému.', 'Baterie drží dobře.'],
      GOODS_SENTENCES[2]!,
    ],
    subcategories: {
      notebooky: {
        items: [
          'MacBook Air M1 8/256',
          'Lenovo ThinkPad T14',
          'Dell XPS 13',
          'ASUS herní notebook RTX 3060',
          'HP EliteBook 840',
        ],
        priceRange: [4000, 35000],
        icon: Laptop,
      },
      pocitace: {
        items: [
          'Herní PC Ryzen 5 + RTX 3060',
          'Mac mini M2',
          'Kancelářský PC i5',
          'Mini PC Intel NUC',
        ],
        priceRange: [3000, 40000],
        icon: Cpu,
      },
      monitory: {
        items: [
          'Monitor Dell 27" QHD',
          'LG UltraWide 34"',
          'Samsung 24" Full HD',
          'Herní monitor 165 Hz',
        ],
        priceRange: [1200, 12000],
        icon: Monitor,
      },
      komponenty: {
        items: [
          'Grafická karta RTX 3070',
          'Procesor Ryzen 7 5800X',
          'RAM DDR4 32 GB',
          'SSD Samsung 1 TB',
        ],
        priceRange: [600, 15000],
        icon: Cpu,
      },
      tiskarny: {
        items: ['Laserová tiskárna HP', 'Multifunkce Canon', 'Tiskárna Epson EcoTank'],
        priceRange: [800, 6000],
        icon: Printer,
      },
      prislusenstvi: {
        items: [
          'Klávesnice Logitech MX Keys',
          'Myš Logitech MX Master 3',
          'Webkamera Full HD',
          'Dokovací stanice USB-C',
        ],
        priceRange: [300, 3500],
        icon: Headphones,
      },
    },
  },
  mobily: {
    titleHooks: ['baterie 90 %+', 'bez škrábanců', 'komplet balení', 'odblokovaný'],
    sentenceGroups: [
      GOODS_SENTENCES[0]!,
      [
        'Vždy v obalu a se sklem.',
        'Originální krabice a nabíječka.',
        'Doklad o koupi z Alzy.',
        'Telefon není blokovaný na operátora.',
      ],
      GOODS_SENTENCES[2]!,
    ],
    subcategories: {
      apple: {
        items: [
          'iPhone 13 128 GB',
          'iPhone 14 Pro 256 GB',
          'iPhone 12 mini',
          'iPhone 15 128 GB',
          'iPhone SE 2022',
        ],
        priceRange: [4500, 24000],
        icon: Smartphone,
      },
      samsung: {
        items: [
          'Samsung Galaxy S23',
          'Samsung Galaxy A54',
          'Samsung Galaxy S22 Ultra',
          'Samsung Galaxy Z Flip 5',
        ],
        priceRange: [3000, 20000],
        icon: Smartphone,
      },
      xiaomi: {
        items: ['Xiaomi Redmi Note 12', 'Xiaomi 13T', 'POCO F5', 'Xiaomi Redmi 12'],
        priceRange: [2000, 9000],
        icon: Smartphone,
      },
      ostatni: {
        items: ['Google Pixel 7', 'Motorola Edge 40', 'Nokia G22', 'OnePlus 11'],
        priceRange: [1500, 12000],
        icon: TabletSmartphone,
      },
      'chytre-hodinky': {
        items: [
          'Apple Watch Series 8',
          'Garmin Forerunner 255',
          'Samsung Galaxy Watch 6',
          'Xiaomi Smart Band 8',
        ],
        priceRange: [600, 9000],
        icon: Watch,
      },
      prislusenstvi: {
        items: ['AirPods Pro 2', 'Powerbanka 20 000 mAh', 'Kryt MagSafe', 'Bezdrátová nabíječka'],
        priceRange: [200, 5000],
        icon: Headphones,
      },
    },
  },
  foto: {
    titleHooks: ['nízký počet cvaků', 'čistý senzor', 'komplet balení'],
    sentenceGroups: [
      GOODS_SENTENCES[0]!,
      [
        'Senzor čistý, bez vadných pixelů.',
        'Optika bez prachu a škrábanců.',
        'Dvě baterie a nabíječka.',
      ],
      GOODS_SENTENCES[2]!,
    ],
    subcategories: {
      fotoaparaty: {
        items: [
          'Sony A7 III tělo',
          'Canon EOS 250D',
          'Nikon Z6 II',
          'Fujifilm X-T30',
          'Canon EOS R6',
        ],
        priceRange: [5000, 45000],
        icon: Camera,
      },
      objektivy: {
        items: [
          'Sony FE 50 mm f/1.8',
          'Canon EF 24-105 f/4L',
          'Sigma 18-35 f/1.8 Art',
          'Nikon Z 24-70 f/4',
        ],
        priceRange: [2000, 25000],
        icon: Aperture,
      },
      video: {
        items: ['GoPro HERO 11', 'DJI Osmo Pocket 3', 'Dron DJI Mini 3', 'Kamera Sony FDR-AX43'],
        priceRange: [3000, 22000],
        icon: Camera,
      },
      prislusenstvi: {
        items: [
          'Stativ Manfrotto',
          'Blesk Godox V860',
          'Fotobatoh Lowepro',
          'Paměťová karta 128 GB',
        ],
        priceRange: [300, 6000],
        icon: Aperture,
      },
    },
  },
  elektro: {
    titleHooks: GOODS_HOOKS,
    sentenceGroups: GOODS_SENTENCES,
    subcategories: {
      televize: {
        items: [
          'Televize LG OLED 55"',
          'Samsung QLED 65"',
          'Sony Bravia 50" 4K',
          'Philips Ambilight 55"',
        ],
        priceRange: [2500, 28000],
        icon: Tv,
      },
      audio: {
        items: [
          'Soundbar Samsung',
          'Reproduktory JBL Charge 5',
          'AV receiver Yamaha',
          'Sluchátka Sony WH-1000XM4',
        ],
        priceRange: [800, 15000],
        icon: Speaker,
      },
      'domaci-spotrebice': {
        items: [
          'Pračka Bosch 8 kg',
          'Myčka Siemens 60 cm',
          'Chladnička Samsung',
          'Sušička Whirlpool',
        ],
        priceRange: [2000, 14000],
        icon: WashingMachine,
      },
      'herni-konzole': {
        items: [
          'PlayStation 5 s mechanikou',
          'Nintendo Switch OLED',
          'Xbox Series X',
          'Steam Deck 512 GB',
        ],
        priceRange: [3500, 13000],
        icon: Gamepad2,
      },
      ostatni: {
        items: [
          'Robotický vysavač Roborock',
          'Kávovar DeLonghi',
          'Čistička vzduchu Xiaomi',
          'Elektrická koloběžka',
        ],
        priceRange: [800, 12000],
        icon: Tv,
      },
    },
  },
  sport: {
    titleHooks: GOODS_HOOKS,
    sentenceGroups: GOODS_SENTENCES,
    subcategories: {
      kola: {
        items: [
          'Horské kolo Author 29"',
          'Silniční kolo Specialized',
          'Elektrokolo Crussis',
          'Dětské kolo 24"',
          'Gravel kolo Canyon',
        ],
        priceRange: [2000, 65000],
        icon: Bike,
      },
      fitness: {
        items: ['Rotoped Kettler', 'Běžecký pás', 'Činky 2× 20 kg', 'Posilovací lavice'],
        priceRange: [500, 18000],
        icon: Dumbbell,
      },
      'zimni-sporty': {
        items: [
          'Sjezdové lyže Atomic 170 cm',
          'Snowboard Burton 156',
          'Lyžařské boty Salomon',
          'Běžky Fischer s vázáním',
        ],
        priceRange: [800, 12000],
        icon: Snowflake,
      },
      'vodni-sporty': {
        items: ['Paddleboard nafukovací', 'Kajak Pelican', 'Neopren 4/3 mm', 'Šnorchlovací set'],
        priceRange: [500, 18000],
        icon: Fish,
      },
      turistika: {
        items: [
          'Stan Husky pro 3 osoby',
          'Spacák Deuter',
          'Batoh Osprey 45 l',
          'Trekové hole Leki',
        ],
        priceRange: [400, 8000],
        icon: Mountain,
      },
      ostatni: {
        items: [
          'Tenisová raketa Wilson',
          'Golfový bag s holemi',
          'Hokejky Bauer',
          'Fotbalové kopačky Nike',
        ],
        priceRange: [300, 12000],
        icon: Dumbbell,
      },
    },
  },
  hudba: {
    titleHooks: ['seřízeno', 'včetně pouzdra', 'skvělý zvuk'],
    sentenceGroups: [
      GOODS_SENTENCES[0]!,
      ['Nové struny, seřízená akce.', 'Včetně pouzdra a kabelu.', 'Hraní jen doma, bez koncertů.'],
      ['Vyzkoušení na místě vítáno.', 'Pošlu dobře zabalené nebo předám osobně.'],
    ],
    subcategories: {
      kytary: {
        items: [
          'Fender Stratocaster Player',
          'Akustická kytara Yamaha F310',
          'Gibson Les Paul Studio',
          'Klasická kytara Admira',
        ],
        priceRange: [1500, 35000],
        icon: Guitar,
      },
      klavesy: {
        items: [
          'Digitální piano Yamaha P-45',
          'Keyboard Casio',
          'Syntezátor Korg Minilogue',
          'Pianino Petrof',
        ],
        priceRange: [2000, 45000],
        icon: Piano,
      },
      bici: {
        items: [
          'Bicí souprava Tama',
          'Elektronické bicí Roland TD-07',
          'Činely Zildjian set',
          'Cajon Meinl',
        ],
        priceRange: [1500, 25000],
        icon: Drum,
      },
      aparatura: {
        items: ['Kombo Marshall', 'Mixpult Behringer', 'Aktivní reproboxy', 'Mikrofon Shure SM58'],
        priceRange: [1000, 20000],
        icon: Speaker,
      },
      'cd-lp': {
        items: [
          'Sbírka LP desek rock',
          'CD kolekce Queen',
          'Gramofon Technics',
          'Vinyly jazz 20 ks',
        ],
        priceRange: [200, 9000],
        icon: Disc3,
      },
    },
  },
  vstupenky: {
    titleHooks: ['cena jako nákupní', 'přepis zajistím', 'nemohu jet'],
    sentenceGroups: [
      [
        'Prodávám za nákupní cenu.',
        'Nemohu se akce zúčastnit.',
        'Kupováno přes oficiálního prodejce.',
      ],
      ['Přepis vstupenky přes oficiální systém pořadatele.', 'Vstupenky jsou elektronické.'],
      ['Doporučuji bezpečnou platbu přes úschovu.', 'Předání osobně v Praze možné.'],
    ],
    subcategories: {
      koncerty: {
        items: [
          '2× vstupenka na stání – koncert O2 arena',
          'Vstupenka sezení, kategorie A',
          'VIP vstupenka na koncert',
        ],
        priceRange: [800, 9000],
        icon: Ticket,
      },
      divadlo: {
        items: ['Vstupenky do Národního divadla', 'Muzikál – 2 místa v přízemí', 'Balet – lóže'],
        priceRange: [400, 4000],
        icon: Theater,
      },
      sport: {
        items: ['Hokej – extraliga, 2 místa', 'Fotbal – derby', 'Permanentka na basketbal'],
        priceRange: [300, 6000],
        icon: Ticket,
      },
      festivaly: {
        items: [
          'Celofestivalová vstupenka',
          'Vstupenka na festival + kemp',
          'Jednodenní vstupenka',
        ],
        priceRange: [800, 6000],
        icon: Tent,
      },
    },
  },
  knihy: {
    titleHooks: ['jako nové', 'komplet série', 'pevná vazba'],
    sentenceGroups: [
      ['Čteno jednou, bez poškození.', 'Stav velmi dobrý.', 'Drobné stopy čtení.'],
      ['Nekuřácká domácnost.', 'Prodávám jako celek.'],
      ['Pošlu Zásilkovnou.', 'Osobní odběr nebo poštou.'],
    ],
    subcategories: {
      beletrie: {
        items: [
          'Harry Potter 1–7',
          'Karel Čapek – sebrané spisy',
          'Balík detektivek',
          'Pán prstenů trilogie',
        ],
        priceRange: [100, 2500],
        icon: BookOpen,
      },
      detske: {
        items: [
          'Dětské knihy – balík',
          'Encyklopedie pro děti',
          'Pohádky Josefa Lady',
          'Knížky Kouzelná školka',
        ],
        priceRange: [50, 1200],
        icon: Book,
      },
      naucne: {
        items: ['Atlas světa', 'Kuchařky – sada', 'Knihy o investování', 'Encyklopedie Universum'],
        priceRange: [100, 2000],
        icon: BookOpen,
      },
      ucebnice: {
        items: [
          'Učebnice matematiky pro SŠ',
          'Učebnice angličtiny Maturita',
          'Skripta ekonomie',
          'Učebnice fyziky',
        ],
        priceRange: [50, 900],
        icon: GraduationCap,
      },
      komiksy: {
        items: ['Komiksy Marvel', 'Časopis ABC ročníky', 'Manga Naruto 1–10', 'Čtyřlístek sbírka'],
        priceRange: [50, 3000],
        icon: Newspaper,
      },
    },
  },
  nabytek: {
    titleHooks: GOODS_HOOKS,
    sentenceGroups: [
      GOODS_SENTENCES[0]!,
      [
        'Nekuřácká domácnost bez zvířat.',
        'Rozměry pošlu ve zprávě.',
        'Rozložené připravené k odvozu.',
      ],
      ['Nutný vlastní odvoz.', 'Pomohu s nakládáním.', 'Možnost dovozu po domluvě.'],
    ],
    subcategories: {
      'sedaci-soupravy': {
        items: ['Rohová sedačka rozkládací', 'Sedačka 3+1+1', 'Křeslo ušák', 'Pohovka IKEA Kivik'],
        priceRange: [800, 18000],
        icon: Sofa,
      },
      postele: {
        items: [
          'Manželská postel 180×200',
          'Matrace 90×200',
          'Postel s úložným prostorem',
          'Boxspring postel',
        ],
        priceRange: [500, 15000],
        icon: Bed,
      },
      skrine: {
        items: ['Šatní skříň posuvná', 'Komoda IKEA Malm', 'Knihovna dub', 'Botník s lavicí'],
        priceRange: [300, 9000],
        icon: Archive,
      },
      'stoly-zidle': {
        items: [
          'Jídelní stůl dub + 4 židle',
          'Konferenční stolek',
          'Kancelářská židle Herman Miller',
          'Barové židle 2 ks',
        ],
        priceRange: [300, 14000],
        icon: Table,
      },
      ostatni: {
        items: ['Zrcadlo v rámu', 'TV stolek', 'Věšáková stěna', 'Regál do dílny'],
        priceRange: [200, 4000],
        icon: Armchair,
      },
    },
  },
  obleceni: {
    titleHooks: ['originál', 'nenošené', 's visačkou'],
    sentenceGroups: [
      ['Nošené párkrát, jako nové.', 'Originál, s visačkou.', 'Bez poškození a skvrn.'],
      ['Míry pošlu ve zprávě.', 'Nekuřácká domácnost.'],
      ['Pošlu Zásilkovnou.', 'Osobní předání možné.'],
    ],
    subcategories: {
      damske: {
        items: [
          'Zimní kabát Zara vel. M',
          'Šaty na ples vel. 38',
          'Džíny Levi’s vel. 28',
          'Kožená bunda vel. S',
        ],
        priceRange: [150, 4000],
        icon: Shirt,
      },
      panske: {
        items: [
          'Bunda The North Face vel. L',
          'Oblek Hugo Boss 52',
          'Mikina Nike vel. XL',
          'Košile Tommy Hilfiger',
        ],
        priceRange: [200, 6000],
        icon: Shirt,
      },
      obuv: {
        items: [
          'Nike Air Max 90 vel. 42',
          'Adidas Ultraboost vel. 44',
          'Kotníkové boty Timberland',
          'Lodičky vel. 38',
        ],
        priceRange: [300, 3500],
        icon: Footprints,
      },
      doplnky: {
        items: [
          'Hodinky Casio G-Shock',
          'Kabelka Michael Kors',
          'Zlatý řetízek 14 kt',
          'Sluneční brýle Ray-Ban',
        ],
        priceRange: [300, 15000],
        icon: Gem,
      },
    },
  },
  sluzby: {
    titleHooks: ['rychle a spolehlivě', 'Praha a okolí', 'kvalitně'],
    sentenceGroups: [
      [
        'Mám dlouholeté zkušenosti a reference.',
        'Pracuji rychle a pečlivě.',
        'Živnostník, fakturuji.',
      ],
      ['Cena podle rozsahu, kalkulace zdarma.', 'Termín po domluvě i o víkendu.'],
      ['Ozvěte se přes zprávy SafeBazos.', 'Více informací telefonicky.'],
    ],
    subcategories: {
      remeslnici: {
        items: [
          'Malířské a natěračské práce',
          'Instalatér – opravy a montáže',
          'Obklady a dlažby',
          'Elektroinstalace',
        ],
        priceRange: null,
        icon: Wrench,
      },
      doucovani: {
        items: [
          'Doučování matematiky',
          'Angličtina – konverzace',
          'Příprava na přijímačky',
          'Doučování chemie',
        ],
        priceRange: null,
        icon: GraduationCap,
      },
      stehovani: {
        items: ['Stěhování bytů a firem', 'Odvoz nábytku a vyklízení', 'Autodoprava dodávkou'],
        priceRange: null,
        icon: Truck,
      },
      ostatni: {
        items: ['Úklid domácností', 'Hlídání dětí', 'Venčení psů', 'Sekání trávy'],
        priceRange: null,
        icon: HandCoins,
      },
    },
  },
  ostatni: {
    titleHooks: ['sbírka', 'vzácné', 'rychlé jednání'],
    sentenceGroups: [
      ['Stav odpovídá stáří.', 'Pěkně zachovalé.', 'Ze sbírky po dědovi.'],
      ['Prodávám jako celek i jednotlivě.', 'Více fotek pošlu ve zprávě.'],
      ['Osobní předání nebo pošlu pojištěně.', 'Při rychlém jednání sleva.'],
    ],
    subcategories: {
      sberatelstvi: {
        items: [
          'Sbírka mincí ČSSR',
          'Poštovní známky album',
          'Pohlednice před rokem 1950',
          'Odznaky a vyznamenání',
        ],
        priceRange: [200, 25000],
        icon: Coins,
      },
      starozitnosti: {
        items: [
          'Starožitná komoda',
          'Porcelánová souprava',
          'Nástěnné hodiny',
          'Obraz v rámu olej',
        ],
        priceRange: [500, 35000],
        icon: Crown,
      },
      ostatni: {
        items: ['Kufr na kolečkách', 'Deštníky – balík', 'Dárkový koš', 'Svíčky ručně dělané'],
        priceRange: [100, 3000],
        icon: Package,
      },
    },
  },
}
