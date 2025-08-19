import React from 'react';
import { render } from '@testing-library/react';
import { SummarySection } from '../SummarySection';

describe('SummarySection (snapshot)', () => {
	it('renders with items', () => {
		const { container } = render(
			<SummarySection icon={<span>i</span>} title="Highlights" items={["Nice", "Great"]} />,
		);
		expect(container.firstChild).toMatchSnapshot();
	});

	it('renders with empty items', () => {
		const { container } = render(
			<SummarySection icon={<span>i</span>} title="Highlights" items={[]} />,
		);
		expect(container.firstChild).toMatchSnapshot();
	});
});


