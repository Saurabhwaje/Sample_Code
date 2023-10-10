import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
// import { ConversationDetails } from "./twilio-concersation/twilio-concersation.entity";

@Entity('userscreddetails')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column()
    dob: string;

    @Column()
    mobile_no: string;

    @Column()
    alt_mobile_no: string;

    @Column()
    is_reachable: boolean;
}