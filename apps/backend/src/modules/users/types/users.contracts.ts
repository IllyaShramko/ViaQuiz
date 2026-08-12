import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedUser } from "../../../types/token";
import type { PaginationLocals } from "../../../middlewares/paginationMiddleware";
import type {
	CreateUserDTO,
	LoginCredentials,
	RegisterCredentials,
	TokenDTO,
	User,
	UserWithPassword,
} from "./users.types";

export type UserRepositoryContract = {
	findByEmail: (email: string) => Promise<UserWithPassword | null>;
	findById: (id: number) => Promise<User | null>;
	create: (data: CreateUserDTO) => Promise<User>;
	findUsers: (pagination: { skip: number; take: number }) => Promise<User[]>;
	countUsers: () => Promise<number>;
};

export type UserServiceContract = {
	register: (credentials: RegisterCredentials) => Promise<TokenDTO>;
	login: (credentials: LoginCredentials) => Promise<TokenDTO>;
	me: (userId: number) => Promise<User>;
	getUsers: (pagination: { skip: number; take: number }) => Promise<{ users: User[]; total: number }>;
};

export type UserControllerContract = {
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
		req: Request<object, User[], object, object, AuthenticatedUser & PaginationLocals>,
		res: Response<User[], AuthenticatedUser & PaginationLocals>,
		next: NextFunction,
	) => Promise<void>;
};
