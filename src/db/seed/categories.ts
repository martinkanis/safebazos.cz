export interface CategorySeed {
  slug: string
  name: string
  subcategories: Array<[slug: string, name: string]>
}

export const CATEGORY_SEEDS: CategorySeed[] = [
  {
    slug: 'zvirata',
    name: 'Zvířata',
    subcategories: [
      ['psi', 'Psi'],
      ['kocky', 'Kočky'],
      ['ptactvo', 'Ptactvo'],
      ['hlodavci', 'Hlodavci'],
      ['akvaristika', 'Akvaristika'],
      ['teraristika', 'Teraristika'],
      ['kone', 'Koně'],
      ['chovatelske-potreby', 'Chovatelské potřeby'],
      ['ostatni', 'Ostatní zvířata'],
    ],
  },
  {
    slug: 'deti',
    name: 'Děti',
    subcategories: [
      ['kocarky', 'Kočárky'],
      ['autosedacky', 'Autosedačky'],
      ['obleceni', 'Dětské oblečení'],
      ['obuv', 'Dětská obuv'],
      ['hracky', 'Hračky'],
      ['nabytek', 'Dětský nábytek'],
      ['ostatni', 'Ostatní pro děti'],
    ],
  },
  {
    slug: 'reality',
    name: 'Reality',
    subcategories: [
      ['byty', 'Byty'],
      ['domy', 'Domy'],
      ['pozemky', 'Pozemky'],
      ['chaty-chalupy', 'Chaty a chalupy'],
      ['garaze', 'Garáže'],
      ['komercni', 'Komerční prostory'],
    ],
  },
  {
    slug: 'prace',
    name: 'Práce',
    subcategories: [
      ['nabidka-prace', 'Nabídka práce'],
      ['hledam-praci', 'Hledám práci'],
      ['brigady', 'Brigády'],
    ],
  },
  {
    slug: 'auto',
    name: 'Auto',
    subcategories: [
      ['skoda', 'Škoda'],
      ['volkswagen', 'Volkswagen'],
      ['ford', 'Ford'],
      ['renault', 'Renault'],
      ['peugeot', 'Peugeot'],
      ['bmw', 'BMW'],
      ['audi', 'Audi'],
      ['mercedes-benz', 'Mercedes-Benz'],
      ['toyota', 'Toyota'],
      ['hyundai-kia', 'Hyundai a Kia'],
      ['ostatni-znacky', 'Ostatní značky'],
      ['nahradni-dily', 'Náhradní díly'],
      ['pneumatiky-kola', 'Pneumatiky a kola'],
    ],
  },
  {
    slug: 'motorky',
    name: 'Motorky',
    subcategories: [
      ['motocykly', 'Motocykly'],
      ['skutry', 'Skútry'],
      ['ctyrkolky', 'Čtyřkolky'],
      ['dily', 'Moto díly'],
      ['obleceni-helmy', 'Oblečení a helmy'],
    ],
  },
  {
    slug: 'stroje',
    name: 'Stroje',
    subcategories: [
      ['zemedelske', 'Zemědělské stroje'],
      ['stavebni', 'Stavební stroje'],
      ['naradi', 'Nářadí'],
      ['ostatni', 'Ostatní stroje'],
    ],
  },
  {
    slug: 'dum-a-zahrada',
    name: 'Dům a zahrada',
    subcategories: [
      ['zahrada', 'Zahrada'],
      ['stavebni-material', 'Stavební materiál'],
      ['kuchyne', 'Kuchyně'],
      ['koupelna', 'Koupelna'],
      ['topeni', 'Topení'],
      ['ostatni', 'Ostatní pro dům'],
    ],
  },
  {
    slug: 'pc',
    name: 'PC',
    subcategories: [
      ['notebooky', 'Notebooky'],
      ['pocitace', 'Počítače'],
      ['monitory', 'Monitory'],
      ['komponenty', 'Komponenty'],
      ['tiskarny', 'Tiskárny'],
      ['prislusenstvi', 'Příslušenství'],
    ],
  },
  {
    slug: 'mobily',
    name: 'Mobily',
    subcategories: [
      ['apple', 'Apple iPhone'],
      ['samsung', 'Samsung'],
      ['xiaomi', 'Xiaomi'],
      ['ostatni', 'Ostatní telefony'],
      ['chytre-hodinky', 'Chytré hodinky'],
      ['prislusenstvi', 'Příslušenství'],
    ],
  },
  {
    slug: 'foto',
    name: 'Foto',
    subcategories: [
      ['fotoaparaty', 'Fotoaparáty'],
      ['objektivy', 'Objektivy'],
      ['video', 'Video a kamery'],
      ['prislusenstvi', 'Příslušenství'],
    ],
  },
  {
    slug: 'elektro',
    name: 'Elektro',
    subcategories: [
      ['televize', 'Televize'],
      ['audio', 'Audio'],
      ['domaci-spotrebice', 'Domácí spotřebiče'],
      ['herni-konzole', 'Herní konzole'],
      ['ostatni', 'Ostatní elektro'],
    ],
  },
  {
    slug: 'sport',
    name: 'Sport',
    subcategories: [
      ['kola', 'Jízdní kola'],
      ['fitness', 'Fitness'],
      ['zimni-sporty', 'Zimní sporty'],
      ['vodni-sporty', 'Vodní sporty'],
      ['turistika', 'Turistika a kempování'],
      ['ostatni', 'Ostatní sporty'],
    ],
  },
  {
    slug: 'hudba',
    name: 'Hudba',
    subcategories: [
      ['kytary', 'Kytary'],
      ['klavesy', 'Klávesy a piana'],
      ['bici', 'Bicí'],
      ['aparatura', 'Aparatura'],
      ['cd-lp', 'CD a LP'],
    ],
  },
  {
    slug: 'vstupenky',
    name: 'Vstupenky',
    subcategories: [
      ['koncerty', 'Koncerty'],
      ['divadlo', 'Divadlo'],
      ['sport', 'Sportovní akce'],
      ['festivaly', 'Festivaly'],
    ],
  },
  {
    slug: 'knihy',
    name: 'Knihy',
    subcategories: [
      ['beletrie', 'Beletrie'],
      ['detske', 'Dětské knihy'],
      ['naucne', 'Naučné'],
      ['ucebnice', 'Učebnice'],
      ['komiksy', 'Komiksy a časopisy'],
    ],
  },
  {
    slug: 'nabytek',
    name: 'Nábytek',
    subcategories: [
      ['sedaci-soupravy', 'Sedací soupravy'],
      ['postele', 'Postele a matrace'],
      ['skrine', 'Skříně a komody'],
      ['stoly-zidle', 'Stoly a židle'],
      ['ostatni', 'Ostatní nábytek'],
    ],
  },
  {
    slug: 'obleceni',
    name: 'Oblečení',
    subcategories: [
      ['damske', 'Dámské'],
      ['panske', 'Pánské'],
      ['obuv', 'Obuv'],
      ['doplnky', 'Doplňky, hodinky, šperky'],
    ],
  },
  {
    slug: 'sluzby',
    name: 'Služby',
    subcategories: [
      ['remeslnici', 'Řemeslníci'],
      ['doucovani', 'Doučování'],
      ['stehovani', 'Stěhování a doprava'],
      ['ostatni', 'Ostatní služby'],
    ],
  },
  {
    slug: 'ostatni',
    name: 'Ostatní',
    subcategories: [
      ['sberatelstvi', 'Sběratelství'],
      ['starozitnosti', 'Starožitnosti'],
      ['ostatni', 'Různé'],
    ],
  },
]
