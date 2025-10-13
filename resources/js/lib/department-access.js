// Department-based access control configuration
export const DEPARTMENT_ACCESS = {
    'Operations': {
        name: 'Operations',
        description: 'Field operations and meter management',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 dark:bg-blue-950',
        icon: 'Activity',
        permissions: {
            dashboard: true,
            meters: {
                view: true,
                create: true,
                edit: true,
                delete: false
            },
            meterReadings: {
                view: true,
                create: true,
                edit: true,
                delete: false
            },
            customers: {
                view: true,
                create: false,
                edit: false,
                delete: false
            },
            bills: {
                view: true,
                create: false,
                edit: false,
                delete: false
            },
            payments: {
                view: false,
                create: false,
                edit: false,
                delete: false
            },
            maintenance: {
                view: true,
                create: true,
                edit: true,
                delete: false
            },
            inventory: {
                view: true,
                create: false,
                edit: false,
                delete: false
            },
            reports: {
                view: true,
                create: false
            }
        }
    },
    'Customer Service': {
        name: 'Customer Service',
        description: 'Customer support and inquiries',
        color: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-950',
        icon: 'Users',
        permissions: {
            dashboard: true,
            customers: {
                view: true,
                create: true,
                edit: true,
                delete: false
            },
            bills: {
                view: true,
                create: false,
                edit: false,
                delete: false
            },
            payments: {
                view: true,
                create: false,
                edit: false,
                delete: false
            },
            invoices: {
                view: true,
                create: false,
                edit: false,
                delete: false
            },
            meters: {
                view: true,
                create: false,
                edit: false,
                delete: false
            },
            reports: {
                view: true,
                create: false
            }
        }
    },
    'Billing': {
        name: 'Billing',
        description: 'Bill generation and payment processing',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50 dark:bg-purple-950',
        icon: 'FileText',
        permissions: {
            dashboard: true,
            bills: {
                view: true,
                create: true,
                edit: true,
                delete: false
            },
            invoices: {
                view: false,
                create: false,
                edit: false,
                delete: false
            },
            payments: {
                view: false,
                create: false,
                edit: false,
                delete: false
            },
            customers: {
                view: true,
                create: false,
                edit: false,
                delete: false
            },
            tariffs: {
                view: true,
                create: false,
                edit: false,
                delete: false
            },
            reports: {
                view: true,
                create: true
            }
        }
    },
    'Maintenance': {
        name: 'Maintenance',
        description: 'Equipment maintenance and repairs',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 dark:bg-orange-950',
        icon: 'Wrench',
        permissions: {
            dashboard: true,
            maintenance: {
                view: true,
                create: true,
                edit: true,
                delete: false
            },
            vehicles: {
                view: true,
                create: true,
                edit: true,
                delete: false
            },
            meters: {
                view: true,
                create: false,
                edit: true,
                delete: false
            },
            inventory: {
                view: true,
                create: false,
                edit: false,
                delete: false
            },
            reports: {
                view: true,
                create: false
            }
        }
    },
    'Inventory': {
        name: 'Inventory',
        description: 'Stock management and procurement',
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-50 dark:bg-cyan-950',
        icon: 'Package',
        permissions: {
            dashboard: true,
            inventory: {
                view: true,
                create: true,
                edit: true,
                delete: false
            },
            suppliers: {
                view: true,
                create: true,
                edit: true,
                delete: false
            },
            purchaseOrders: {
                view: true,
                create: true,
                edit: true,
                delete: false
            },
            reports: {
                view: true,
                create: true
            }
        }
    },
    'Finance': {
        name: 'Finance',
        description: 'Financial reporting and revenue management',
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50 dark:bg-emerald-950',
        icon: 'DollarSign',
        permissions: {
            dashboard: true,
            payments: {
                view: true,
                create: true,
                edit: true,
                delete: false
            },
            invoices: {
                view: true,
                create: false,
                edit: false,
                delete: false
            },
            bills: {
                view: true,
                create: false,
                edit: false,
                delete: false
            },
            tariffs: {
                view: true,
                create: true,
                edit: true,
                delete: false
            },
            reports: {
                view: true,
                create: true
            }
        }
    },
    'Human Resources': {
        name: 'Human Resources',
        description: 'User management and employee records',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50 dark:bg-indigo-950',
        icon: 'UserCheck',
        permissions: {
            dashboard: true,
            users: {
                view: true,
                create: true,
                edit: true,
                delete: false
            },
            departments: {
                view: true,
                create: false,
                edit: false,
                delete: false
            },
            reports: {
                view: true,
                create: false
            }
        }
    }
};

// Helper functions for access control
export const hasPermission = (userDepartment, feature, action = 'view') => {
    if (!userDepartment || !DEPARTMENT_ACCESS[userDepartment]) {
        return false;
    }
    
    const permissions = DEPARTMENT_ACCESS[userDepartment].permissions;
    return permissions[feature] && permissions[feature][action];
};

export const getDepartmentInfo = (departmentName) => {
    return DEPARTMENT_ACCESS[departmentName] || null;
};

export const getAccessibleFeatures = (userDepartment) => {
    if (!userDepartment || !DEPARTMENT_ACCESS[userDepartment]) {
        return [];
    }
    
    return Object.keys(DEPARTMENT_ACCESS[userDepartment].permissions).filter(
        feature => feature !== 'dashboard'
    );
};

// Navigation items based on department
export const getNavigationItems = (userDepartment) => {
    const baseItems = [
        {
            title: 'Dashboard',
            href: '/',
            icon: 'LayoutGrid',
            alwaysVisible: true
        }
    ];

    if (!userDepartment || !DEPARTMENT_ACCESS[userDepartment]) {
        return baseItems;
    }

    const departmentFeatures = getAccessibleFeatures(userDepartment);
    const navigationMap = {
        customers: {
            title: 'Customers',
            href: '/customers',
            icon: 'Users'
        },
        meters: {
            title: 'Meters',
            href: '/meters',
            icon: 'Droplets'
        },
        meterReadings: {
            title: 'Meter Readings',
            href: '/meter-readings',
            icon: 'Activity'
        },
        bills: {
            title: 'Bills',
            href: '/bills',
            icon: 'FileText'
        },
        invoices: {
            title: 'Invoices',
            href: '/invoices',
            icon: 'Receipt'
        },
        payments: {
            title: 'Payments',
            href: '/payments',
            icon: 'DollarSign'
        },
        tariffs: {
            title: 'Tariffs',
            href: '/tariffs',
            icon: 'Calculator'
        },
        maintenance: {
            title: 'Maintenance',
            href: '/maintenance',
            icon: 'Wrench'
        },
        vehicles: {
            title: 'Vehicles',
            href: '/vehicles',
            icon: 'Car'
        },
        inventory: {
            title: 'Inventory',
            href: '/inventory',
            icon: 'Package'
        },
        suppliers: {
            title: 'Suppliers',
            href: '/suppliers',
            icon: 'Truck'
        },
        purchaseOrders: {
            title: 'Purchase Orders',
            href: '/purchase-orders',
            icon: 'ShoppingCart'
        },
        users: {
            title: 'Users',
            href: '/users',
            icon: 'UserCheck'
        },
        departments: {
            title: 'Departments',
            href: '/departments',
            icon: 'Building'
        },
        reports: {
            title: 'Reports',
            href: '/reports',
            icon: 'BarChart3'
        }
    };

    const departmentItems = departmentFeatures
        .map(feature => navigationMap[feature])
        .filter(Boolean);

    return [...baseItems, ...departmentItems];
};
