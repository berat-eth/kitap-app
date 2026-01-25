import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Device } from './Device';
import { Book } from './Book';

@Entity('reviews')
@Unique(['deviceId', 'bookId']) // Bir cihaz, bir kitaba bir yorum yapabilir
export class Review {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: 'int', name: 'device_id' })
  deviceId!: number;

  @Index()
  @Column({ type: 'int', name: 'book_id' })
  bookId!: number;

  @Column({ type: 'int' })
  rating!: number; // 1-5

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @Column({ type: 'varchar', length: 100, name: 'reviewer_name', nullable: true })
  reviewerName?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // Relations
  @ManyToOne(() => Device, (device) => device.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'device_id' })
  device!: Device;

  @ManyToOne(() => Book, (book) => book.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'book_id' })
  book!: Book;
}
