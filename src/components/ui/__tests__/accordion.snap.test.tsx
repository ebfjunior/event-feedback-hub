import React from 'react';
import { render } from '@testing-library/react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../accordion';

vi.mock('lucide-react', async () => {
	const actual = await vi.importActual<any>('lucide-react');
	return { ...actual, ChevronDownIcon: (p: any) => <svg data-icon="chev-down" {...p} /> };
});

describe('ui/Accordion (snapshot)', () => {
	it('renders basic accordion', () => {
		const { container } = render(
			<Accordion type="single" collapsible>
				<AccordionItem value="item-1">
					<AccordionTrigger>Trigger</AccordionTrigger>
					<AccordionContent>Content</AccordionContent>
				</AccordionItem>
			</Accordion>,
		);
		expect(container.firstChild).toMatchSnapshot();
	});
});


