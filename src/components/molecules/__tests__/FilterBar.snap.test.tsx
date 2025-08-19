import React from 'react';
import { render } from '@testing-library/react';
import { FilterBar } from '../FilterBar';

vi.mock('../controls/EventSelect', () => ({
	EventSelect: (props: any) => <div data-mock="EventSelect" {...props} />,
}));
vi.mock('../controls/RatingSelect', () => ({
	RatingSelect: (props: any) => <div data-mock="RatingSelect" {...props} />,
}));
vi.mock('../controls/SortToggle', () => ({
	SortToggle: (props: any) => <div data-mock="SortToggle" {...props} />,
}));

describe('FilterBar (snapshot)', () => {
	it('renders with all controls', () => {
		const { container } = render(
			<FilterBar
				events={[{ id: 'e1', name: 'Event 1' }]}
				sort="newest"
				eventId={undefined}
				rating={undefined}
				onSortChange={() => {}}
			/>,
		);
		expect(container.firstChild).toMatchSnapshot();
	});

	it('hides EventSelect when fixedEventId present', () => {
		const { container } = render(
			<FilterBar
				events={[{ id: 'e1', name: 'Event 1' }]}
				sort="newest"
				fixedEventId="e1"
				onSortChange={() => {}}
			/>,
		);
		expect(container.firstChild).toMatchSnapshot();
	});
});


