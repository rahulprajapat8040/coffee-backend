import { describe, expect, it } from 'vitest';
import { OfferTargetType } from '../../../lib/utils/enums/enum.js';
import {
  getBestOfferForCoffee,
  getOfferDiscountCents,
} from './order.service.js';

const makeOffer = (
  id: string,
  targetType: OfferTargetType,
  discountPercentage: string,
  coffeeIds: string[] = [],
  categoryIds: string[] = [],
) => ({
  id,
  title: id,
  targetType,
  discountPercentage,
  coffeeIds,
  categoryIds,
});

describe('order offer pricing', () => {
  it('chooses the highest eligible offer without combining discounts', () => {
    const offers = [
      makeOffer('all', OfferTargetType.ALL_PRODUCTS, '10'),
      makeOffer(
        'coffee',
        OfferTargetType.SELECTED_COFFEES,
        '25',
        ['coffee-1'],
      ),
      makeOffer(
        'category',
        OfferTargetType.SELECTED_CATEGORIES,
        '15',
        [],
        ['category-1'],
      ),
    ];

    expect(
      getBestOfferForCoffee('coffee-1', 'category-1', offers)?.id,
    ).toBe('coffee');
    expect(
      getBestOfferForCoffee('coffee-2', 'category-1', offers)?.id,
    ).toBe('category');
    expect(
      getBestOfferForCoffee('coffee-2', 'category-2', offers)?.id,
    ).toBe('all');
  });

  it('rounds discounts to cents and never discounts more than the item price', () => {
    expect(getOfferDiscountCents(349, '12.5')).toBe(44);
    expect(getOfferDiscountCents(349, '100')).toBe(349);
    expect(getOfferDiscountCents(349)).toBe(0);
  });
});
