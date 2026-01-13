import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex h-16 w-16 items-center justify-center rounded-md">
                <AppLogoIcon className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    Billing System
                </span>
            </div>
        </>
    );
}
