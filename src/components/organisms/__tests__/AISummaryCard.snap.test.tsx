import React from 'react';
import { render } from '@testing-library/react';
import { AISummaryCard } from '../AISummaryCard';

vi.mock('lucide-react', async () => {
	const actual = await vi.importActual<any>('lucide-react');
	return {
		...actual,
		Check: (p: any) => <svg data-icon="check" {...p} />,
		AlertTriangle: (p: any) => <svg data-icon="alert" {...p} />,
		Bot: (p: any) => <svg data-icon="bot" {...p} />,
	};
});

describe('AISummaryCard (snapshot)', () => {
	it('renders with summary', () => {
		const { container } = render(
			<AISummaryCard
				summary={{ positive_percentage: 75, top_highlights: ['A'], areas_for_improvement: ['B'] }}
			/>,
		);
		expect(container.firstChild).toMatchSnapshot();
	});

	it('renders without summary', () => {
		const { container } = render(<AISummaryCard summary={null} />);
		expect(container.firstChild).toMatchSnapshot();
	});
});


