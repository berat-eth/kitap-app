import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Book } from './Book';

@Entity('chapters')
export class Chapter {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: 'int', name: 'book_id' })
  bookId!: number;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'int', name: 'order_num', default: 1 })
  orderNum!: number;

  @Column({ type: 'varchar', length: 500, name: 'audio_url' })
  audioUrl!: string;

  @Column({ type: 'int', default: 0 })
  duration!: number; // Saniye cinsinden

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // Relations
  @ManyToOne(() => Book, (book) => book.chapters, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'book_id' })
  book!: Book;
}
