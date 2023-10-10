import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('qadata')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  question: string;

  @Column()
  answer: string;

  @Column()
  username: string;
}
