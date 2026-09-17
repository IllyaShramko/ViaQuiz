import type { Socket, Server as SocketIOServer } from "socket.io";
import type {
	ClientToServerEvents,
	ServerToClientEvents,
	InterServerEvents,
	SocketData,
} from "@viaquiz/shared-types";

export type {
	ClientToServerEvents,
	ServerToClientEvents,
	InterServerEvents,
	SocketData,
};

export type AuthenticatedSocket = Socket<
	ClientToServerEvents,
	ServerToClientEvents,
	InterServerEvents,
	SocketData
>;

export type ServerSocket = SocketIOServer<
	ClientToServerEvents,
	ServerToClientEvents,
	InterServerEvents,
	SocketData
>;

export interface SocketController {
	registerHandlers: (
		socket: AuthenticatedSocket,
		ioServer: ServerSocket,
	) => void;
}
