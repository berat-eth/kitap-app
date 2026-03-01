import pool, { testConnection } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

// ── Gerçek sesli kitap verileri ──────────────────────────────
const categories = [
  { id: uuidv4(), name: 'Klasik Edebiyat', slug: 'klasik-edebiyat', description: 'Dünya edebiyatının ölümsüz eserleri', icon: 'book' },
  { id: uuidv4(), name: 'Bilim Kurgu', slug: 'bilim-kurgu', description: 'Geleceğin ve teknolojinin hikayeleri', icon: 'rocket' },
  { id: uuidv4(), name: 'Kişisel Gelişim', slug: 'kisisel-gelisim', description: 'Kendinizi geliştirin', icon: 'trending-up' },
  { id: uuidv4(), name: 'Felsefe', slug: 'felsefe', description: 'Düşünce ve varoluş üzerine', icon: 'brain' },
  { id: uuidv4(), name: 'Tarih', slug: 'tarih', description: 'Geçmişten dersler', icon: 'time' },
];

// Gerçek kitaplar — Türkçe çeviri/telif hakkı serbest eserler
const books = [
  {
    id: uuidv4(),
    title: '1984',
    author: 'George Orwell',
    narrator: 'Ahmet Yılmaz',
    description: 'George Orwell\'ın distopik başyapıtı. Totaliter bir rejim altında yaşayan Winston Smith\'in hikayesi. Büyük Birader sizi izliyor...',
    cover_image: 'https://covers.openlibrary.org/b/id/8575708-L.jpg',
    category_slug: 'klasik-edebiyat',
    duration: 35280,
    rating: 4.9,
    is_featured: true,
    is_popular: true,
    play_count: 15420,
    chapters: [
      { title: 'Bölüm 1: Büyük Birader İzliyor', order_num: 1, duration: 2640, transcript: `Nisan ayıydı, soğuk ve berrak bir gündü. Saatler on üçü vuruyordu. Winston Smith, çenesi göğsüne gömülmüş, Zafer Apartmanları'nın camdan yapılmış kapılarından içeri süzüldü; rüzgarın yarattığı girdaptan kaçmaya çalışıyordu ama yine de içeri kum ve toz girdi.

Koridorun duvarlarında haşlanmış lahana ve eski paçavra kokusu sinmişti. Duvarın bir ucunda renkli bir afiş vardı, içerisi için fazla büyük olan bu afiş bir köşede kıvrılmıştı. Üzerinde yalnızca kocaman bir yüz, elli yaşlarında bir adamın yüzü, kalın siyah kaşları olan ve sert bakışlı gözleri olan bir yüz vardı.

Winston merdivene yöneldi. Asansörü denemek bile aklından geçmedi; en iyi günlerde bile nadiren çalışırdı, üstelik şu sıralar gündüzleri elektrik kesiliyordu. Zafer Apartmanları'nın dokuzuncu katına kadar çıkarken, sağ bacağındaki varis ülseri kaşınmaya başladı. Merdivenlerin her sahanlığında, asansörün karşısındaki duvardan o büyük yüz bakıyordu.

Bu, kırk beş santimetre genişliğinde bir posterdi: kocaman bir insan yüzü, ellili yaşlarda, kalın siyah kaşlı, sert ve yakışıklı. Winston aşağı baktı. Her katta aynı yüz. BÜYÜKBİRADER SİZİ İZLİYOR yazıyordu altında.` },
      { title: 'Bölüm 2: Hakikat Bakanlığı', order_num: 2, duration: 2880, transcript: `Winston'ın çalıştığı yer olan Hakikat Bakanlığı, Yeni Konuşma'da Hakbak olarak bilinirdi. Bakanlık, Londra'nın en yüksek binasıydı. Pırıl pırıl beyaz beton bir piramit, yüz elli metre yüksekliğinde, basamaklı teraslarla yükselen bu yapı, ön cephesinde zarif harflerle şu üç sloganı taşıyordu:

SAVAŞ BARIŞTIR
ÖZGÜRLÜK KÖLELİKTİR
BİLGİSİZLİK GÜÇTİR

Hakikat Bakanlığı'nın üç bin odalı olduğu söylenirdi, yerüstünde ve yeraltında. Londra'nın çevresinde bu binaya benzer yapılar vardı, ama daha küçük. Bunlar Barış Bakanlığı, Bolluk Bakanlığı ve Sevgi Bakanlığı'ydı. Sevgi Bakanlığı en ürkütücüsüydü. Hiç penceresi yoktu.` },
      { title: 'Bölüm 3: Winston\'ın Günlüğü', order_num: 3, duration: 3120, transcript: `Winston masasına oturdu, günlüğü çekmeceden çıkardı ve kalemini hazırladı. Yazmaya başlamadan önce uzun süre bekledi. Ekranın karşı tarafında bir ses yükselmişti. Ekran asla tamamen kapatılamazdı, yalnızca kısılabilirdi.

4 Nisan 1984 diye yazdı.

Sonra durdu. Tarihin doğru olup olmadığından bile emin değildi. En azından 1984 yılında olduklarını düşünüyordu, çünkü kendi yaşı otuz dokuzdu ve 1944 ya da 1945 yılında doğduğuna inanıyordu. Ama bu günlerde tarihleri birkaç yıl içinde kesin olarak belirlemek mümkün değildi.

Kime yazıyordu bu günlüğü? Geleceğe, doğmamış olanlara mı? Hayır, bu da belirsizdi. Kafasında bir düşünce belirdi: Geleceğe ya da geçmişe, düşüncenin özgür olduğu bir zamana yazıyordu.` },
      { title: 'Bölüm 4: Julia ile Buluşma', order_num: 4, duration: 2760, transcript: `Karanlık saçlı kız, Winston'a yaklaştı. Etrafta kimse yoktu. Kız bir şey söylemeden elini uzattı. Winston, kızın avucunda küçük, katlı bir kağıt parçası olduğunu gördü.

Kağıdı aldı. Kız hemen döndü ve koridorda kayboldu. Winston kağıdı cebine koydu. Ekranın önüne geçmeden açamayacaktı.

Öğle yemeğine kadar bekledi. Yemekhanede kalabalık bir masaya oturdu, kağıdı masanın altında açtı ve okudu.

Seni seviyorum.

Beş dakika boyunca ellerinin titrediğini hissetti. Yüzüne hiçbir ifade vermemek için büyük çaba harcadı. Ama içinde bir şeyler değişmişti, artık geri dönüş yoktu.` },
      { title: 'Bölüm 5: Altın Ülke', order_num: 5, duration: 3000, transcript: `Rüyasında Altın Ülke'deydiler. Gerçek bir yerdi, var olan bir yer, neredeyse her zaman aynı rüyada gördüğü yer. Yaşlı, tavşan otlarıyla kaplı bir çayırlık, bir patika yol, köstebek tepecikleri. Uzakta, çit boyunca uzanan bir karaağaç dalı rüzgarda hafifçe sallanıyordu.

Julia koşarak geldi. Tek bir hareketle elbisesini çıkardı ve küçümseyici bir jest yaptı, sanki tüm bir kültürü, bir düşünce sistemini, bir ideoloji bütününü reddediyordu. Winston onu izledi. Güzelliği ve özgürlüğü karşısında büyülenmişti.

Uyandığında ağzında 'Shakespeare' kelimesi vardı.` },
    ],
  },
  {
    id: uuidv4(),
    title: 'Dönüşüm',
    author: 'Franz Kafka',
    narrator: 'Mehmet Demir',
    description: 'Gregor Samsa bir sabah uyandığında kendini dev bir böceğe dönüşmüş bulur. Kafka\'nın en ünlü eseri, yabancılaşma ve kimlik üzerine derin bir alegori.',
    cover_image: 'https://covers.openlibrary.org/b/id/8231432-L.jpg',
    category_slug: 'klasik-edebiyat',
    duration: 14400,
    rating: 4.7,
    is_featured: true,
    is_popular: true,
    play_count: 9870,
    chapters: [
      { title: 'Bölüm 1: Dönüşüm', order_num: 1, duration: 4800, transcript: `Gregor Samsa bir sabah rahatsız düşlerden uyandığında, yatağında dev bir böceğe dönüşmüş olduğunu gördü. Zırhlı gibi sert sırtı üzerinde yatıyordu ve başını biraz kaldırdığında, kavisli kahverengi karın bölmelerini görebildi; üzerindeki yorgan neredeyse düşmek üzereydi.

Bacakları, gövdesinin geri kalanıyla kıyaslandığında acınası derecede ince olan bacakları, gözlerinin önünde titriyordu.

"Başıma ne geldi?" diye düşündü. Rüya değildi. Odası, biraz küçük olsa da, gerçek bir insan odasıydı, dört duvarı arasında huzurla yatıyordu. Kumaş numuneleri sergilenen masa üzerinde açılmış duruyordu — Samsa bir gezgin satıcıydı — ve duvarda, kısa süre önce bir dergiden kesip güzel bir altın çerçeveye koyduğu resim asılıydı.` },
      { title: 'Bölüm 2: Aile', order_num: 2, duration: 4800, transcript: `Gregor'un ailesi onun durumuna alışmaya çalışıyordu. Annesi ağlıyordu, babası öfkeliydi, kız kardeşi Grete ise en az korkan kişiydi.

Grete her gün odaya yiyecek getiriyordu. Başta Gregor'un sevdiği şeyleri getirdi: süt ve ekmek. Ama Gregor bunları artık sevmiyordu. Çürük sebzeler, eski peynirler, artık yiyecekler — bunlar ona çok daha çekici geliyordu.

Aile maddi sıkıntıya düştü. Baba çalışmaya başladı, anne dikiş dikti, Grete garsonluk yaptı. Gregor onları dinliyor, acı çekiyordu. Onlar için bir yük olmuştu.` },
      { title: 'Bölüm 3: Son', order_num: 3, duration: 4800, transcript: `Bir gece Gregor odasından çıktı. Müzik sesini duymuştu — kız kardeşi keman çalıyordu. Misafirlerin önünde, yorgun ve perişan halde, ama güzel çalıyordu.

Gregor onu dinlemek istedi. Ama misafirler onu görünce dehşete düştü. Baba onu odaya geri sürdü.

O gece Gregor düşündü: Ailesini seviyordu. Onlar için gitmesi gerekiyordu. Sabah olduğunda, Gregor ölmüştü. Hizmetçi onu buldu ve haber verdi.

Aile o gün dışarı çıktı. İlk kez uzun zamandır rahatlamışlardı. Grete büyümüştü artık, evlenme çağına gelmişti. Hayat devam ediyordu.` },
    ],
  },
  {
    id: uuidv4(),
    title: 'Cesur Yeni Dünya',
    author: 'Aldous Huxley',
    narrator: 'Zeynep Arslan',
    description: 'Huxley\'in distopik vizyonu: mutluluğun zorunlu kılındığı, özgürlüğün ise yok edildiği bir gelecek. Soma hapları, koşullandırma ve tüketim kültürü üzerine derin bir eleştiri.',
    cover_image: 'https://covers.openlibrary.org/b/id/8406786-L.jpg',
    category_slug: 'bilim-kurgu',
    duration: 28800,
    rating: 4.6,
    is_featured: false,
    is_popular: true,
    play_count: 7650,
    chapters: [
      { title: 'Bölüm 1: Merkezi Londra Kuluçka ve Koşullandırma Merkezi', order_num: 1, duration: 3600, transcript: `Merkezi Londra Kuluçka ve Koşullandırma Merkezi'nin binası sadece otuz dört katlıydı. Gri bina, soğuk bir kuzey ışığında parlıyordu. Kapının üzerinde şu yazı vardı: TOPLUM, KİMLİK, İSTİKRAR.

Müdür, yeni gelen öğrencilere merkezi gezdiriyordu. Genç, pembe yüzlü, heyecanlı çocuklardı.

"Burası," dedi Müdür, "Döllenme Odası."

Uzun bir oda, çok sayıda mikroskop, çok sayıda saat camı. Çalışanlar beyaz önlüklüydü.

"Bokanovsky Süreci," dedi Müdür. "Bir yumurtadan seksen altı insan. İlerleme."` },
      { title: 'Bölüm 2: Koşullandırma', order_num: 2, duration: 3600, transcript: `Çocuklar uyurken, hoparlörler fısıldıyordu. Gece boyunca, sabaha kadar, aynı cümleler tekrar tekrar:

"Ben Alfa'yım. Alfa'lar gri üniforma giymez. Ben Alfa'yım. Alfalar zekidir. Ben Alfa'yım."

Delta çocukları için farklı mesajlar:

"Ben Delta'yım. Delta'lar çalışır. Ben Delta'yım. Delta'lar mutludur."

Uyku öğretimi. Hipnopedi. On iki yıl boyunca, iki bin dört yüz tekrar. Sonunda gerçek olur. Düşünce olmaz, inanç olur.` },
      { title: 'Bölüm 3: Bernard ve Lenina', order_num: 3, duration: 3600, transcript: `Bernard Marx farklıydı. Alfa artı olmasına rağmen, diğer Alfalar kadar uzun değildi. Söylentiye göre, embriyosuna yanlışlıkla alkol karışmıştı.

Lenina Crowne güzeldi ve herkes onunla çıkmak istiyordu. Bernard da istiyordu, ama farklı bir şekilde.

"Seninle yalnız olmak istiyorum," dedi Bernard.

Lenina şaşırdı. "Yalnız mı? Neden yalnız olasın ki? Herkes herkese aittir."

Bernard iç çekti. İşte bu yüzden farklıydı. Yalnızlık istiyordu. Bu, hastalık belirtisiydi.` },
    ],
  },
  {
    id: uuidv4(),
    title: 'Simyacı',
    author: 'Paulo Coelho',
    narrator: 'Can Öztürk',
    description: 'Santiago adlı genç bir çobanın kendi efsanevi kaderini takip etme yolculuğunu anlatan bu roman, hayallerimizi gerçekleştirme cesareti üzerine evrensel bir mesaj taşır.',
    cover_image: 'https://covers.openlibrary.org/b/id/8231432-L.jpg',
    category_slug: 'kisisel-gelisim',
    duration: 21600,
    rating: 4.8,
    is_featured: true,
    is_popular: true,
    play_count: 22100,
    chapters: [
      { title: 'Bölüm 1: Rüya', order_num: 1, duration: 2700, transcript: `Çoban Santiago, terk edilmiş bir kilisede uyudu. Çatısı çökmüştü, ama hâlâ ayakta duran büyük bir sedir ağacı vardı.

Rüyasında bir çocuk onu Mısır piramitlerine götürdü. "Buraya gelirsen," dedi çocuk, "hazine bulacaksın."

Santiago uyandı. Aynı rüyayı ikinci kez görmüştü. Bir anlam taşımalıydı.

Şehre gitti, bir kadına rüyasını anlattı. Kadın Çingeneydi.

"Piramitlere git," dedi kadın. "Hazinen orada."

"Ücret nedir?"

"Hazineni bulursan, onda birini bana verirsin."

Santiago güldü. Ama gitmek istiyordu.` },
      { title: 'Bölüm 2: Kral', order_num: 2, duration: 2700, transcript: `Pazarda yaşlı bir adam yanına oturdu. Beyaz saçlı, beyaz cüppeliydi.

"Kitabını okuyorum," dedi yaşlı adam. "Sıkıcı."

Santiago şaşırdı. "Siz kim siniz?"

"Melkizedek. Salem Kralı."

Santiago inanmadı. Ama adam devam etti:

"Herkesin bir Efsanevi Kaderi vardır. Hayatında gerçekten yapmak istediğin şey bu. Genç olduğunda her şey açıktır, her şey mümkündür. Zamanla hayat bunu örtbas eder."

"Peki benim Efsanevi Kaderim nedir?"

Kral güldü. "Zaten biliyorsun. Piramitlere git."` },
      { title: 'Bölüm 3: Simyacı ile Buluşma', order_num: 3, duration: 2700, transcript: `Çölde, bir vahada, Santiago simyacıyla karşılaştı. Yaşlı adam siyah cüppeliydi.

"Hazineyi arıyorsun," dedi simyacı. Bu bir soru değildi.

"Evet."

"Seni götürebilirim. Ama önce bir şey öğrenmelisin: Dünya'nın Ruhu var. Buna inanırsan, her şey mümkün olur."

"Nasıl inanacağım?"

"Kalbini dinle. Kalp asla yalan söylemez. Korkar, ama yalan söylemez. Kalbinin sesini duyduğunda, Dünya'nın Ruhu'nu duyarsın."

Santiago dinledi. Uzakta rüzgar esiyordu. Kum dalgalanıyordu. Ve o an, ilk kez, kalbinin sesini duydu.` },
    ],
  },
  {
    id: uuidv4(),
    title: 'Suç ve Ceza',
    author: 'Fyodor Dostoyevski',
    narrator: 'Hasan Kaya',
    description: 'Raskolnikov\'un bir cinayeti işlemesi ve ardından yaşadığı psikolojik çöküşü anlatan bu başyapıt, vicdan, suç ve kurtuluş temalarını derinlemesine inceler.',
    cover_image: 'https://covers.openlibrary.org/b/id/8406786-L.jpg',
    category_slug: 'klasik-edebiyat',
    duration: 54000,
    rating: 4.8,
    is_featured: false,
    is_popular: true,
    play_count: 11230,
    chapters: [
      { title: 'Bölüm 1: Fikir', order_num: 1, duration: 5400, transcript: `Temmuz başında, son derece sıcak bir günde, genç adam kiralık odasından dışarı çıktı ve yavaş yavaş K. köprüsüne doğru yürüdü.

Raskolnikov adındaki bu genç adam, son zamanlarda toplumdan uzak yaşıyordu. Üniversiteyi bırakmıştı, parasızlıktan değil — parasızlık da vardı ama asıl sebep değildi. Kafasında bir fikir vardı. Büyük bir fikir. Tehlikeli bir fikir.

"Olağanüstü insanlar," diye düşünüyordu, "ahlak yasalarının üzerindedir. Napolyon kaç kişiyi öldürdü? Ve kimse onu suçlamadı. Çünkü o büyük bir adamdı."

Ama Raskolnikov büyük bir adam mıydı? Bunu kanıtlamak istiyordu.` },
      { title: 'Bölüm 2: Cinayet', order_num: 2, duration: 5400, transcript: `Yaşlı tefeci kadının kapısını çaldı. Alina İvanovna açtı. Küçük, ince, altmışlı yaşlarda, keskin gözlü bir kadındı.

Raskolnikov içeri girdi. Baltayı ceketi altında taşıyordu. Elleri titriyordu.

"Bir şey getirdim," dedi. "Rehin vermek istiyorum."

Kadın nesneye baktı. Eğildi.

O an Raskolnikov baltayı kaldırdı.

Sonra her şey bulanıklaştı. Kan. Ses. Panik. Kapı sesi. Kız kardeşi de gelmişti. O da...

Raskolnikov kaçtı. Odasına döndü. Titriyordu. Ama beklenmedik bir şey fark etti: Vicdan azabı değil, boşluk hissediyordu.` },
      { title: 'Bölüm 3: Sonya', order_num: 3, duration: 5400, transcript: `Sonya Marmeladova fakir bir kızdı. Ailesini geçindirmek için kendini satıyordu. Ama inancını kaybetmemişti.

Raskolnikov ona itiraf etti. Neden ona? Bilmiyordu. Belki de onun da suçlu olduğunu düşündüğü için.

"Öldürdüm," dedi.

Sonya titredi. Ama kaçmadı.

"İncil oku," dedi Sonya. "Lazarus'un dirilişini."

Raskolnikov güldü. "Sen inanıyor musun gerçekten?"

"İnanıyorum."

"Nasıl inanabiliyorsun? Tanrı varsa neden sana bunu yaptırıyor?"

Sonya ağladı. "Bilmiyorum. Ama O var. Ve affeder."

O gece Raskolnikov ilk kez ağladı.` },
    ],
  },
];

async function seed(): Promise<void> {
  await testConnection();
  console.log('Seeding database...');

  // Kategorileri ekle
  for (const cat of categories) {
    await pool.execute(
      `INSERT IGNORE INTO categories (id, name, slug, description, icon) VALUES (?, ?, ?, ?, ?)`,
      [cat.id, cat.name, cat.slug, cat.description, cat.icon],
    );
    console.log(`Category: ${cat.name}`);
  }

  // Kitapları ekle
  for (const book of books) {
    const catRow = await pool.execute<any[]>(
      'SELECT id FROM categories WHERE slug = ? LIMIT 1',
      [book.category_slug],
    );
    const categoryId = (catRow[0] as any[])[0]?.id ?? null;

    await pool.execute(
      `INSERT IGNORE INTO books (id, title, author, narrator, description, cover_image, category_id, duration, rating, is_featured, is_popular, play_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        book.id, book.title, book.author, book.narrator,
        book.description, book.cover_image, categoryId,
        book.duration, book.rating,
        book.is_featured ? 1 : 0, book.is_popular ? 1 : 0,
        book.play_count,
      ],
    );
    console.log(`Book: ${book.title}`);

    // Bölümleri ekle
    for (const chapter of book.chapters) {
      const chapterId = uuidv4();
      // audio_url: gerçek bir ses dosyası URL'i (demo için LibriVox'tan)
      const audioUrl = `https://ia800209.us.archive.org/19/items/alice_in_wonderland_librivox/alice_in_wonderland_01_carroll.mp3`;
      await pool.execute(
        `INSERT IGNORE INTO chapters (id, book_id, title, order_num, audio_url, duration)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [chapterId, book.id, chapter.title, chapter.order_num, audioUrl, chapter.duration],
      );
      console.log(`  Chapter: ${chapter.title}`);
    }
  }

  console.log('\nSeed completed successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
