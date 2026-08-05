export class UserResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  city?: string;
  avatar?: string;
  role: string;
  isVerified: boolean;
  createdAt: Date;
} 