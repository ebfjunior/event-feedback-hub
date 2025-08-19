import React from 'react';
import { render } from '@testing-library/react';
import { EventSelect } from '../EventSelect';

// Mock Radix Select to stable DOM
vi.mock('@/components/ui/select', () => ({
	Select: (p: any) => <div data-mock="Select" {...p} />,
	SelectContent: (p: any) => <div data-mock="SelectContent" {...p} />,
	SelectItem: (p: any) => <div data-mock="SelectItem" {...p} />,
	SelectTrigger: (p: any) => <div data-mock="SelectTrigger" {...p} />,
	SelectValue: (p: any) => <div data-mock="SelectValue" {...p} />,
}));

describe('EventSelect (snapshot)', () => {
	it('renders with events', () => {
		const { container } = render(
			<EventSelect events={[{ id: 'e1', name: 'Event 1' }, { id: 'e2', name: 'Event 2' }]} />,
		);
		expect(container.firstChild).toMatchSnapshot();
	});
});


