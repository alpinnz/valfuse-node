import express from "express";
import type { Response } from "express";
import { createSchema, t } from "@valfuse-node/validation";
import {
  validateBody,
  validateParams,
  validateQuery,
  type ExpressBodyLocals,
  type ExpressLocalizationLocals,
  type ExpressParamsLocals,
  type ExpressQueryLocals,
} from "@valfuse-node/express";

type CreateUserBody = {
  name: string;
  email: string;
};

type FindUserParams = {
  userId: string;
};

type ListUsersQuery = {
  limit: number;
};

const createUserSchema = createSchema({
  name: {
    type: "string",
    transform: t.trim,
    rules: [{ name: "required", error: { message: "Name is required." } }],
  },
  email: {
    type: "string",
    transform: t.pipe(t.trim, t.toLowerCase),
    rules: [
      { name: "required", error: { message: "Email is required." } },
      { name: "email", error: { message: "Enter a valid email address." } },
    ],
  },
});

const findUserParamsSchema = createSchema({
  userId: {
    type: "string",
    rules: [{ name: "required", error: { message: "User ID is required." } }],
  },
});

const listUsersQuerySchema = createSchema({
  limit: {
    type: "number",
    transform: t.toInteger,
    rules: [
      { name: "required", error: { message: "Limit is required." } },
      { name: "min", value: 1, error: { message: "Limit must be positive." } },
    ],
  },
});

export const usersRouter = express.Router();

usersRouter.get(
  "/users",
  validateQuery<ListUsersQuery>(listUsersQuerySchema),
  (_request, response: Response<unknown, ExpressQueryLocals<ListUsersQuery>>) => {
    response.json({ limit: response.locals.validatedQuery.limit });
  }
);

usersRouter.get(
  "/users/:userId",
  validateParams<FindUserParams>(findUserParamsSchema),
  (_request, response: Response<unknown, ExpressParamsLocals<FindUserParams>>) => {
    response.json({ userId: response.locals.validatedParams.userId });
  }
);

usersRouter.post(
  "/users",
  validateBody<CreateUserBody>(createUserSchema),
  (
    _request,
    response: Response<unknown, ExpressBodyLocals<CreateUserBody> & ExpressLocalizationLocals>
  ) => {
    const user = response.locals.validatedBody;
    const { localization } = response.locals;

    response.status(201).json({
      user,
      message: localization.format("common.user_created", { name: user.name }),
    });
  }
);
