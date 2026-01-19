import { Book, Category } from '../types';

export const mockCategories: Category[] = [
  { id: '1', name: 'Tümü' },
  { id: '2', name: 'Popüler' },
  { id: '3', name: 'Yeni' },
  { id: '4', name: 'Roman' },
  { id: '5', name: 'Bilim' },
  { id: '6', name: 'Tarih' },
  { id: '7', name: 'Klasikler' },
  { id: '8', name: 'Bilim Kurgu' },
  { id: '9', name: 'Polisiye' },
  { id: '10', name: 'Kişisel Gelişim' },
];

export const mockBooks: Book[] = [
  {
    id: '1',
    title: 'Küçük Prens',
    author: 'Antoine de Saint-Exupéry',
    narrator: 'Hayri Küçükdeniz',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
    duration: '1sa 54dk',
    rating: 4.9,
    category: 'Çocuk Klasikleri',
    description: 'Küçük Prens, Antoine de Saint-Exupéry\'nin en ünlü eseridir. Bir çocuğun gözünden büyüklerin dünyasını anlatan bu masal, evrensel bir klasik haline gelmiştir.',
    chapters: [
      { id: '1-1', title: 'Bölüm 1', duration: '15dk', audioUrl: 'https://example.com/audio1.mp3' },
      { id: '1-2', title: 'Bölüm 2', duration: '18dk', audioUrl: 'https://example.com/audio2.mp3' },
    ],
    isDownloaded: true,
    progress: 45,
    lastPlayedAt: new Date(),
  },
  {
    id: '2',
    title: '1984',
    author: 'George Orwell',
    narrator: 'Mehmet Atay',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    duration: '11sa 24dk',
    rating: 4.9,
    category: 'Bilim Kurgu',
    description: 'George Orwell\'in distopya klasiklerinden biri olan 1984, totaliter bir toplumda yaşamanın korkunçluğunu anlatır.',
    chapters: [
      { id: '2-1', title: 'Bölüm 1', duration: '25dk', audioUrl: 'https://example.com/audio3.mp3' },
    ],
    isDownloaded: false,
    downloadProgress: 15,
  },
  {
    id: '3',
    title: 'Dune',
    author: 'Frank Herbert',
    narrator: 'Ali Vural',
    coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
    duration: '21sa 02dk',
    rating: 4.8,
    category: 'Bilim Kurgu',
    chapters: [
      { id: '3-1', title: 'Bölüm 1', duration: '30dk', audioUrl: 'https://example.com/audio4.mp3' },
    ],
  },
  {
    id: '4',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    narrator: 'Can Yücel',
    coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
    duration: '15sa 17dk',
    rating: 4.9,
    category: 'Bilim',
    chapters: [
      { id: '4-1', title: 'Bölüm 1', duration: '20dk', audioUrl: 'https://example.com/audio5.mp3' },
    ],
  },
  {
    id: '5',
    title: 'Suç ve Ceza',
    author: 'Fyodor Dostoyevski',
    narrator: 'Hayri Küçükdeniz',
    coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',
    duration: '24sa 45dk',
    rating: 4.7,
    category: 'Klasikler',
    description: 'Fyodor Dostoyevsky\'nin başyapıtı Suç ve Ceza, yoksul bir öğrenci olan Raskolnikov\'un, olağanüstü insanların adi suçların ötesinde olduğuna dair teorisini test etmek amacıyla bir tefeciyi öldürmesini konu alır.',
    chapters: [
      { id: '5-1', title: 'Bölüm 1', duration: '35dk', audioUrl: 'https://example.com/audio6.mp3' },
    ],
    isDownloaded: true,
    progress: 78,
  },
  {
    id: '6',
    title: 'Simyacı',
    author: 'Paulo Coelho',
    narrator: 'Zeynep Özkan',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
    duration: '4sa 12dk',
    rating: 4.8,
    category: 'Roman',
    isDownloaded: true,
    isCompleted: true,
  },
  {
    id: '7',
    title: 'Sırça Köşk',
    author: 'Sabahattin Ali',
    narrator: 'Ayşe Demir',
    coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400',
    duration: '3sa 30dk',
    rating: 4.9,
    category: 'Roman',
    chapters: [
      { id: '7-1', title: 'Bölüm 1', duration: '20dk', audioUrl: 'https://example.com/audio7.mp3' },
      { id: '7-2', title: 'Bölüm 2', duration: '22dk', audioUrl: 'https://example.com/audio8.mp3' },
      { id: '7-3', title: 'Bölüm 3', duration: '25dk', audioUrl: 'https://example.com/audio9.mp3' },
      { id: '7-4', title: 'Bölüm 4: Sırça Köşk', duration: '28dk', audioUrl: 'https://example.com/audio10.mp3' },
    ],
    progress: 58,
  },
  {
    id: '8',
    title: 'Kürk Mantolu Madonna',
    author: 'Sabahattin Ali',
    narrator: 'Ayşe Demir',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    duration: '5sa 24dk',
    rating: 4.9,
    category: 'Roman',
  },
  {
    id: '9',
    title: 'Nutuk',
    author: 'Mustafa Kemal Atatürk',
    narrator: 'Mehmet Özgür',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
    duration: '34sa 12dk',
    rating: 5.0,
    category: 'Tarih',
  },
  {
    id: '10',
    title: 'Harry Potter ve Felsefe Taşı',
    author: 'J.K. Rowling',
    narrator: 'Zeynep Özkan',
    coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
    duration: '9sa 33dk',
    rating: 4.9,
    category: 'Fantastik',
    isDownloaded: true,
    progress: 78,
  },
];

export const featuredBook: Book = mockBooks[0]; // Küçük Prens

export const popularBooks: Book[] = [
  mockBooks[1], // 1984
  mockBooks[2], // Dune
  mockBooks[3], // Sapiens
  mockBooks[4], // Suç ve Ceza
];

