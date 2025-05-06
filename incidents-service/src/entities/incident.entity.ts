import { Entity, ObjectIdColumn, Column, CreateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';
import { RoadIncidentStatus, RoadIncidentType } from './type.enum';

@Entity('incidents')
export class Incident {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  type: RoadIncidentType;

  @Column()
  description: string;

  @Column()
  location: {
    type: 'Point';
    coordinates: [number, number];
  };

  @Column()
  severity: number; // 1-5

  @Column()
  status: RoadIncidentStatus;

  @Column()
  reportedBy: ObjectId;

  @Column({ default: [] })
  confirmedBy?: ObjectId[];

  @Column({ default: [] })
  rejectedBy?: ObjectId[];

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  resolvedAt?: Date;

  @Column()
  source: string;

  @Column({ default: true })
  isActive: boolean; 
}
