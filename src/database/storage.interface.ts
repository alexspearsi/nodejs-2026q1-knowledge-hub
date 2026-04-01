export interface StorageService<T> {
  findAll(): T[];
  findById(id: string): T | undefined;
  create(entity: T): T;
  update(id: string, data: Omit<T, 'id'>): T | null;
  delete(id: string): boolean;
}
