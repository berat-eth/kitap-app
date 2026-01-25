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

@Entity('favorites')
@Unique(['deviceId', 'bookId']) // Bir cihaz, bir kitabı bir kez favoriye ekleyebilir
export class Favorite {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: 'int', name: 'device_id' })
  deviceId!: number;

  @Index()
  @Column({ type: 'int', name: 'book_id' })
  bookId!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // Relations
  @ManyToOne(() => Device, (device) => device.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'device_id' })
  device!: Device;

  @ManyToOne(() => Book, (book) => book.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'book_id' })
  book!: Book;
}
