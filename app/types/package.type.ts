export interface Package {
  id: number;
  studentId: number;
  studentName: string;
  classOptionId: number;
  classOptionTitle: string;
  classMode: string;
  tuitionFee: number;
  classLimit: number;
  purchaseDate: string;
  status: "used" | "not_used";
  isRedeemed: boolean;
  redeemedAt?: string;
  redeemedCourseId?: number;
  redeemedCourseName?: string;
}

export interface PackagePurchaseRequest {
  studentId: number;
  studentName: string;
  classOptionId: number;
  classOptionTitle: string;
  classMode: string;
  tuitionFee: number;
  classLimit: number;
}
