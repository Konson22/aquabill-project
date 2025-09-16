
export default function AppLogo() {
    return (
        <div className='flex items-center'>
            <div className="h-16 w-16">
                <img className="h-16 w-16" src="./images/logo.jpg" alt="" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">Laravel Starter Kit</span>
            </div>
        </div>
    );
}
