import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('routes')
export class Route {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'jsonb' })
  waypoints: {
    lat: number;
    lon: number;
    name?: string;
  }[];

  @Column({ type: 'jsonb' })
  routeData: any;

  @Column()
  @Index()
  userId: string; 

  @Column({ default: false })
  isShared: boolean;

  @Column({ nullable: true })
  shareCode: string; 

  @Column({ type: 'timestamp', nullable: true })
  shareExpiration: Date;

  @Column({ type: 'float' })
  distanceMeters: number;

  @Column({ type: 'integer' })
  durationSeconds: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}