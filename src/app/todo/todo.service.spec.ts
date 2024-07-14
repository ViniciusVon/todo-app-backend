import { Test, TestingModule } from '@nestjs/testing';
import { TodoService } from './todo.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TodoEntity } from './entity/todo.entity';
import { Repository, UpdateDescription } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import exp from 'constants';
import { UpdateTodoDto } from './dto/update-todo.dto';

const todoEntityList: TodoEntity[] = [
  new TodoEntity({ task: 'task-1', isDone: 0 }),
  new TodoEntity({ task: 'task-2', isDone: 0 }),
  new TodoEntity({ task: 'task-3', isDone: 0 }),
]

const updatedTodoEntityItem = new TodoEntity({ task: 'task-1', isDone: 1});

describe('TodoService', () => {
  let todoService: TodoService;
  let todoRepository: Repository<TodoEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TodoService,
        {
          provide: getRepositoryToken(TodoEntity),
          useValue: {
            find: jest.fn().mockResolvedValue(todoEntityList),
            findOneOrFail: jest.fn().mockResolvedValue(todoEntityList[0]),
            create: jest.fn().mockReturnValue(todoEntityList[0]),
            merge: jest.fn().mockReturnValue(updatedTodoEntityItem),
            save: jest.fn().mockResolvedValue(todoEntityList[0]),
            softDelete: jest.fn().mockReturnValue(undefined),
          },
        },
      ],
    }).compile();

    todoService = module.get<TodoService>(TodoService);
    todoRepository = module.get<Repository<TodoEntity>>(
      getRepositoryToken(TodoEntity));
  });

  it('should be defined', () => {
    expect(todoService).toBeDefined();
    expect(todoRepository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a todo entity list entity sucessfully', async () => {
      // Act
      const result = await todoService.findAll();

      // Assert
      expect(result).toEqual(todoEntityList);
      expect(todoRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should throw an exception', () => {
      // Arrange
      jest.spyOn(todoRepository, 'find').mockRejectedValueOnce(new Error());

      // Assert
      expect(todoService.findAll()).rejects.toThrow(new Error());
    });
  });

  describe('findOneOrFail', () => {
    it('should return a todo entity item sucessfully', async () => {
      // Act
      const result = await todoService.findOneOrFail('1');

      // Assert
      expect(result).toEqual(todoEntityList[0]);
      expect(todoRepository.findOneOrFail).toHaveBeenCalledTimes(1);
    });

    it('should throw a not found exception', () => {
      // Arrange
      jest.spyOn(todoRepository, 'findOneOrFail').mockRejectedValueOnce(new Error());

      // Assert
      expect(todoService.findOneOrFail('1')).rejects.toThrow(NotFoundException);
    });
  });

  
  describe('create', () => {
    it('should create a new todo entity item sucessfully', async () => {
      // Arrange
      const data: CreateTodoDto = {
        task: 'task-1',
        isDone: 0,
      };

      // Act
      const result = await todoService.create(data);

      // Assert
      expect(result).toEqual(todoEntityList[0]);
      expect(todoRepository.create).toHaveBeenCalledTimes(1);
      expect(todoRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should throw an exception', () => {
      // Arrange
      const data: CreateTodoDto = {
        task: 'task-1',
        isDone: 0,
      };

      jest.spyOn(todoRepository, 'save').mockRejectedValueOnce(new Error());

      // Assert
      expect(todoService.create(data)).rejects.toThrow(new Error());
    });
  });
  
  describe('update', () => {
    it('should update a todo entity item sucessfully', async () => {
      // Arrange
      const data: UpdateTodoDto = {
        task: 'task-1',
        isDone: 1,
      };

      // Mockando o save para dar certo no expect
      jest.spyOn(todoRepository, 'save').mockResolvedValueOnce(updatedTodoEntityItem);
      // Act
      const result = await todoService.update('1', data);

      // Assert
      expect(result).toEqual(updatedTodoEntityItem);
    });

    it('should throw a not found exception', () => {
      // Arrange
      jest.spyOn(todoRepository, 'findOneOrFail').mockRejectedValueOnce(new Error());

      const data: UpdateTodoDto = {
        task: 'task-1',
        isDone: 1,
      };

      // Assert
      expect(todoService.update('1', data)).rejects.toThrow(NotFoundException);
    });

    it('should throw an exception', () => {
      // Arrange
      jest.spyOn(todoRepository, 'save').mockRejectedValueOnce(new Error());

      const data: UpdateTodoDto = {
        task: 'task-1',
        isDone: 1,
      };

      // Assert
      expect(todoService.update('1', data)).rejects.toThrow(new Error());
    });
  });

  describe('deleteById', () => {
    it('should delete a todo entity item sucessfully', async () => {
      // Act
      const result = await todoService.deleteById('1');

      // Assert
      expect(result).toBeUndefined();
      expect(todoRepository.findOneOrFail).toHaveBeenCalledTimes(1);
      expect(todoRepository.softDelete).toHaveBeenCalledTimes(1);
    });

    it('should throw a not found exception', () => {
      // Arrange
      jest.spyOn(todoRepository, 'findOneOrFail').mockRejectedValueOnce(new Error());

      // Assert
      expect(todoService.deleteById('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw an exception', () => {
      // Arrange
      jest.spyOn(todoRepository, 'softDelete').mockRejectedValueOnce(new Error());

      // Assert
      expect(todoService.deleteById('1')).rejects.toThrow(new Error());
    });
  });
});
