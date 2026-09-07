import type { NextFunction, Request, Response } from "express";
import type { TeacherProfileStatsDto } from "@viaquiz/shared-types";
import type { AuthenticatedUser } from "../../../types/token";
import type { PaginationLocals } from "../../../middlewares/paginationMiddleware";
import type {
	CheckUniqueDTO,
	CheckUniqueResponse,
	CreateUserDTO,
	LoginCredentials,
	RegisterCredentials,
	SendCodeDTO,
	SendCodeResponse,
	TokenDTO,
	User,
	UserWithPassword,
} from "./users.types";
import type { VerificationCode } from "../../../generated/prisma";

export type UserRepositoryContract = {
	findByEmail: (email: string) => Promise<UserWithPassword>;
	findByLogin: (login: string) => Promise<UserWithPassword>;
	findById: (id: number) => Promise<User>;
	create: (data: CreateUserDTO) => Promise<User>;
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
	getProfileStats: (userId: number) => Promise<TeacherProfileStatsDto>;
	getUsers: (pagination: {
		skip: number;
		take: number;
	}) => Promise<{ users: User[]; total: number }>;
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
};
