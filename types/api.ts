export interface Result<T = any> {
  error: number;
  message: string;
  data?: T;
}
