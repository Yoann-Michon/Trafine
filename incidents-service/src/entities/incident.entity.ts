import { Entity, ObjectIdColumn, Column, CreateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';
import { GeoJsonGeometry, RoadIncidentStatus, RoadIncidentType } from './type.enum';


@Entity('incidents')
export class Incident {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  type: RoadIncidentType;

  @Column()
  description: string;

  @Column()
  location: GeoJsonGeometry;

  @Column()
  severity: number; // 1-5

  @Column()
  status: RoadIncidentStatus;

  @Column()
  reportedBy: string;

  @Column({ default: [] })
  confirmedBy?: string[];

  @Column({ default: [] })
  rejectedBy?: string[];

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  resolvedAt?: Date;

  @Column({ default: true })
  isActive: boolean; 
}
