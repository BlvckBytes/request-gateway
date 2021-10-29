/**
 * A handler is an endpoint which can be registered
 * inside the config file
 */
export interface IHandler {
  host: string;
  port: number;
  https: boolean;
}
