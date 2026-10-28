export type FieldType = '5 người' | '7 người';

export type FieldStatus = 'Hoạt động' | 'Bảo trì';

export interface FootballField {
  id: string;
  name: string;
  type: FieldType;
  pricePerHour: number;
  status: FieldStatus;
  description?: string;
}

export type CreateFieldDTO = Omit<FootballField, 'id'>;

export type UpdateFieldDTO = Partial<CreateFieldDTO>;
