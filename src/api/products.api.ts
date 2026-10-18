import { ApiClient } from './ApiClient';
import { isApiError } from './ApiError';
import { buildProductsUrl } from '../utils/url';
import type {
  CatalogParams,
  Category,
  Product,
  ProductsResponse,
} from '../types/product';

const api = new ApiClient('https://dummyjson.com');

export function fetchProducts(
  params: CatalogParams,
  signal?: AbortSignal,
): Promise<ProductsResponse> {
  return api.get<ProductsResponse>(buildProductsUrl(params), signal);
}

export function fetchCategories(signal?: AbortSignal): Promise<Category[]> {
  return api.get<Category[]>('/products/categories', signal);
}

/** Returns null when the product does not exist (HTTP 404). */
export async function fetchProduct(
  id: number,
  signal?: AbortSignal,
): Promise<Product | null> {
  try {
    return await api.get<Product>(`/products/${id}`, signal);
  } catch (e) {
    if (isApiError(e) && e.status === 404) return null;
    throw e;
  }
}

export async function fetchRelated(
  category: string,
  excludeId: number,
  signal?: AbortSignal,
): Promise<Product[]> {
  const res = await api.get<ProductsResponse>(
    `/products/category/${encodeURIComponent(category)}?limit=5`,
    signal,
  );
  return res.products.filter((p) => p.id !== excludeId).slice(0, 4);
}
