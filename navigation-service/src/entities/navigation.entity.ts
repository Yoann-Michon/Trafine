import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Navigation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column('float')
  startLat: number;

  @Column('float')
  startLon: number;

  @Column('float')
  endLat: number;

  @Column('float')
  endLon: number;

  @Column({default: false})
  avoidHighways?: boolean;

  @Column({default: false})
  avoidTolls?: boolean;

  @Column('json', {nullable: true})
  routeData: any;
  
  @Column('float', {nullable: true})
  distance: number;
  
  @Column('int', {nullable: true})
  duration: number;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
