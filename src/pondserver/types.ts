import { IncomingMessage } from "http";

export interface PondGetRequest extends IncomingMessage {
  params: Record<string, string>;
  query: Record<string, string>;
  address: string;
  clientId?: string;
}

export interface PondPostRequest extends IncomingMessage {
  params: Record<string, string>;
  query: Record<string, string>;
  address: string;
  clientId?: string;
  body: Record<string, any>;
}

export interface PondPutRequest extends IncomingMessage {
  params: Record<string, string>;
  query: Record<string, string>;
  address: string;
  clientId?: string;
  body: Record<string, any>;
}

export interface PondDeleteRequest extends IncomingMessage {
  params: Record<string, string>;
  query: Record<string, string>;
  address: string;
  clientId?: string;
}

export interface PondPatchRequest extends IncomingMessage {
  params: Record<string, string>;
  query: Record<string, string>;
  address: string;
  clientId?: string;
  body: Record<string, any>;
}
