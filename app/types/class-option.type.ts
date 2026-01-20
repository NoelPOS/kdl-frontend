// Type definitions for Class Options management

export type ClassOptionType = 'camp' | 'fixed' | 'check';

export interface ClassOption {
  id: number;
  classMode: string;
  classLimit: number;
  tuitionFee: number;
  effectiveStartDate: string;
  effectiveEndDate: string | null;
  optionType: ClassOptionType;
}

export interface CreateClassOptionDto {
  classMode: string;
  classLimit: number;
  tuitionFee: number;
  effectiveStartDate: string;
  effectiveEndDate?: string;
  optionType?: ClassOptionType;
}

export interface UpdateClassOptionDto {
  classMode?: string;
  classLimit?: number;
  tuitionFee?: number;
  effectiveStartDate?: string;
  effectiveEndDate?: string;
  optionType?: ClassOptionType;
}
