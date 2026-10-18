import { discountedPrice, formatPrice } from '../../utils/format';

interface PriceBlockProps {
  price: number;
  discountPercentage: number;
  large?: boolean;
}

export function PriceBlock({ price, discountPercentage, large = false }: PriceBlockProps) {
  const hasDiscount = discountPercentage >= 1;
  const final = hasDiscount ? discountedPrice(price, discountPercentage) : price;
  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <span className={`font-bold ${large ? 'text-3xl' : 'text-lg'}`}>{formatPrice(final)}</span>
      {hasDiscount && (
        <>
          <span className="text-sm text-gray-500 line-through">{formatPrice(price)}</span>
          <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs font-semibold text-success dark:bg-green-900 dark:text-green-300">
            −{Math.round(discountPercentage)}%
          </span>
        </>
      )}
    </div>
  );
}
