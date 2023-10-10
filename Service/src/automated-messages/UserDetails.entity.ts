import { User} from 'src/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';

@Entity('userdetails')
export class UserDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  UserMobile: string;

  @Column()
  Name: string;

  @Column()
  Height: string;

  @Column()
  Weight: string
}
