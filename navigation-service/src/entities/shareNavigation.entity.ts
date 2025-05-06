import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Navigation } from './navigation.entity';

@Entity()
export class SharedNavigation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  navigationId: string;

  @Column({ nullable: true })
  url: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @ManyToOne(() => Navigation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'navigationId' })
  navigation: Navigation;
}