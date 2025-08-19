import React from 'react';
import { render } from '@testing-library/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select';

// Reduce Lucide output noise
vi.mock('lucide-react', async () => {
	const actual = await vi.importActual<any>('lucide-react');
	return {
		...actual,
		ChevronDownIcon: (p: any) => <svg data-icon="chev-down" {...p} />,
		ChevronUpIcon: (p: any) => <svg data-icon="chev-up" {...p} />,
		CheckIcon: (p: any) => <svg data-icon="check" {...p} />,
	};
});

describe('ui/Select (snapshot)', () => {
	it('renders basic structure', () => {
		const { container } = render(
			<Select value="all">
				<SelectTrigger>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All</SelectItem>
					<SelectItem value="1">One</SelectItem>
				</SelectContent>
			</Select>,
		);
		expect(container.firstChild).toMatchSnapshot();
	});
});


