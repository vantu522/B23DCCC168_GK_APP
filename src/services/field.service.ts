import { storageService } from './storage.service';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { INITIAL_FIELDS } from '../constants/initialData';
import { FootballField, CreateFieldDTO, UpdateFieldDTO } from '../types/field.types';

export const fieldService = {
  async getFields(): Promise<FootballField[]> {
    const fields = await storageService.getItem<FootballField[]>(STORAGE_KEYS.FIELDS);
    if (fields === null) {
      await storageService.setItem(STORAGE_KEYS.FIELDS, INITIAL_FIELDS);
      return INITIAL_FIELDS;
    }
    return fields;
  },

  async getFieldById(id: string): Promise<FootballField | null> {
    const fields = await this.getFields();
    return fields.find(f => f.id === id) || null;
  },

  async isNameDuplicate(name: string, excludeId?: string): Promise<boolean> {
    const fields = await this.getFields();
    const normalizedName = name.trim().toLowerCase();
    return fields.some(
      f => f.id !== excludeId && f.name.trim().toLowerCase() === normalizedName
    );
  },

  async createField(dto: CreateFieldDTO): Promise<FootballField> {
    const isDuplicate = await this.isNameDuplicate(dto.name);
    if (isDuplicate) {
      throw new Error(`Tên sân "${dto.name}" đã tồn tại. Vui lòng nhập tên khác.`);
    }

    const fields = await this.getFields();
    const newField: FootballField = {
      ...dto,
      id: 'san_' + Date.now(),
    };
    const updated = [newField, ...fields];
    await storageService.setItem(STORAGE_KEYS.FIELDS, updated);
    return newField;
  },

  async updateField(id: string, dto: UpdateFieldDTO): Promise<FootballField> {
    if (dto.name) {
      const isDuplicate = await this.isNameDuplicate(dto.name, id);
      if (isDuplicate) {
        throw new Error(`Tên sân "${dto.name}" đã tồn tại. Vui lòng chọn tên khác.`);
      }
    }

    const fields = await this.getFields();
    const index = fields.findIndex(f => f.id === id);
    if (index === -1) {
      throw new Error('Không tìm thấy sân bóng cần sửa');
    }

    const updatedField: FootballField = {
      ...fields[index],
      ...dto,
    };
    fields[index] = updatedField;
    await storageService.setItem(STORAGE_KEYS.FIELDS, fields);
    return updatedField;
  },

  async deleteField(id: string): Promise<boolean> {
    const fields = await this.getFields();
    const filtered = fields.filter(f => f.id !== id);
    await storageService.setItem(STORAGE_KEYS.FIELDS, filtered);
    return true;
  },

  async resetDefault(): Promise<FootballField[]> {
    await storageService.setItem(STORAGE_KEYS.FIELDS, INITIAL_FIELDS);
    return INITIAL_FIELDS;
  },
};
