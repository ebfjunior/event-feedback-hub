import React from 'react';
import { render, act } from '@testing-library/react';
import { FeedbackStream } from '../FeedbackStream';

vi.mock('@/lib/api', () => ({
	fetchFeedbacks: vi.fn(async () => ({ data: [], next_cursor: null })),
}));

vi.mock('../../molecules/FeedbackCard', () => ({
	FeedbackCard: (props: any) => <div data-mock="FeedbackCard" {...props} />,
}));
vi.mock('../../molecules/FeedbackCard.Skeleton', () => ({
	FeedbackCardSkeleton: () => <div data-mock="FeedbackCardSkeleton" />,
}));
vi.mock('../../molecules/InfiniteList', () => ({
	InfiniteList: (props: any) => <div data-mock="InfiniteList" {...props} />,
}));
vi.mock('../../molecules/NewItemsBanner', () => ({
	NewItemsBanner: (props: any) => <div data-mock="NewItemsBanner" {...props} />,
}));
vi.mock('../../molecules/ErrorBanner', () => ({
	ErrorBanner: (props: any) => <div data-mock="ErrorBanner" {...props} />,
}));
vi.mock('../../molecules/FilterBar', () => ({
	FilterBar: (props: any) => <div data-mock="FilterBar" {...props} />,
}));

describe('FeedbackStream (snapshot)', () => {
	it('renders initial state', async () => {
		const { container } = render(<FeedbackStream events={[{ id: 'e1', name: 'Event 1' }]} />);
		await act(async () => {});
		expect(container.firstChild).toMatchSnapshot();
	});
});


