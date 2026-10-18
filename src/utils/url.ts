import type { CatalogParams } from '../types/product';

export const PAGE_SIZE = 12;

export function buildProductsUrl(params: CatalogParams): string {
  const { q, category, sort, page = 1, limit = PAGE_SIZE } = params;
  const skip = (page - 1) * limit;

  let path: string;
  if (q) {
    path = `/products/search?q=${encodeURIComponent(q)}`;
  } else if (category) {
    path = `/products/category/${encodeURIComponent(category)}`;
  } else {
    path = '/products';
  }

  const parts: string[] = [`limit=${limit}`, `skip=${skip}`];

  if (sort) {
    const [sortBy, order] = sort.split('-');
    if (sortBy && order) {
      parts.push(`sortBy=${sortBy}`);
      parts.push(`order=${order}`);
    }
  }

  const sep = path.includes('?') ? '&' : '?';
  return `https://dummyjson.com${path}${sep}${parts.join('&')}`;
}
