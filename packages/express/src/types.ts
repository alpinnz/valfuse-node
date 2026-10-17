import type { RequestHandler } from "express";
import type { ParamsDictionary, Query } from "express-serve-static-core";
import type { NamespacedLocalizer } from "@valfuse-node/localization/runtime";

export type { InterpolationParams, NamespacedLocalizer } from "@valfuse-node/localization/runtime";

export interface ExpressLocalization extends NamespacedLocalizer {
  readonly locale: string;
  /** Persist and apply a supported locale to this response. Returns false for unsupported locales. */
  setLocale(locale: string): boolean;
  namespace(scope: string): NamespacedLocalizer;
}

export interface ExpressBodyLocals<TBody> extends Record<string, unknown> {
  validatedBody: TBody;
}

export interface ExpressParamsLocals<TParams> extends Record<string, unknown> {
  validatedParams: TParams;
}

export interface ExpressQueryLocals<TQuery> extends Record<string, unknown> {
  validatedQuery: TQuery;
}

export interface ExpressHeadersLocals<THeaders> extends Record<string, unknown> {
  validatedHeaders: THeaders;
}

export interface ExpressCookiesLocals<TCookies> extends Record<string, unknown> {
  validatedCookies: TCookies;
}

export interface ExpressFileLocals<TFile> extends Record<string, unknown> {
  validatedFile: TFile;
}

export interface ExpressFilesLocals<TFile> extends Record<string, unknown> {
  validatedFiles: TFile[] | Record<string, TFile[]>;
}

export interface ExpressLocalizationLocals extends Record<string, unknown> {
  localization: ExpressLocalization;
}

export type ExpressBodyMiddleware<TBody> = RequestHandler<
  ParamsDictionary,
  unknown,
  unknown,
  Query,
  ExpressBodyLocals<TBody>
>;

export type ExpressParamsMiddleware<TParams> = RequestHandler<
  ParamsDictionary,
  unknown,
  unknown,
  Query,
  ExpressParamsLocals<TParams>
>;

export type ExpressQueryMiddleware<TQuery> = RequestHandler<
  ParamsDictionary,
  unknown,
  unknown,
  Query,
  ExpressQueryLocals<TQuery>
>;

export type ExpressHeadersMiddleware<THeaders> = RequestHandler<
  ParamsDictionary,
  unknown,
  unknown,
  Query,
  ExpressHeadersLocals<THeaders>
>;

export type ExpressCookiesMiddleware<TCookies> = RequestHandler<
  ParamsDictionary,
  unknown,
  unknown,
  Query,
  ExpressCookiesLocals<TCookies>
>;

export type ExpressFileMiddleware<TFile> = RequestHandler<
  ParamsDictionary,
  unknown,
  unknown,
  Query,
  ExpressFileLocals<TFile>
>;

export type ExpressFilesMiddleware<TFile> = RequestHandler<
  ParamsDictionary,
  unknown,
  unknown,
  Query,
  ExpressFilesLocals<TFile>
>;

export type ExpressLocalizationMiddleware = RequestHandler<
  ParamsDictionary,
  unknown,
  unknown,
  Query,
  ExpressLocalizationLocals
>;
