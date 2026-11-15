import type { NextFunction, Request, Response } from "express";
import type {
	TeacherProfileStatsDto,
	PublicUserProfileDto,
	ChangePasswordResponseDto,
} from "@viaquiz/shared-types";
import type { AuthenticatedUser } from "../../../types/token";
import type { PaginationLocals } from "../../../middlewares/paginationMiddleware";
import type {
	ChangeEmailInput,
	ChangePasswordInput,
	CheckUniqueDTO,
	CheckUniqueResponse,
	CreateUserDTO,
	LoginCredentials,
	RegisterCredentials,
	SendCodeDTO,
	SendCodeResponse,
	SendEmailChangeCodeInput,
	SendPasswordChangeCodeInput,
	TokenDTO,
	UpdateProfileInput,
	User,
	UserWithPassword,
} from "./users.types";
import type { VerificationCode } from "../../../generated/prisma";

export type UserRepositoryContract = {
	findByEmail: (email: string) => Promise<UserWithPassword>;
	findByLogin: (login: string) => Promise<UserWithPassword>;
	findById: (id: number) => Promise<User>;
	findByIdWithPassword: (id: number) => Promise<UserWithPassword>;
	create: (data: CreateUserDTO) => Promise<User>;
	updateProfile: (
		id: number,
		data: { firstName: string | null; lastName: string | null },
	) => Promise<User>;
	updateEmail: (id: number, email: string) => Promise<User>;
	updatePassword: (id: number, hashedPassword: string) => Promise<void>;
	findUsers: (pagination: { skip: number; take: number }) => Promise<User[]>;
	countUsers: () => Promise<number>;
	upsertVerificationCode: (data: {
		email: string;
		code: string;
		expiresAt: Date;
	}) => Promise<VerificationCode>;
	findVerificationCodeByEmail: (email: string) => Promise<VerificationCode>;
	incrementVerificationCodeAttempts: (
		email: string,
	) => Promise<VerificationCode>;
	deleteVerificationCode: (email: string) => Promise<VerificationCode>;
};

export type UserServiceContract = {
	checkUnique: (data: CheckUniqueDTO) => Promise<CheckUniqueResponse>;
	sendCode: (data: SendCodeDTO) => Promise<SendCodeResponse>;
	register: (credentials: RegisterCredentials) => Promise<TokenDTO>;
	login: (credentials: LoginCredentials) => Promise<TokenDTO>;
	me: (userId: number) => Promise<User>;
	updateProfile: (
		userId: number,
		data: UpdateProfileInput,
	) => Promise<User>;
	sendEmailChangeCode: (
		userId: number,
		data: SendEmailChangeCodeInput,
	) => Promise<SendCodeResponse>;
	changeEmail: (
		userId: number,
		data: ChangeEmailInput,
	) => Promise<TokenDTO>;
	sendPasswordChangeCode: (
		userId: number,
		data: SendPasswordChangeCodeInput,
	) => Promise<SendCodeResponse>;
	changePassword: (
		userId: number,
		data: ChangePasswordInput,
	) => Promise<ChangePasswordResponseDto>;
	getProfileStats: (userId: number) => Promise<TeacherProfileStatsDto>;
	getUsers: (pagination: {
		skip: number;
		take: number;
	}) => Promise<{ users: User[]; total: number }>;
	getPublicProfile: (uuid: string) => Promise<PublicUserProfileDto>;
};

export type UserControllerContract = {
	checkUnique: (
		req: Request<object, CheckUniqueResponse, CheckUniqueDTO>,
		res: Response<CheckUniqueResponse>,
		next: NextFunction,
	) => Promise<void>;
	sendCode: (
		req: Request<object, SendCodeResponse, SendCodeDTO>,
		res: Response<SendCodeResponse>,
		next: NextFunction,
	) => Promise<void>;
	register: (
		req: Request<object, TokenDTO, RegisterCredentials>,
		res: Response<TokenDTO>,
		next: NextFunction,
	) => Promise<void>;
	login: (
		req: Request<object, TokenDTO, LoginCredentials>,
		res: Response<TokenDTO>,
		next: NextFunction,
	) => Promise<void>;
	me: (
		req: Request<object, User, object, object, AuthenticatedUser>,
		res: Response<User, AuthenticatedUser>,
		next: NextFunction,
	) => Promise<void>;
	updateProfile: (
		req: Request<object, User, UpdateProfileInput, object, AuthenticatedUser>,
		res: Response<User, AuthenticatedUser>,
		next: NextFunction,
	) => Promise<void>;
	sendEmailChangeCode: (
		req: Request<
			object,
			SendCodeResponse,
			SendEmailChangeCodeInput,
			object,
			AuthenticatedUser
		>,
		res: Response<SendCodeResponse, AuthenticatedUser>,
		next: NextFunction,
	) => Promise<void>;
	changeEmail: (
		req: Request<object, TokenDTO, ChangeEmailInput, object, AuthenticatedUser>,
		res: Response<TokenDTO, AuthenticatedUser>,
		next: NextFunction,
	) => Promise<void>;
	sendPasswordChangeCode: (
		req: Request<
			object,
			SendCodeResponse,
			SendPasswordChangeCodeInput,
			object,
			AuthenticatedUser
		>,
		res: Response<SendCodeResponse, AuthenticatedUser>,
		next: NextFunction,
	) => Promise<void>;
	changePassword: (
		req: Request<
			object,
			ChangePasswordResponseDto,
			ChangePasswordInput,
			object,
			AuthenticatedUser
		>,
		res: Response<ChangePasswordResponseDto, AuthenticatedUser>,
		next: NextFunction,
	) => Promise<void>;
	getProfileStats: (
		req: Request<object, TeacherProfileStatsDto, object, object, AuthenticatedUser>,
		res: Response<TeacherProfileStatsDto, AuthenticatedUser>,
		next: NextFunction,
	) => Promise<void>;
	getUsers: (
		req: Request<
			object,
			User[],
			object,
			object,
			AuthenticatedUser & PaginationLocals
		>,
		res: Response<User[], AuthenticatedUser & PaginationLocals>,
		next: NextFunction,
	) => Promise<void>;
	getPublicProfile: (
		req: Request<{ uuid: string }, PublicUserProfileDto>,
		res: Response<PublicUserProfileDto>,
		next: NextFunction,
	) => Promise<void>;
};
