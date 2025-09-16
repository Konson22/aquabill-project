import * as React from "react"
import { cn } from "@/lib/utils"

interface AlertDialogProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    children: React.ReactNode
}

interface AlertDialogContentProps {
    className?: string
    children: React.ReactNode
}

interface AlertDialogHeaderProps {
    className?: string
    children: React.ReactNode
}

interface AlertDialogTitleProps {
    className?: string
    children: React.ReactNode
}

interface AlertDialogDescriptionProps {
    className?: string
    children: React.ReactNode
}

interface AlertDialogFooterProps {
    className?: string
    children: React.ReactNode
}

interface AlertDialogActionProps {
    className?: string
    children: React.ReactNode
    onClick?: () => void
}

interface AlertDialogCancelProps {
    className?: string
    children: React.ReactNode
    onClick?: () => void
}

const AlertDialog = ({ open, onOpenChange, children }: AlertDialogProps) => {
    const [isOpen, setIsOpen] = React.useState(open || false)

    React.useEffect(() => {
        if (open !== undefined) {
            setIsOpen(open)
        }
    }, [open])

    const handleOpenChange = (newOpen: boolean) => {
        setIsOpen(newOpen)
        onOpenChange?.(newOpen)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="fixed inset-0 bg-black/50"
                onClick={() => handleOpenChange(false)}
            />
            <div className="relative z-50">
                {React.Children.map(children, child =>
                    React.cloneElement(child as React.ReactElement, {
                        onClose: () => handleOpenChange(false)
                    })
                )}
            </div>
        </div>
    )
}

const AlertDialogContent = ({ className, children, onClose }: AlertDialogContentProps & { onClose?: () => void }) => (
    <div
        className={cn(
            "bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md mx-4",
            className
        )}
    >
        {children}
    </div>
)

const AlertDialogHeader = ({ className, children }: AlertDialogHeaderProps) => (
    <div className={cn("mb-4", className)}>
        {children}
    </div>
)

const AlertDialogTitle = ({ className, children }: AlertDialogTitleProps) => (
    <h2 className={cn("text-lg font-semibold text-gray-900 dark:text-gray-100", className)}>
        {children}
    </h2>
)

const AlertDialogDescription = ({ className, children }: AlertDialogDescriptionProps) => (
    <p className={cn("text-sm text-gray-600 dark:text-gray-400 mt-2", className)}>
        {children}
    </p>
)

const AlertDialogFooter = ({ className, children }: AlertDialogFooterProps) => (
    <div className={cn("flex justify-end space-x-2 mt-6", className)}>
        {children}
    </div>
)

const AlertDialogAction = ({ className, children, onClick }: AlertDialogActionProps) => (
    <button
        className={cn(
            "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            className
        )}
        onClick={onClick}
    >
        {children}
    </button>
)

const AlertDialogCancel = ({ className, children, onClick }: AlertDialogCancelProps) => (
    <button
        className={cn(
            "px-4 py-2 bg-gray-200 text-gray-900 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600",
            className
        )}
        onClick={onClick}
    >
        {children}
    </button>
)

export {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction,
    AlertDialogCancel,
}
