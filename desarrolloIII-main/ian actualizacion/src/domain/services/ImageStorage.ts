export type UploadInput = {
  buffer: Buffer;
  mimeType: string;
  filename: string;
};

export type UploadResult = {
  url: string;
  storageKey: string;
};

export interface ImageStorage {
  upload(input: UploadInput): Promise<UploadResult>;
  delete(storageKey: string): Promise<void>;
}
