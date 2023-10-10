import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user')
export class Userconv {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  socketId: string;

  @Column()
  name: string;

  @Column({ default: false })
  online: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastSeen: Date;
}
