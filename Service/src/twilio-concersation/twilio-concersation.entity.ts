import { User } from "src/user.entity";
import { Entity, Column, PrimaryGeneratedColumn , OneToOne, ManyToOne, JoinColumn} from "typeorm";

@Entity('conversation_details')
export class ConversationDetails {
  @PrimaryGeneratedColumn()
  id: number;

  
  @Column()
  conversationId: string;

  @Column()
  sourceUserName: string;

  @Column()
  targetUserName: string;

  @Column()
  sourceParticipanSid: string;

  @Column()
  tergetParticipanSid: string;

  @Column()
  sourceUserId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "sourceUserId" })
  sourceUser: User;

  @Column()
  targetUserId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "targetUserId" })
  targetUser: User;

}