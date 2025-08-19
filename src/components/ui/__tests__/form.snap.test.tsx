import React from 'react';
import { render } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '../form';
import { Input } from '../input';

function Demo() {
	const methods = useForm<{ name: string }>({ defaultValues: { name: '' } });
	return (
		<FormProvider {...methods}>
			<form>
				<FormField
					name="name"
					render={() => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input />
							</FormControl>
							<FormDescription>desc</FormDescription>
							<FormMessage>error</FormMessage>
						</FormItem>
					)}
				/>
			</form>
		</FormProvider>
	);
}

describe('ui/Form (snapshot)', () => {
	it('renders', () => {
		const { container } = render(<Demo />);
		expect(container.firstChild).toMatchSnapshot();
	});
});


