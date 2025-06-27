import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from 'src/auth/user.entity';
import { RegisterDto } from 'src/auth/dto/register.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/register')
  create(@Body() registerDto: RegisterDto): Promise<User> {
    return this.userService.create(registerDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    const user = this.userService.findOne(id);
    return user;
  }

  @Patch(':id')
  update(@Param('id') id: number,
  @Body() updateUserDto: RegisterDto,) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.userService.remove(id);
    return { message: `Item with ID ${id} deleted successfully` };
  }
}
