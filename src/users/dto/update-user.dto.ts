import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// On exclut le mot de passe de la mise à jour classique du profil :
// un changement de mot de passe doit passer par une route dédiée
// (ex: /auth/change-password), avec vérification de l'ancien mot de passe.
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
) {}