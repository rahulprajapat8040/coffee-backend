import { CommonQueryDTO } from '../dto/common-query.dto.js';

export const otpGenerator = (size: number) => {
  const value = Math.pow(10, size - 1);
  const otp = Math.floor(value + Math.random() * (9 * value));
  return String(otp);
};

export const responseSender = (
  message: string,
  status: number,
  success: boolean,
  data: object | [] | string | number | null | boolean,
) => {
  return { message, status, data, success };
};

export const generatePagination = <T>(
  data: { rows: T[]; count: number },
  page: number,
  limit: number,
) => {
  return {
    data: data.rows,
    pageInfo: {
      total: data.count,
      page: Number(page),
      totalPage: Math.ceil(data.count / limit),
      limit,
    },
  };
};

export function getPagination(query: CommonQueryDTO) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    offset,
  };
}