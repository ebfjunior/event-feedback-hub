import { describe, it, expect } from 'vitest';
import {
  whereForFilters,
  whereForNewestKeyset,
  whereForHighestKeyset,
  orderByForNewest,
  orderByForHighest,
} from '@/lib/queries/feedbacks';

describe('lib/queries/feedbacks', () => {
  it('whereForFilters builds AND clauses based on provided filters', () => {
    expect(whereForFilters({})).toEqual({ AND: [{}, {}] });
    expect(whereForFilters({ eventId: 'evt' })).toEqual({ AND: [{ eventId: 'evt' }, {}] });
    expect(whereForFilters({ rating: 5 })).toEqual({ AND: [{}, { rating: 5 }] });
    expect(whereForFilters({ eventId: 'evt', rating: 3 })).toEqual({ AND: [{ eventId: 'evt' }, { rating: 3 }] });
  });

  it('whereForNewestKeyset adds keyset pagination when key provided', () => {
    const base = whereForFilters({ eventId: 'evt' });
    const createdAtIso = '2024-01-01T00:00:00.000Z';
    const key = { createdAtIso, id: 'id_10' };
    const res = whereForNewestKeyset(base, key);

    // Base preserved
    expect(res).toHaveProperty('AND');
    const andArr = (res as { AND: unknown[] }).AND;
    expect(andArr.length).toBe(2);
    expect(andArr[0]).toEqual(base);

    // Keyset condition
    const or = (andArr[1] as { OR: unknown[] }).OR as Array<unknown>;
    // createdAt lt branch
    const ltBranch = or[0] as { createdAt: { lt: Date } };
    expect(ltBranch.createdAt.lt).toBeInstanceOf(Date);
    expect(ltBranch.createdAt.lt.getTime()).toBe(new Date(createdAtIso).getTime());

    // tie-breaker branch
    const tie = or[1] as { AND: [{ createdAt: Date }, { id: { lt: string } }] };
    expect(tie.AND[0].createdAt.getTime()).toBe(new Date(createdAtIso).getTime());
    expect(tie.AND[1].id.lt).toBe('id_10');
  });

  it('whereForHighestKeyset adds keyset pagination when key provided', () => {
    const base = whereForFilters({ rating: 4 });
    const createdAtIso = '2024-02-01T00:00:00.000Z';
    const res = whereForHighestKeyset(base, { rating: 4, createdAtIso, id: 'id_20' });

    const andArr = (res as { AND: unknown[] }).AND;
    expect(andArr[0]).toEqual(base);
    const or = (andArr[1] as { OR: unknown[] }).OR as Array<unknown>;

    const lowerRating = or[0] as { rating: { lt: number } };
    expect(lowerRating.rating.lt).toBe(4);

    const equalRating = or[1] as { AND: unknown[] };
    const innerOr = (equalRating.AND[1] as { OR: unknown[] }).OR as Array<unknown>;
    const createdLt = innerOr[0] as { createdAt: { lt: Date } };
    expect(createdLt.createdAt.lt.getTime()).toBe(new Date(createdAtIso).getTime());
    const idTiebreak = innerOr[1] as { AND: [{ createdAt: Date }, { id: { lt: string } }] };
    expect(idTiebreak.AND[0].createdAt.getTime()).toBe(new Date(createdAtIso).getTime());
    expect(idTiebreak.AND[1].id.lt).toBe('id_20');
  });

  it('orderBy helpers return expected order', () => {
    expect(orderByForNewest()).toEqual([{ createdAt: 'desc' }, { id: 'desc' }]);
    expect(orderByForHighest()).toEqual([{ rating: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }]);
  });
});


