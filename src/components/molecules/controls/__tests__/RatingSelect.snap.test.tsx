import React from 'react';
import { render } from '@testing-library/react';
import { RatingSelect } from '../RatingSelect';

vi.mock('@/components/ui/select', () => ({
	Select: (p: any) => <div data-mock="Select" {...p} />,
	SelectContent: (p: any) => <div data-mock="SelectContent" {...p} />,
	SelectItem: (p: any) => <div data-mock="SelectItem" {...p} />,
	SelectTrigger: (p: any) => <div data-mock="SelectTrigger" {...p} />,
	SelectValue: (p: any) => <div data-mock="SelectValue" {...p} />,
}));

describe('RatingSelect (snapshot)', () => {
	it('renders', () => {
		const { container } = render(<RatingSelect />);
		expect(container.firstChild).toMatchSnapshot();
	});
});


