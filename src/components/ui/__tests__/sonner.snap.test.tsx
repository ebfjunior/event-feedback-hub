import React from 'react';
import { render } from '@testing-library/react';
import { Toaster } from '../sonner';

vi.mock('next-themes', () => ({ useTheme: () => ({ theme: 'light' }) }));
vi.mock('sonner', () => ({ Toaster: (props: any) => <div data-mock="sonner" {...props} /> }));

describe('ui/Sonner Toaster (snapshot)', () => {
	it('renders', () => {
		const { container } = render(<Toaster />);
		expect(container.firstChild).toMatchSnapshot();
	});
});


