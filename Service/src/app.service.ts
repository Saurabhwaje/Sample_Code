import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Not, Repository } from 'typeorm';
import { User } from './user.entity';
import { createReadStream } from 'fs';
import { join } from 'path';
// import { HttpClient } from '@angular/common/http';

@Injectable()
export class AppService {

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ) {
  }

  async create(data: any): Promise<User> {
    return this.userRepository.save(data);
  }

  async findOne(conget: any): Promise<User> {
    return this.userRepository.findOne(conget);
  }

  async getUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async getSingleUser(id: number): Promise<User[]> {
    return await this.userRepository.find({
      select: ["name", "email", "id", "mobile_no"],
      where: [{ "id": id }]
    });
  }

  async getUserList(id: number): Promise<User[]> {
    const options: FindManyOptions<User> = {
      where: {
        id: id,
      },
    };
    return this.userRepository.find(options);
  }

  async convertToBlob(file: any): Promise<Blob> {
    console.log("REACHED HSHCOSHOC");
    const path = join(__dirname, '..', 'uploads', file.filename);
    const readStream = createReadStream(path);
    const chunks = [];
    for await (const chunk of readStream) {
      chunks.push(chunk);
    }
    const blob = new Blob(chunks, { type: file.mimetype });
    return blob;
  }
  
  async findAllExceptCurrentUser(id: number): Promise<User[]> {
    return this.userRepository.find({
      where: { id: Not(id), },
    });
  }

  getHello(): string {
    return 'Hello World!';
  }
}
