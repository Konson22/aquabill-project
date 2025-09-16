export default function Profile({ customer }) {
    return (
        <div className="w-[35%] rounded border bg-white p-8">
            <div className="">
                <h2 className="mb-3 text-2xl uppercase">
                    {customer.first_name} {customer.last_name}
                </h2>
            </div>
            <ul>
                <li className="flex items-center space-x-3 py-1">
                    <span className="">E-mail:</span>
                    <span>{customer.email}</span>
                </li>
                <li className="flex items-center space-x-3 py-1">
                    <span> Phone:</span>
                    <span>{customer.phone ? customer.phone : '----'}</span>
                </li>
                <li className="flex space-x-3 py-1">
                    <span> Contract Date:</span>
                    <span>{customer.date}</span>
                </li>
                <li className="flex space-x-3 py-1">
                    <span>Contract No:</span>
                    <span>{customer.contract}</span>
                </li>
            </ul>
        </div>
    );
}
