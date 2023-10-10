import { BadRequestException, Body, Controller, Get, InternalServerErrorException, Param, ParseIntPipe, Post, Query, Req, Res, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { MessageDto } from './messageDTO';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
//import { AuthService } from './auth/auth.service';
import { User } from './user.entity';
import { Not } from 'typeorm';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { createWriteStream } from 'fs';


@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService, private jwtService: JwtService,) { }

  @Post('register')
  async register(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('password') password: string
    //@Body('contactNo') contactNo: string
    //@Body('alternateContactNo') alternateContactNo: string
  ) {
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await this.appService.create({
      name,
      email,
      password: hashedPassword,
      // contactNo,
      // alternateContactNo
    });
    delete user.password;
    return user;
  }

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) response: Response
  ) {
    const user = await this.appService.findOne({ where: { email } });

    if (!user) {
      throw new BadRequestException('invalid credentials');
    }

    if (!await bcrypt.compare(password, user.password)) {
      throw new BadRequestException('invalid credentials');
    }

    const jwt = await this.jwtService.signAsync({ id: user.id });

    response.cookie('jwt', jwt, { httpOnly: true });

    return {
      message: 'success',
      user: user.name // Add the user name to the response
    };
  }

  @Get('user')
  async user(@Req() request: Request) {
    //  console.log("Login DATA :",request);
    try {
      const cookie = request.cookies['jwt'];

      const data = await this.jwtService.verifyAsync(cookie);

      if (!data) {
        throw new UnauthorizedException();
      }

      const user = await this.appService.findOne({ where: { id: data['id'] } });

      const { password, ...result } = user;

      return result;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        cb(null, file.originalname);
      },
    }),
  }))
  async uploadFile(@UploadedFile() file) {
    const blob = await this.appService.convertToBlob(file);
    console.log(blob);
    return blob;
  }
  
  @Post('abc')
  async uploadFile2(@Body() fileData: any) {
    try {
      const fileName = fileData.fileName;
      const base64Data = fileData.base64Data;

      // Convert base64 data to a Buffer
      const buffer = Buffer.from(base64Data, 'base64');
      console.log("BUFFER >> ", buffer);

      // Create a Blob from the Buffer
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      console.log("BLOB >> ", blob);

      // Define the file path
      const filePath = join(__dirname, '../uploads', fileName);
      
      // Write the buffer data to the file
      const writeStream = createWriteStream(filePath);
      writeStream.write(buffer);
      writeStream.end();

      return {
        message: `File ${fileName} uploaded successfully`,
        filePath: filePath,
        blob: blob 
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new InternalServerErrorException('File upload failed');
    }
  }

  @Post('poiu')
  async getData(@Body() body: any): Promise<any> {
    console.log("NJUIIUDUIS ", body);
    return { response: "Data received successfully." };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('jwt');
    return {
      message: 'success'
    }
  }

  @Get('getalluserslist')
  getAllUsers() {
    return this.appService.getUsers();
  }

  @Get('/:id')
  get(@Param() params) {
    return this.appService.getSingleUser(params.id);
  }
}
