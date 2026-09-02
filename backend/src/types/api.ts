export interface ApiError {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}