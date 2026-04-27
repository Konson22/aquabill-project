import { usePage } from '@inertiajs/react';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {

    return (
        <div className="flex items-center">
            <div className="">
                <AppLogoIcon className="size-15" />
            </div>
            <div className="ml-3 grid flex-1 text-left text-sm leading-tight group">
                <span className="truncate font-black text-white uppercase tracking-tighter group-hover:text-orange-500 transition-colors">
                    SSUWC/JS
                </span>
                <span className="truncate text-[10px] text-orange-500/80 font-bold tracking-widest uppercase">
                    Juba Station
                </span>
            </div>
        </div>
    );
}
