import { ICompany, IUserCompany } from '@everbyte/contracts';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity, UserCompany } from '@database/entities/internal';

@Entity('companies')
export class Company extends BaseEntity implements ICompany {
	@ApiProperty({ type: () => String })
	@Index()
	@Column()
	name: string;

	/*
    |--------------------------------------------------------------------------
    | @OneToMany
    |--------------------------------------------------------------------------
    */

	/**
	 * User companies
	 */
	@ApiProperty({ type: () => UserCompany, isArray: true })
	@OneToMany(() => UserCompany, (userCompany) => userCompany.company)
	users: IUserCompany[];
}
