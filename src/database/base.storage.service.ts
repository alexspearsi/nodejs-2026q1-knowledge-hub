import { StorageService } from './storage.interface';

export class BaseStorageService<T extends { id: string }>
  implements StorageService<T>
{
  protected entities: T[] = [];

  findAll(): T[] {
    return this.entities;
  }

  findById(id: string): T | undefined {
    return this.entities.find((entity) => entity.id === id);
  }

  create(entity: T): T {
    this.entities.push(entity);

    return entity;
  }

  update(id: string, data: Omit<T, 'id'>): T | null {
    const entity = this.entities.find((entity) => entity.id === id);

    if (!entity) {
      return null;
    }

    Object.assign(entity, data);

    return entity;
  }

  delete(id: string): boolean {
    const index = this.entities.findIndex((entity) => entity.id === id);

    if (index === -1) {
      return false;
    }

    this.entities.splice(index, 1);

    return true;
  }
}
