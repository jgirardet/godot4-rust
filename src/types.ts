export type FullPathDir = string;
export type FullPathFile = string;
export type FullPath = FullPathDir | FullPathFile;
export type Name = string;

export type CargoComandResult = CargoError | CargoSuccess;

export interface CargoError {
  error: string;
}

export interface CargoSuccess {
  ok: string;
}
