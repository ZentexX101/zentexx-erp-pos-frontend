// Row number across pages for a table's "#" column. meta: { page, limit } from the list response
export const rowNumber = (meta, index) => (meta ? (meta.page - 1) * meta.limit : 0) + index + 1;
