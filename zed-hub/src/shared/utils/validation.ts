export function isSafeUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith('/') && !url.startsWith('//')) return true;
  if (url.startsWith('data:image/svg+xml')) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function validateProductInput(input: {
  title: string;
  price: number;
  discountPrice?: number | null;
  stock: number;
  sku: string;
  categoryId: string;
}): string | null {
  if (!input.title || input.title.trim().length < 2) {
    return 'Product title must be at least 2 characters.';
  }
  if (Number.isNaN(input.price) || input.price < 0) {
    return 'Price must be a valid non-negative number.';
  }
  if (
    input.discountPrice !== undefined &&
    input.discountPrice !== null &&
    (input.discountPrice < 0 || input.discountPrice >= input.price)
  ) {
    return 'Discount price must be greater than or equal to 0 and less than regular price.';
  }
  if (Number.isNaN(input.stock) || input.stock < 0) {
    return 'Stock quantity must be 0 or greater.';
  }
  if (!input.sku || input.sku.trim().length < 2) {
    return 'SKU is required.';
  }
  if (!input.categoryId) {
    return 'Please select a category.';
  }
  return null;
}

export function validateAdInput(input: {
  title: string;
  targetUrl: string;
  imageUrl: string;
  startDate: number;
  endDate: number;
}): string | null {
  if (!input.title || input.title.trim().length < 2) {
    return 'Advertisement title is required.';
  }
  if (!input.imageUrl) {
    return 'Advertisement image is required.';
  }
  if (!isSafeUrl(input.targetUrl)) {
    return 'Target URL must be a valid https:// link or internal /path.';
  }
  if (input.endDate <= input.startDate) {
    return 'Expiration date must be later than the start date.';
  }
  return null;
}
