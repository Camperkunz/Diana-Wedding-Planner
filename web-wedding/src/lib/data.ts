// ──────────────────────────────────────────────
// Typed mock data layer — structured for future
// Sanity CMS integration (swap returns for async GROQ calls)
// ──────────────────────────────────────────────

export type SiteSettings = {
  name: string;
  tagline: string;
  monogram: string;
  email: string;
  phone: string;
  location: string;
  serviceArea: string;
  instagramUrl: string;
  pinterestUrl: string;
};

export type Service = {
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  includes: string[];
  image: string;
  imageAlt: string;
  startingPrice?: string;
  featured: boolean;
};

export type Album = {
  slug: string;
  title: string;
  category: string;
  coverImage: string;
  coverImageAlt: string;
  story: string;
  date: string;
  venue: string;
  location: string;
  photos: AlbumPhoto[];
  featured: boolean;
};

export type AlbumPhoto = {
  src: string;
  alt: string;
  caption?: string;
};

export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  weddingType: string;
  placeholder: boolean;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: string;
};

export type VideoItem = {
  id: string;
  title: string;
  description: string;
  embedUrl: string;
  thumbnail: string;
  thumbnailAlt: string;
  platform: 'vimeo' | 'youtube';
};

export type Stat = {
  value: string;
  label: string;
};

export type ProcessStep = {
  number: string;
  title: string;
  description: string;
};

// ── Site Settings ──────────────────────────────

export function getSiteSettings(): SiteSettings {
  return {
    name: 'Diana Voloshina',
    tagline: 'Wedding Planner · Ottawa',
    monogram: 'D',
    email: 'hello@dianaweddings.ca',
    phone: '(613) 555-0142',
    location: 'Ottawa, Ontario',
    serviceArea: 'Ottawa · Gatineau · Eastern Ontario',
    instagramUrl: 'https://instagram.com',
    pinterestUrl: 'https://pinterest.com',
  };
}

// ── Stats ──────────────────────────────────────

export function getStats(): Stat[] {
  return [
    { value: '120+', label: 'Weddings Planned' },
    { value: '9', label: 'Years of Experience' },
    { value: '40+', label: 'Venue Partnerships' },
    { value: '100%', label: 'Personally Involved' },
  ];
}

// ── Services ───────────────────────────────────

export function getServices(): Service[] {
  return [
    {
      slug: 'full-service-planning',
      name: 'Full-Service Planning',
      shortDescription:
        'From the first Pinterest board to the last toast — I handle every detail so you can be fully present on your day.',
      fullDescription:
        'This is the most comprehensive offering. We start together 12–18 months out and I walk every step with you — venue scouting, vendor curation, budget management, design direction, timeline creation, and day-of coordination. You get my personal cell phone, weekly check-ins, and a planner who knows your wedding inside and out by the time the doors open.',
      includes: [
        'Unlimited consultations (phone, video, in-person)',
        'Venue scouting & site visits',
        'Vendor sourcing & contract negotiation',
        'Full design & styling direction',
        'Detailed budget tracking',
        'Custom day-of timeline',
        'Complete day-of coordination with assistant',
        'Rehearsal direction',
      ],
      image:
        'https://images.pexels.com/photos/16120230/pexels-photo-16120230.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      imageAlt: 'Elegant wedding reception with floral arrangements and candlelit table settings',
      startingPrice: 'From $6,500',
      featured: true,
    },
    {
      slug: 'partial-planning',
      name: 'Partial Planning',
      shortDescription:
        'You have the vision and some pieces in place — I fill the gaps, tighten the timeline, and make sure nothing falls through.',
      fullDescription:
        'For couples who are 4–8 months out and have already booked a venue and some vendors but need professional help pulling it all together. I review what you have, identify gaps, recommend trusted vendors for remaining categories, build your production timeline, and coordinate the day itself.',
      includes: [
        'Two planning sessions per month',
        'Vendor recommendations for remaining categories',
        'Contract review & negotiation support',
        'Day-of timeline creation',
        'Day-of coordination with assistant',
        'Rehearsal direction',
      ],
      image:
        'https://images.pexels.com/photos/29040917/pexels-photo-29040917.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      imageAlt: 'Wedding table centerpiece with white flowers and candles',
      startingPrice: 'From $3,200',
      featured: true,
    },
    {
      slug: 'day-of-coordination',
      name: 'Day-Of Coordination',
      shortDescription:
        'You planned it all — now let someone else run it. I take over the logistics so you and your family can enjoy the day.',
      fullDescription:
        'For couples who have planned everything themselves and want a professional to execute. I step in 6–8 weeks before the wedding, review all your contracts and plans, build the master timeline, confirm all vendors, and run the rehearsal and wedding day so you can be a guest at your own wedding.',
      includes: [
        '6-week pre-event consultation',
        'Vendor confirmation & final walkthrough',
        'Master timeline creation',
        'Rehearsal direction',
        'Full day-of coordination with assistant',
        'Emergency kit & problem-solving on-site',
      ],
      image:
        'https://images.pexels.com/photos/31217382/pexels-photo-31217382.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      imageAlt: 'Outdoor wedding ceremony with floral arch and white chairs',
      startingPrice: 'From $1,800',
      featured: true,
    },
  ];
}

export function getService(slug: string): Service | undefined {
  return getServices().find((s) => s.slug === slug);
}

// ── Albums / Portfolio ─────────────────────────

export function getAlbums(): Album[] {
  return [
    {
      slug: 'marguerite-and-james',
      title: 'Marguerite & James',
      category: 'Garden Wedding',
      coverImage:
        'https://images.pexels.com/photos/16743493/pexels-photo-16743493.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      coverImageAlt: 'Outdoor wedding ceremony with white draped canopy and floral arrangements',
      story:
        'A late-summer garden wedding at a historic estate in the Gatineau Hills. Marguerite wanted the feeling of an intimate dinner party that happened to include 80 of their closest people. We built the entire design around the estate\'s English garden — soft blush, sage, and cream florals, long family-style tables, and string lights overhead.',
      date: 'September 2025',
      venue: 'Wakefield Mill',
      location: 'Wakefield, Quebec',
      featured: true,
      photos: [
        { src: 'https://images.pexels.com/photos/16743493/pexels-photo-16743493.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Outdoor ceremony setup with white canopy and florals', caption: 'The ceremony space, set beneath the estate\'s old oak' },
        { src: 'https://images.pexels.com/photos/16120230/pexels-photo-16120230.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Reception tables with floral arrangements and candles', caption: 'Long family-style tables under string lights' },
        { src: 'https://images.pexels.com/photos/12510635/pexels-photo-12510635.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Bride holding pink rose bouquet', caption: 'Marguerite\'s bouquet — garden roses and eucalyptus' },
        { src: 'https://images.pexels.com/photos/5824565/pexels-photo-5824565.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Bride and groom kissing at outdoor ceremony', caption: 'The first kiss as a married couple' },
        { src: 'https://images.pexels.com/photos/1128782/pexels-photo-1128782.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Outdoor table decor with golden candlesticks and flowers', caption: 'Tablescape detail — brass candlesticks and late-summer blooms' },
        { src: 'https://images.pexels.com/photos/7777905/pexels-photo-7777905.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Bride and groom in romantic embrace', caption: 'Golden hour portraits in the garden' },
      ],
    },
    {
      slug: 'sofia-and-omar',
      title: 'Sofia & Omar',
      category: 'Ballroom Reception',
      coverImage:
        'https://images.pexels.com/photos/30311728/pexels-photo-30311728.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      coverImageAlt: 'Luxurious ballroom with chandeliers for a grand evening wedding',
      story:
        'A 200-guest evening reception at the Château Laurier. Sofia and Omar wanted something that felt grand but never stiff — we balanced the ballroom\'s formality with warm amber lighting, lush florals in deep cream and burgundy, and a live band that kept the dance floor full until 1am.',
      date: 'November 2025',
      venue: 'Fairmont Château Laurier',
      location: 'Ottawa, Ontario',
      featured: true,
      photos: [
        { src: 'https://images.pexels.com/photos/30311728/pexels-photo-30311728.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Grand ballroom with chandeliers', caption: 'The ballroom before guests arrived' },
        { src: 'https://images.pexels.com/photos/17023012/pexels-photo-17023012.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Event hall with floral decorations and ambient lighting', caption: 'Floral installations framing the dance floor' },
        { src: 'https://images.pexels.com/photos/33104578/pexels-photo-33104578.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Table setting with pink and white roses', caption: 'Guest tables with layered rose centerpieces' },
        { src: 'https://images.pexels.com/photos/18195782/pexels-photo-18195782.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Bride and groom celebrating at their wedding', caption: 'Sofia and Omar\'s first dance' },
        { src: 'https://images.pexels.com/photos/16120136/pexels-photo-16120136.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Table setting with roses and crystal glassware', caption: 'Crystal and candlelight — the detail layer' },
        { src: 'https://images.pexels.com/photos/29237413/pexels-photo-29237413.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Bride and groom kissing with guests applauding under string lights', caption: 'The send-off' },
      ],
    },
    {
      slug: 'elise-and-henri',
      title: 'Élise & Henri',
      category: 'Rustic Barn Wedding',
      coverImage:
        'https://images.pexels.com/photos/31217382/pexels-photo-31217382.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      coverImageAlt: 'Outdoor wedding with floral arch and white chairs with yellow sashes',
      story:
        'A warm September barn wedding in the Ottawa Valley. Élise and Henri wanted something that felt like a big family harvest dinner — we leaned into natural textures, warm amber tones, and locally-sourced florals. The bride got ready in the farmhouse while guests gathered in the orchard.',
      date: 'September 2024',
      venue: 'Cedar Hill Barn',
      location: 'Ottawa Valley, Ontario',
      featured: true,
      photos: [
        { src: 'https://images.pexels.com/photos/31217382/pexels-photo-31217382.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Ceremony arch with yellow sash chairs', caption: 'The orchard ceremony space' },
        { src: 'https://images.pexels.com/photos/34362509/pexels-photo-34362509.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Bride getting ready by a window', caption: 'Morning preparations in the farmhouse' },
        { src: 'https://images.pexels.com/photos/10970554/pexels-photo-10970554.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Floral centerpiece with candles on wedding table', caption: 'Long tables with wildflower runners' },
        { src: 'https://images.pexels.com/photos/20592006/pexels-photo-20592006.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Bride and groom exchanging vows outdoors', caption: 'Vows under the apple trees' },
        { src: 'https://images.pexels.com/photos/8251571/pexels-photo-8251571.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Elegant table setting with floral centerpieces', caption: 'Table numbers hand-lettered by the bride\'s sister' },
        { src: 'https://images.pexels.com/photos/37972930/pexels-photo-37972930.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Bride and groom posing happily outdoors', caption: 'Sunset portraits in the valley' },
      ],
    },
    {
      slug: 'anya-and-marcus',
      title: 'Anya & Marcus',
      category: 'Intimate Elopement',
      coverImage:
        'https://images.pexels.com/photos/28613084/pexels-photo-28613084.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      coverImageAlt: 'Outdoor wedding venue with elegant decorations and lake view',
      story:
        'An intimate 30-person celebration on the shore of a private lake. Anya and Marcus wanted their day to feel like a long, slow dinner with the people who mattered most. We designed a single long table at the water\'s edge, with a menu built around local seasonal ingredients and a playlist that ran from cocktail hour to midnight.',
      date: 'August 2024',
      venue: 'Private Lake Estate',
      location: 'Muskoka, Ontario',
      featured: true,
      photos: [
        { src: 'https://images.pexels.com/photos/28613084/pexels-photo-28613084.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Lakeside wedding venue with elegant setup', caption: 'The long table at the water\'s edge' },
        { src: 'https://images.pexels.com/photos/28815666/pexels-photo-28815666.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Bride and groom walking past elegantly set table', caption: 'Anya and Marcus seeing the table for the first time' },
        { src: 'https://images.pexels.com/photos/21928800/pexels-photo-21928800.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Bride holding white rose bouquet on satin bed', caption: 'The bouquet — simple white roses' },
        { src: 'https://images.pexels.com/photos/9115347/pexels-photo-9115347.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Close-up of bride and groom holding arms', caption: 'Quiet moment before guests arrived' },
        { src: 'https://images.pexels.com/photos/5572569/pexels-photo-5572569.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Banquet table with glassware and flowers in sunlight', caption: 'The table as the sun dropped lower' },
        { src: 'https://images.pexels.com/photos/19641/pexels-photo.jpg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Couple embracing outdoors on their wedding day', caption: 'Last light over the lake' },
      ],
    },
    {
      slug: 'claire-and-david',
      title: 'Claire & David',
      category: 'Modern Hotel Wedding',
      coverImage:
        'https://images.pexels.com/photos/17315417/pexels-photo-17315417.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      coverImageAlt: 'Indoor wedding venue with aisle, chairs and floral arrangements',
      story:
        'A sleek, modern celebration at the Ottawa Art Gallery. Claire and David are both architects and wanted clean lines, intentional negative space, and a palette of white, charcoal, and a single accent of terracotta. The result was graphic, warm, and unmistakably theirs.',
      date: 'May 2025',
      venue: 'Ottawa Art Gallery',
      location: 'Ottawa, Ontario',
      featured: false,
      photos: [
        { src: 'https://images.pexels.com/photos/17315417/pexels-photo-17315417.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Indoor ceremony with aisle and floral arrangements', caption: 'The ceremony installation' },
        { src: 'https://images.pexels.com/photos/4717526/pexels-photo-4717526.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Banquet hall with elegantly set tables', caption: 'Reception layout — clean and architectural' },
        { src: 'https://images.pexels.com/photos/5791588/pexels-photo-5791588.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Bride in lace dress holding bouquet', caption: 'Claire\'s minimalist bouquet' },
        { src: 'https://images.pexels.com/photos/34489061/pexels-photo-34489061.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Bride and groom sharing a joyful moment outdoors', caption: 'Portraits on the gallery rooftop' },
        { src: 'https://images.pexels.com/photos/17001756/pexels-photo-17001756.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Floral centerpiece on elegantly set table', caption: 'Single-variety centerpieces — one stem, repeated' },
        { src: 'https://images.pexels.com/photos/32167185/pexels-photo-32167185.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Wedding couple smiling during their special day', caption: 'The first dance, framed by the gallery windows' },
      ],
    },
    {
      slug: 'priya-and-alex',
      title: 'Priya & Alex',
      category: 'Cultural Fusion Wedding',
      coverImage:
        'https://images.pexels.com/photos/19024679/pexels-photo-19024679.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      coverImageAlt: 'Wedding ceremony setup with white drapery, floral arrangements, and chandelier',
      story:
        'A three-day fusion celebration blending Priya\'s South Asian traditions with Alex\'s French-Canadian heritage. We coordinated a mehndi night, a morning ceremony, and an evening reception — each with its own design language, vendor team, and timeline. It was the kind of weekend that only works when every single moving part is accounted for months in advance.',
      date: 'June 2025',
      venue: 'Multiple venues',
      location: 'Ottawa & Gatineau',
      featured: false,
      photos: [
        { src: 'https://images.pexels.com/photos/19024679/pexels-photo-19024679.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Ceremony setup with white drapery and chandelier', caption: 'The ceremony mandap' },
        { src: 'https://images.pexels.com/photos/12689014/pexels-photo-12689014.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Indoor event with floral arrangements and chandeliers', caption: 'Reception hall — the third event in three days' },
        { src: 'https://images.pexels.com/photos/18430840/pexels-photo-18430840.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Bridal bouquet with red and orange flowers', caption: 'The bridal bouquet — vibrant marigold and rose' },
        { src: 'https://images.pexels.com/photos/7777910/pexels-photo-7777910.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Joyful bride and groom on their wedding day', caption: 'The baraat procession' },
        { src: 'https://images.pexels.com/photos/16120244/pexels-photo-16120244.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Reception tables with floral centerpieces and candles', caption: 'Tablescape for the evening reception' },
        { src: 'https://images.pexels.com/photos/4493695/pexels-photo-4493695.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', alt: 'Groom embracing bride at night in lamplight', caption: 'The final night' },
      ],
    },
  ];
}

export function getFeaturedAlbums(): Album[] {
  return getAlbums().filter((a) => a.featured);
}

export function getAlbum(slug: string): Album | undefined {
  return getAlbums().find((a) => a.slug === slug);
}

// ── Testimonials ───────────────────────────────

export function getTestimonials(): Testimonial[] {
  return [
    {
      id: 't1',
      quote:
        'Diana didn\'t just plan our wedding — she understood what we wanted before we could articulate it. On the day, we didn\'t think about logistics once. We just showed up and got married.',
      author: 'Marguerite',
      weddingType: 'Garden Wedding',
      placeholder: true,
    },
    {
      id: 't2',
      quote:
        'We interviewed four planners. Diana was the only one who asked about us, not about our budget. That told us everything. Nine months later she ran a 200-person reception so smoothly that my mother actually relaxed.',
      author: 'Sofia',
      weddingType: 'Ballroom Reception',
      placeholder: true,
    },
    {
      id: 't3',
      quote:
        'I\'m a planner by nature and was skeptical about hiring someone. Diana didn\'t take over — she made my plan better, caught things I\'d missed, and was the calmest person in the room all day.',
      author: 'Claire',
      weddingType: 'Modern Hotel Wedding',
      placeholder: true,
    },
  ];
}

// ── FAQ ────────────────────────────────────────

export function getFaqItems(): FaqItem[] {
  return [
    {
      id: 'f1',
      category: 'Working Together',
      question: 'How many weddings do you take per year?',
      answer:
        'I intentionally limit my calendar to 12–15 weddings per year so that every couple gets the level of personal attention they deserve. Once we begin working together, you\'re not handed off to an associate — you get me, from our first meeting to the last dance.',
    },
    {
      id: 'f2',
      category: 'Working Together',
      question: 'What makes you different from a wedding planning agency?',
      answer:
        'I am not an agency. I don\'t have a team of junior coordinators who learn on your wedding. Every plan I build, every vendor I call, every timeline I write — that\'s me, personally. If that\'s the kind of relationship you want with your planner, we\'ll work well together.',
    },
    {
      id: 'f3',
      category: 'Working Together',
      question: 'Do you only work in Ottawa?',
      answer:
        'I\'m based in Ottawa and most of my weddings are in the Ottawa–Gatineau region and Eastern Ontario. I do take on a limited number of weddings elsewhere in Ontario and Quebec — get in touch and we can talk about the specifics.',
    },
    {
      id: 'f4',
      category: 'Services & Pricing',
      question: 'What service levels do you offer?',
      answer:
        'Three: Full-Service Planning (start to finish, 12–18 months out), Partial Planning (you\'ve started but need help pulling it together, 4–8 months out), and Day-Of Coordination (you\'ve planned it and want a professional to run the day). You can see the details on the Services page.',
    },
    {
      id: 'f5',
      category: 'Services & Pricing',
      question: 'How much do your services cost?',
      answer:
        'Pricing depends on the scope of your wedding, the timeline, and the service level you choose. Full-service planning starts at $6,500, partial planning at $3,200, and day-of coordination at $1,800. After our initial consultation I\'ll give you a detailed, transparent quote — no surprises.',
    },
    {
      id: 'f6',
      category: 'Services & Pricing',
      question: 'Do you work with specific vendors?',
      answer:
        'I have a network of vendors I trust deeply — florists, photographers, caterers, calligraphers, and more — but I never force anyone on you. If you have vendors you love, I\'m happy to work with them. My job is to build the right team for your wedding, not to check boxes on a preferred list.',
    },
    {
      id: 'f7',
      category: 'The Process',
      question: 'When should we reach out?',
      answer:
        'Ideally 12–18 months before your wedding for full-service planning, though I\'ve taken on shorter timelines when the fit is right. For partial planning or day-of coordination, 4–8 months out is ideal. That said — if you\'re getting married next month and feeling overwhelmed, still reach out. If I can\'t help, I\'ll point you to someone who can.',
    },
    {
      id: 'f8',
      category: 'The Process',
      question: 'What happens after we first get in touch?',
      answer:
        'I\'ll reply within two business days to set up a free, no-pressure consultation — usually a video call or a coffee if you\'re in Ottawa. We talk about your vision, your timeline, and what you\'re looking for. If it feels right for both of us, I send a proposal. If it doesn\'t, I\'ll tell you honestly.',
    },
  ];
}

// ── Videos / Backstage ─────────────────────────

export function getVideos(): VideoItem[] {
  return [
    {
      id: 'v1',
      title: 'Marguerite & James — Behind the Day',
      description: 'A short film following the morning of the wedding, from the first florals to the first dance.',
      embedUrl: 'https://www.youtube.com/embed/ScMzIvxBSi4',
      thumbnail: 'https://images.pexels.com/photos/16743493/pexels-photo-16743493.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      thumbnailAlt: 'Outdoor wedding ceremony setup with floral arrangements',
      platform: 'youtube',
    },
    {
      id: 'v2',
      title: 'Sofia & Omar — The Ballroom',
      description: 'A time-lapse of the ballroom transformation, from empty hall to the final candlelit reception.',
      embedUrl: 'https://www.youtube.com/embed/ScMzIvxBSi4',
      thumbnail: 'https://images.pexels.com/photos/30311728/pexels-photo-30311728.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      thumbnailAlt: 'Grand ballroom with chandeliers set for a wedding',
      platform: 'youtube',
    },
    {
      id: 'v3',
      title: 'Élise & Henri — A Day in the Valley',
      description: 'The full story of a rustic barn wedding, from the farmhouse morning to the orchard send-off.',
      embedUrl: 'https://www.youtube.com/embed/ScMzIvxBSi4',
      thumbnail: 'https://images.pexels.com/photos/31217382/pexels-photo-31217382.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      thumbnailAlt: 'Outdoor wedding with floral arch and chairs',
      platform: 'youtube',
    },
    {
      id: 'v4',
      title: 'Anya & Marcus — By the Lake',
      description: 'An intimate 30-person celebration captured from setup to the last toast at midnight.',
      embedUrl: 'https://www.youtube.com/embed/ScMzIvxBSi4',
      thumbnail: 'https://images.pexels.com/photos/28613084/pexels-photo-28613084.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      thumbnailAlt: 'Lakeside wedding venue with elegant decorations',
      platform: 'youtube',
    },
    {
      id: 'v5',
      title: 'Priya & Alex — Three Days, Two Cultures',
      description: 'A documentary-style film covering a three-day fusion wedding across two cities.',
      embedUrl: 'https://www.youtube.com/embed/ScMzIvxBSi4',
      thumbnail: 'https://images.pexels.com/photos/19024679/pexels-photo-19024679.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      thumbnailAlt: 'Wedding ceremony with white drapery and chandelier',
      platform: 'youtube',
    },
    {
      id: 'v6',
      title: 'Claire & David — Design Process',
      description: 'How we built a modern, architectural wedding design from first mood board to final install.',
      embedUrl: 'https://www.youtube.com/embed/ScMzIvxBSi4',
      thumbnail: 'https://images.pexels.com/photos/17315417/pexels-photo-17315417.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      thumbnailAlt: 'Indoor wedding venue with aisle and floral arrangements',
      platform: 'youtube',
    },
  ];
}

// ── Process Steps ──────────────────────────────

export function getProcessSteps(): ProcessStep[] {
  return [
    {
      number: '01',
      title: 'We Start With You',
      description:
        'No templates, no packages first. Our first conversation is about your story, your priorities, and what you want the day to feel like — not just look like.',
    },
    {
      number: '02',
      title: 'A Plan Built Around Your Day',
      description:
        'I build a custom plan for your wedding — not a generic checklist. Every timeline, vendor choice, and design decision serves the specific experience you want to create.',
    },
    {
      number: '03',
      title: 'You Talk to Me, Always',
      description:
        'No account managers, no junior associates, no being passed around. My couples have my personal number. Questions get answered by the person who knows your wedding inside and out.',
    },
    {
      number: '04',
      title: 'I Sweat the Details',
      description:
        'Contracts, logistics, vendor coordination, floor plans, contingency plans — the unglamorous machinery that makes a wedding feel effortless. That\'s my job, not yours.',
    },
    {
      number: '05',
      title: 'You Enjoy Your Day',
      description:
        'When the day comes, you are a guest at your own wedding. I\'m already there, three steps ahead, making sure everything happens exactly as we planned — and handling whatever we didn\'t.',
    },
  ];
}
