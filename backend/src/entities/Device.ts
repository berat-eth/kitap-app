import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Progress } from './Progress';
import { Favorite } from './Favorite';
import { Review } from './Review';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100, name: 'device_id' })
  deviceId!: string; // UUID formatında

  @Column({ type: 'varchar', length: 255, name: 'device_name', nullable: true })
  deviceName?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  platform?: string; // ios, android, web

  @UpdateDateColumn({ name: 'last_seen' })
  lastSeen!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // Relations
  @OneToMany(() => Progress, (progress) => progress.device)
  progress!: Progress[];

  @OneToMany(() => Favorite, (favorite) => favorite.device)
  favorites!: Favorite[];

  @OneToMany(() => Review, (review) => review.device)
  reviews!: Review[];
}
