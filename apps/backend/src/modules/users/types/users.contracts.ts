import type { NextFunction, Request, Response } from "express";
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
	findByEmail: (email: string) => Promise<UserWithPassword | null>;
	findByLogin: (login: string) => Promise<UserWithPassword | null>;
	findById: (id: number) => Promise<User | null>;
	create: (data: CreateUserDTO) => Promise<User>;
	findUsers: (pagination: { skip: number; take: number }) => Promise<User[]>;
	countUsers: () => Promise<number>;
	upsertVerificationCode: (data: {
		email: string;
		code: string;
		expiresAt: Date;
	}) => Promise<VerificationCode>;
	findVerificationCodeByEmail: (
		email: string,
	) => Promise<VerificationCode | null>;
	incrementVerificationCodeAttempts: (
		email: string,
	) => Promise<VerificationCode>;
	deleteVerificationCode: (email: string) => Promise<VerificationCode | null>;
};

export type UserServiceContract = {
	checkUnique: (data: CheckUniqueDTO) => Promise<CheckUniqueResponse>;
	sendCode: (data: SendCodeDTO) => Promise<SendCodeResponse>;
	register: (credentials: RegisterCredentials) => Promise<TokenDTO>;
	login: (credentials: LoginCredentials) => Promise<TokenDTO>;
	me: (userId: number) => Promise<User>;
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
