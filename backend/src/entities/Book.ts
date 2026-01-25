import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Category } from './Category';
import { Chapter } from './Chapter';
import { Progress } from './Progress';
import { Favorite } from './Favorite';
import { Review } from './Review';

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  author!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  narrator?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 500, name: 'cover_image', nullable: true })
  coverImage?: string;

  @Column({ type: 'int', name: 'category_id', nullable: true })
  categoryId?: number;

  @Column({ type: 'int', name: 'total_duration', default: 0 })
  totalDuration!: number; // Saniye cinsinden

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0 })
  rating!: number;

  @Column({ type: 'int', name: 'rating_count', default: 0 })
  ratingCount!: number;

  @Column({ type: 'boolean', name: 'is_featured', default: false })
  isFeatured!: boolean;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => Category, (category) => category.books, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category?: Category;

  @OneToMany(() => Chapter, (chapter) => chapter.book)
  chapters!: Chapter[];

  @OneToMany(() => Progress, (progress) => progress.book)
  progress!: Progress[];

  @OneToMany(() => Favorite, (favorite) => favorite.book)
  favorites!: Favorite[];

  @OneToMany(() => Review, (review) => review.book)
  reviews!: Review[];
}
