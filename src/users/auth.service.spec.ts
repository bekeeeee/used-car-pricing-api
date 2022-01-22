import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;
  beforeEach(async () => {
    const users: User[] = [];
    // Create a fake copy of the users service
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },

      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 9999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('create a new user with a salted and hashed password', async () => {
    const user = await service.signup('asd@asd.com', 'asdf');
    expect(user.password).not.toEqual('asdf');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throw an error if user signs up with email that is in use', async () => {
    await service.signup('asd@asd.com', 'asdf');

    try {
      await service.signup('asd@asd.com', 'asdf');
    } catch (err) {
      expect(err).toBeInstanceOf(BadRequestException);
      expect(err.message).toBe('email in use');
    }
  });

  it('throws if signin is called with an unused email', async () => {
    // fakeUsersService.find = () => Promise.resolve([]);

    try {
      await service.signin('asdda@asd.com', 'asd');
    } catch (err) {
      expect(err).toBeInstanceOf(NotFoundException);
      expect(err.message).toBe('user not found');
    }
  });

  it('throws if an invalid password is provided', async () => {
    await service.signup('asfd@asd.com', 'asdf');

    try {
      await service.signin('asfd@asd.com', 'password');
    } catch (err) {
      expect(err).toBeInstanceOf(BadRequestException);
      expect(err.message).toBe('bad password');
    }
  });

  it('return a user if correct password is provided', async () => {
    await service.signup('aassssd@asd.com', 'asdf');
    const user = await service.signin('aassssd@asd.com', 'asdf');
    expect(user).toBeDefined();
  });
});
