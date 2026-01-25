import 'reflect-metadata';
import { config, validateConfig } from '../config';
import { AppDataSource } from '../config/database';
import { Category } from '../entities/Category';
import { Book } from '../entities/Book';
import { Chapter } from '../entities/Chapter';

/**
 * Veritabanına örnek veri ekle
 */
async function seedDatabase(): Promise<void> {
  console.log('🌱 Veritabanı seed işlemi başlatılıyor...');
  console.log('');

  try {
    validateConfig();

    // Veritabanına bağlan
    await AppDataSource.initialize();
    console.log('✅ Veritabanı bağlantısı başarılı');

    const categoryRepo = AppDataSource.getRepository(Category);
    const bookRepo = AppDataSource.getRepository(Book);
    const chapterRepo = AppDataSource.getRepository(Chapter);

    // Mevcut veri var mı kontrol et
    const existingCategories = await categoryRepo.count();
    if (existingCategories > 0) {
      console.log('⚠️ Veritabanında zaten veri var. Seed işlemi atlanıyor.');
      console.log('   Mevcut kategoriler: ' + existingCategories);
      return;
    }

    // Kategorileri ekle
    console.log('📁 Kategoriler ekleniyor...');
    const categories = await categoryRepo.save([
      { name: 'Bilim Kurgu', slug: 'bilim-kurgu', description: 'Bilim kurgu kitapları', icon: 'rocket' },
      { name: 'Kişisel Gelişim', slug: 'kisisel-gelisim', description: 'Kişisel gelişim kitapları', icon: 'trending_up' },
      { name: 'Tarih', slug: 'tarih', description: 'Tarih kitapları', icon: 'history' },
      { name: 'Teknoloji', slug: 'teknoloji', description: 'Teknoloji kitapları', icon: 'computer' },
      { name: 'Felsefe', slug: 'felsefe', description: 'Felsefe kitapları', icon: 'psychology' },
      { name: 'İş Dünyası', slug: 'is-dunyasi', description: 'İş dünyası kitapları', icon: 'business' },
      { name: 'Kültür', slug: 'kultur', description: 'Kültür kitapları', icon: 'menu_book' },
      { name: 'Roman', slug: 'roman', description: 'Roman kitapları', icon: 'auto_stories' },
    ]);
    console.log(`   ✅ ${categories.length} kategori eklendi`);

    // Kitapları ekle
    console.log('📚 Kitaplar ekleniyor...');
    const books = await bookRepo.save([
      {
        title: 'Kurtuluş Projesi',
        author: 'Andy Weir',
        narrator: 'Can Yılmaz',
        description: 'Bu destansı macerada yalnız bir astronot dünyayı felaketten kurtarmalı. Bilim kurgu türünde nefes kesen bir hikaye.',
        coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=500',
        categoryId: categories.find(c => c.slug === 'bilim-kurgu')?.id,
        totalDuration: 43200, // 12 saat
        rating: 4.8,
        ratingCount: 1250,
        isFeatured: true,
        isActive: true,
      },
      {
        title: 'Zihniyet Ustalığı',
        author: 'S. Demir',
        narrator: 'Mehmet Akgün',
        description: 'Zihinsel gücünüzü keşfedin ve potansiyelinizi ortaya çıkarın. Kişisel gelişim alanında bir başyapıt.',
        coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=500',
        categoryId: categories.find(c => c.slug === 'kisisel-gelisim')?.id,
        totalDuration: 28800, // 8 saat
        rating: 4.6,
        ratingCount: 890,
        isFeatured: true,
        isActive: true,
      },
      {
        title: 'Galaksi Sınırı',
        author: 'J. Smith',
        narrator: 'Ali Veli',
        description: 'Uzayın derinliklerinde geçen epik bir macera. İnsanlığın geleceği için verilen mücadele.',
        coverImage: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?q=80&w=500',
        categoryId: categories.find(c => c.slug === 'bilim-kurgu')?.id,
        totalDuration: 54000, // 15 saat
        rating: 4.5,
        ratingCount: 720,
        isFeatured: false,
        isActive: true,
      },
      {
        title: 'Osmanlı Masalları',
        author: 'K. Pamuk',
        narrator: 'Ayşe Yıldız',
        description: 'Osmanlı döneminden gelen efsanevi hikayeler. Tarih ve kültürün iç içe geçtiği bir koleksiyon.',
        coverImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=500',
        categoryId: categories.find(c => c.slug === 'tarih')?.id,
        totalDuration: 36000, // 10 saat
        rating: 4.7,
        ratingCount: 560,
        isFeatured: true,
        isActive: true,
      },
      {
        title: 'Teknoloji Vizyonerleri',
        author: 'W. Isaacson',
        narrator: 'Burak Demir',
        description: 'Teknoloji dünyasının öncülerinin hikayeleri. İnovasyon ve yaratıcılığın izinde bir yolculuk.',
        coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=500',
        categoryId: categories.find(c => c.slug === 'teknoloji')?.id,
        totalDuration: 50400, // 14 saat
        rating: 4.4,
        ratingCount: 430,
        isFeatured: false,
        isActive: true,
      },
      {
        title: 'Pür Dikkat',
        author: 'C. Newport',
        narrator: 'Zeynep Kara',
        description: 'Dikkat dağınıklığı çağında odaklanma sanatı. Derin çalışma teknikleri ve verimlilik stratejileri.',
        coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=500',
        categoryId: categories.find(c => c.slug === 'kisisel-gelisim')?.id,
        totalDuration: 25200, // 7 saat
        rating: 4.9,
        ratingCount: 1100,
        isFeatured: true,
        isActive: true,
      },
      {
        title: 'Sessiz Yankı',
        author: 'M. Kaya',
        narrator: 'Deniz Akkaya',
        description: 'Sessizliğin gücünü keşfedin. İç huzur ve farkındalık üzerine derinlemesine bir inceleme.',
        coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=500',
        categoryId: categories.find(c => c.slug === 'felsefe')?.id,
        totalDuration: 21600, // 6 saat
        rating: 4.3,
        ratingCount: 340,
        isFeatured: false,
        isActive: true,
      },
      {
        title: 'Yıldızlararası Yolculuk',
        author: 'A. Yıldız',
        narrator: 'Emre Can',
        description: 'Evrenin sırlarını keşfetmek için çıkılan bir yolculuk. Bilim ve hayal gücünün buluşması.',
        coverImage: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=500',
        categoryId: categories.find(c => c.slug === 'bilim-kurgu')?.id,
        totalDuration: 46800, // 13 saat
        rating: 4.6,
        ratingCount: 650,
        isFeatured: false,
        isActive: true,
      },
      {
        title: 'Dijital Çağın Liderleri',
        author: 'T. Teknoloji',
        narrator: 'Serkan Öz',
        description: 'Dijital dönüşümün öncüleri ve başarı hikayeleri. İş dünyasında teknolojinin rolü.',
        coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=500',
        categoryId: categories.find(c => c.slug === 'is-dunyasi')?.id,
        totalDuration: 32400, // 9 saat
        rating: 4.2,
        ratingCount: 280,
        isFeatured: false,
        isActive: true,
      },
      {
        title: 'Anadolu Efsaneleri',
        author: 'H. Anadolu',
        narrator: 'Fatma Güneş',
        description: 'Binlerce yıllık Anadolu kültüründen derlenen efsaneler ve hikayeler.',
        coverImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=500',
        categoryId: categories.find(c => c.slug === 'kultur')?.id,
        totalDuration: 28800, // 8 saat
        rating: 4.5,
        ratingCount: 420,
        isFeatured: false,
        isActive: true,
      },
    ]);
    console.log(`   ✅ ${books.length} kitap eklendi`);

    // Bölümleri ekle
    console.log('📖 Bölümler ekleniyor...');
    let totalChapters = 0;

    for (const book of books) {
      const chapterCount = Math.floor(Math.random() * 5) + 3; // 3-7 bölüm
      const chapters = [];

      for (let i = 1; i <= chapterCount; i++) {
        chapters.push({
          bookId: book.id,
          title: `Bölüm ${i}`,
          orderNum: i,
          audioUrl: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(i % 16) + 1}.mp3`,
          duration: Math.floor(Math.random() * 3600) + 1800, // 30-90 dakika
        });
      }

      await chapterRepo.save(chapters);
      totalChapters += chapters.length;
    }
    console.log(`   ✅ ${totalChapters} bölüm eklendi`);

    console.log('');
    console.log('✅ Seed işlemi tamamlandı!');
    console.log('');
    console.log('📊 Özet:');
    console.log(`   - Kategoriler: ${categories.length}`);
    console.log(`   - Kitaplar: ${books.length}`);
    console.log(`   - Bölümler: ${totalChapters}`);

  } catch (error) {
    console.error('❌ Seed hatası:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

seedDatabase();
