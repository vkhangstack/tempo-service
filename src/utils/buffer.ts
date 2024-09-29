export const getBytes = (value: string) => {
  return new Blob([value]).size;
};

export const getMB = (bytes: number) => {
  return bytes / (1024 * 1024);
};
