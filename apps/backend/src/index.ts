import express from "express";
import type { User } from "@viaquiz/shared-types";

const app = express();
app.use(express.json());

app.get("/users", (req, res) => {
	const users: User[] = [
		{
			id: "1",
			email: "test@test.com",
			name: "Test",
			role: "user",
			createdAt: new Date().toISOString(),
		},
	];
	res.json(users);
});

app.get("/health", (req, res) => {
	res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(3000, () => {
	console.log("Backend running on http://localhost:3000");
});
