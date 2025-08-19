import React from 'react';
import { render } from '@testing-library/react';
import { Stars } from '../Stars';

vi.mock('lucide-react', async () => {
	const actual = await vi.importActual<any>('lucide-react');
	return {
		...actual,
		Star: (props: any) => <svg data-icon="star" {...props} />,
	};
});

describe('Stars (snapshot)', () => {
	it('renders with rating', () => {
		const { container } = render(<Stars rating={3} />);
		expect(container.firstChild).toMatchSnapshot();
	});
});


