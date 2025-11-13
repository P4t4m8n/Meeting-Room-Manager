import type { IDTO } from "../models/DTO.model";
import type { THttpResponse } from "../models/Http.model";
import { apiService } from "../services/api.service";
import { AppError } from "./AppError";

export const genericServiceFactory = <
  DTO extends IDTO,
  EditDTO extends IDTO,
  Filter
>({
  rootPath,
}: {
  rootPath: string;
}) => {
  return {
    get: async (filter?: Filter | null): Promise<THttpResponse<Array<DTO>>> => {
      return await apiService.get<Array<DTO>>(`${rootPath}`, filter);
    },

    getById: async (id?: string): Promise<THttpResponse<DTO | null>> => {
      return await apiService.get<DTO | null>(`${rootPath}/${id}`);
    },

    save: async (dto?: EditDTO | null): Promise<THttpResponse<DTO>> => {
      if (!dto) throw AppError.create("Data is required", 404);

      const { id } = dto;

      if (!id || id.startsWith("temp/")) {
        return await apiService.post<DTO>(`${rootPath}/edit`, dto);
      }

      return await apiService.put<DTO>(`${rootPath}/edit/${dto.id}`);
    },

    remove: async (id?: string): Promise<THttpResponse<void>> => {
      return await apiService.delete<void>(`${rootPath}/${id}`);
    },
  };
};
