import React from 'react';
import { render } from '@testing-library/react';
import { InfiniteList } from '../InfiniteList';

describe('InfiniteList (snapshot)', () => {
	it('renders loading and sentinel states', () => {
		const { container: c1 } = render(
			<InfiniteList items={[<div key="1">A</div>, <div key="2">B</div>]} hasMore isLoading onLoadMore={() => {}} />,
		);
		expect(c1.firstChild).toMatchSnapshot();
		const { container: c2 } = render(
			<InfiniteList items={[]} hasMore={false} isLoading={false} onLoadMore={() => {}} />,
		);
		expect(c2.firstChild).toMatchSnapshot();
	});
});


