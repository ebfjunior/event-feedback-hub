import React from 'react';
import { render } from '@testing-library/react';
import { Checkbox } from '../checkbox';

vi.mock('lucide-react', async () => {
	const actual = await vi.importActual<any>('lucide-react');
	return { ...actual, CheckIcon: (p: any) => <svg data-icon="check" {...p} /> };
});

describe('ui/Checkbox (snapshot)', () => {
	it('renders default', () => {
		const { container } = render(<Checkbox />);
		expect(container.firstChild).toMatchSnapshot();
	});
});


