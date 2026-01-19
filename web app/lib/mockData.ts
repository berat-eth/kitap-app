import { Book, Chapter } from './types';

// Mock Kitaplar
export const mockBooks: Book[] = [
  {
    id: '1',
    title: 'Kurtuluş Projesi',
    author: 'Andy Weir',
    description: 'Bu destansı macerada yalnız bir astronot dünyayı felaketten kurtarmalı. Bilim kurgu türünde nefes kesen bir hikaye.',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=500',
    category: 'Bilim Kurgu',
    duration: 720, // 12 saat
  },
  {
    id: '2',
    title: 'Zihniyet Ustalığı',
    author: 'S. Demir',
    description: 'Zihinsel gücünüzü keşfedin ve potansiyelinizi ortaya çıkarın. Kişisel gelişim alanında bir başyapıt.',
    coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=500',
    category: 'Kişisel Gelişim',
    duration: 480, // 8 saat
  },
  {
    id: '3',
    title: 'Galaksi Sınırı',
    author: 'J. Smith',
    description: 'Uzayın derinliklerinde geçen epik bir macera. İnsanlığın geleceği için verilen mücadele.',
    coverImage: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?q=80&w=500',
    category: 'Bilim Kurgu',
    duration: 900, // 15 saat
  },
  {
    id: '4',
    title: 'Osmanlı Masalları',
    author: 'K. Pamuk',
    description: 'Osmanlı döneminden gelen efsanevi hikayeler. Tarih ve kültürün iç içe geçtiği bir koleksiyon.',
    coverImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=500',
    category: 'Tarih',
    duration: 600, // 10 saat
  },
  {
    id: '5',
    title: 'Teknoloji Vizyonerleri',
    author: 'W. Isaacson',
    description: 'Teknoloji dünyasının öncülerinin hikayeleri. İnovasyon ve yaratıcılığın izinde bir yolculuk.',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=500',
    category: 'Teknoloji',
    duration: 840, // 14 saat
  },
  {
    id: '6',
    title: 'Pür Dikkat',
    author: 'C. Newport',
    description: 'Dikkat dağınıklığı çağında odaklanma sanatı. Derin çalışma teknikleri ve verimlilik stratejileri.',
    coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=500',
    category: 'Kişisel Gelişim',
    duration: 420, // 7 saat
  },
  {
    id: '7',
    title: 'Sessiz Yankı',
    author: 'M. Kaya',
    description: 'Sessizliğin gücünü keşfedin. İç huzur ve farkındalık üzerine derinlemesine bir inceleme.',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=500',
    category: 'Felsefe',
    duration: 360, // 6 saat
  },
  {
    id: '8',
    title: 'Yıldızlararası Yolculuk',
    author: 'A. Yıldız',
    description: 'Evrenin sırlarını keşfetmek için çıkılan bir yolculuk. Bilim ve hayal gücünün buluşması.',
    coverImage: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?q=80&w=500',
    category: 'Bilim Kurgu',
    duration: 780, // 13 saat
  },
  {
    id: '9',
    title: 'Dijital Çağın Liderleri',
    author: 'T. Teknoloji',
    description: 'Dijital dönüşümün öncüleri ve başarı hikayeleri. İş dünyasında teknolojinin rolü.',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=500',
    category: 'İş Dünyası',
    duration: 540, // 9 saat
  },
  {
    id: '10',
    title: 'Anadolu Efsaneleri',
    author: 'H. Anadolu',
    description: 'Binlerce yıllık Anadolu kültüründen derlenen efsaneler ve hikayeler.',
    coverImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=500',
    category: 'Kültür',
    duration: 480, // 8 saat
  },
];

// Mock Bölümler (her kitap için)
export const mockChapters: Record<string, Chapter[]> = {
  '1': [
    {
      id: '1-1',
      bookId: '1',
      title: 'Bölüm 1: Başlangıç',
      order: 1,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration: 3600, // 60 dakika
    },
    {
      id: '1-2',
      bookId: '1',
      title: 'Bölüm 2: Yolculuk',
      order: 2,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      duration: 3600,
    },
    {
      id: '1-3',
      bookId: '1',
      title: 'Bölüm 3: Keşif',
      order: 3,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      duration: 3600,
    },
    {
      id: '1-4',
      bookId: '1',
      title: 'Bölüm 4: Mücadele',
      order: 4,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      duration: 3600,
    },
    {
      id: '1-5',
      bookId: '1',
      title: 'Bölüm 5: Zafer',
      order: 5,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
      duration: 3600,
    },
  ],
  '2': [
    {
      id: '2-1',
      bookId: '2',
      title: 'Bölüm 1: Zihin Gücü',
      order: 1,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration: 2400, // 40 dakika
    },
    {
      id: '2-2',
      bookId: '2',
      title: 'Bölüm 2: Odaklanma',
      order: 2,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      duration: 2400,
    },
    {
      id: '2-3',
      bookId: '2',
      title: 'Bölüm 3: Uygulama',
      order: 3,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      duration: 2400,
    },
  ],
  '3': [
    {
      id: '3-1',
      bookId: '3',
      title: 'Bölüm 1: Uzayın Derinlikleri',
      order: 1,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration: 3600,
    },
    {
      id: '3-2',
      bookId: '3',
      title: 'Bölüm 2: Yeni Dünyalar',
      order: 2,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      duration: 3600,
    },
  ],
};

// Tüm kitaplar için varsayılan bölümler oluştur
mockBooks.forEach((book) => {
  if (!mockChapters[book.id]) {
    mockChapters[book.id] = [
      {
        id: `${book.id}-1`,
        bookId: book.id,
        title: 'Bölüm 1',
        order: 1,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        duration: 3600,
      },
      {
        id: `${book.id}-2`,
        bookId: book.id,
        title: 'Bölüm 2',
        order: 2,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        duration: 3600,
      },
      {
        id: `${book.id}-3`,
        bookId: book.id,
        title: 'Bölüm 3',
        order: 3,
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        duration: 3600,
      },
    ];
  }
});

// Mock Kategoriler
export const mockCategories: string[] = [
  'Bilim Kurgu',
  'Kişisel Gelişim',
  'Tarih',
  'Teknoloji',
  'Felsefe',
  'İş Dünyası',
  'Kültür',
];

