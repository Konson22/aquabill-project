import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';

export default function TariffForm({ categories }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        amount: '',
        category_id: '',
        date: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('tariffs.store'), {
            onFinish: () => reset(),
        });
    };

    return (
        <div className="p-">
            <form className="flex flex-col gap-6" onSubmit={submit}>
                {formFields.map((field, index) => (
                    <div className="mb-" key={index}>
                        <Label htmlFor="email">{field.label}</Label>
                        <Input
                            id={field.name}
                            name={field.name}
                            type={field.type}
                            required
                            tabIndex={index + 1}
                            autoComplete={field.name}
                            options={field.options}
                            value={data[field.name]}
                            onChange={(e) => setData(field.name, e.target.value)}
                            placeholder={field.placeholder}
                        />

                        <InputError message={errors.email} />
                    </div>
                ))}
                <div className="mb-3">
                    <Label htmlFor="category_id">categories</Label>
                    <Select
                        id="category_id"
                        name="category_id"
                        required
                        options={categories}
                        onChange={(e) => setData('category_id', e.target.value)}
                        placeholder="Select Category"
                    />

                    <InputError message={errors.category_id} />
                </div>

                <Button>Submit</Button>
            </form>
        </div>
    );
}

const formFields = [
    { name: 'name', placeholder: 'name', type: 'text' },
    { name: 'amount', placeholder: 'amount', type: 'number' },
    { name: 'date', placeholder: 'date', type: 'date' },
];
