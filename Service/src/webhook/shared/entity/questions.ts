import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("PK_groups_id", ["id"], { unique: true })
@Entity("groups", { schema: "dbo" })
export class GroupEntity {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("nvarchar", {
    name: "name",
    length: 50,
  })
  name: string;
}

@Index("PK_questions_id", ["id"], { unique: true })
@Entity("questions", { schema: "dbo" })
export class QuestionEntity {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", {
    name: "groupid",
  })
  groupid: Number;

  @Column("nvarchar", {
    name: "question",
    length: 50,
  })
  question: string;

  @Column("nvarchar", {
    name: "answerChoices",
    length: 50,
  })
  answerChoices: string;

  @Column("nvarchar", {
    name: "type",
    length: 50,
  })
  type: string;
}


@Index("PK_answers_id", ["id"], { unique: true })
@Entity("answers", { schema: "dbo" })
export class AnswerEntity {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", {
    name: "groupid",
  })
  groupid: Number;

  @Column("int", {
    name: "userid",
  })
  userid: Number;

  @Column("nvarchar", {
    name: "question",
    length: 50,
  })
  question: string;

  @Column("nvarchar", {
    name: "answer",
    length: 50,
  })
  answer: string;

  @Column("nvarchar", {
    name: "answerChoices",
    length: 50,
  })
  answerChoices: string;

  @Column("nvarchar", {
    name: "type",
    length: 50,
  })
  type: string;
}
