declare namespace Express {
  export interface Request {
    user?: {
      email: string;
      sub: string;
      roles: string[];
    };
  }
}
