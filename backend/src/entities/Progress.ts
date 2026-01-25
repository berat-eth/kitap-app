import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Device } from './Device';
import { Book } from './Book';
import { Chapter } from './Chapter';

@Entity('progress')
@Unique(['deviceId', 'bookId']) // Bir cihaz, bir kitap için tek ilerleme
export class Progress {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: 'int', name: 'device_id' })
  deviceId!: number;

  @Index()
  @Column({ type: 'int', name: 'book_id' })
  bookId!: number;

  @Column({ type: 'int', name: 'chapter_id', nullable: true })
  chapterId?: number;

  @Column({ type: 'int', name: 'current_time', default: 0 })
  currentTime!: number; // Saniye cinsinden

  @Column({ type: 'boolean', name: 'is_completed', default: false })
  isCompleted!: boolean;

  @UpdateDateColumn({ name: 'last_played_at' })
  lastPlayedAt!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // Relations
  @ManyToOne(() => Device, (device) => device.progress, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'device_id' })
  device!: Device;

  @ManyToOne(() => Book, (book) => book.progress, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'book_id' })
  book!: Book;

  @ManyToOne(() => Chapter, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'chapter_id' })
  chapter?: Chapter;
}
