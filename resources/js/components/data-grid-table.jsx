import { router } from '@inertiajs/react';
import { DataGrid } from '@mui/x-data-grid';
import { useCallback, useMemo } from 'react';

/**
 * Default sx applied to every DataGridTable instance so the grid blends
 * with the rest of the shadcn / Tailwind UI.
 */
const baseSx = {
    border: 0,
    fontFamily: 'inherit',
    '& .MuiDataGrid-columnHeaders': {
        backgroundColor: 'hsl(var(--muted) / 0.5)',
    },
    '& .MuiDataGrid-columnHeaderTitle': {
        fontSize: 10,
        fontWeight: 900,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'hsl(var(--muted-foreground))',
    },
    '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
        outline: 'none',
    },
    '& .MuiDataGrid-row:hover': {
        backgroundColor: 'hsl(var(--muted) / 0.3)',
    },
    '& .MuiDataGrid-footerContainer': {
        backgroundColor: 'hsl(var(--muted) / 0.2)',
        borderTop: '1px solid hsl(var(--border))',
    },
};

/**
 * Reusable MUI DataGrid wrapper with two pagination modes:
 *
 *  1. Server (Laravel paginator + Inertia)
 *     Pass `paginator` (the full Laravel paginator object), a `routeName`
 *     or `routeUrl`, and any extra `queryParams` to preserve when navigating.
 *
 *  2. Client / manual
 *     Omit `paginator`. Pass `rows` and any standard DataGrid pagination
 *     props (paginationModel, onPaginationModelChange, etc.) via `...rest`.
 *
 * Any other DataGrid prop is forwarded and overrides the defaults.
 */
export default function DataGridTable({
    columns,
    rows,
    paginator,
    routeName,
    routeUrl,
    queryParams = {},
    inertiaOptions,
    pageSizeOptions,
    emptyLabel = 'No records found.',
    height = 'calc(70vh - 250px)',
    minHeight = 400,
    containerClassName,
    sx,
    ...dataGridProps
}) {
    const isServerPaginated = Boolean(paginator);
    const resolvedRows = rows ?? paginator?.data ?? [];

    const handleServerPaginationChange = useCallback(
        (model, currentPage) => {
            if (model.page === currentPage) {
                return;
            }
            const url = routeUrl ?? (routeName ? route(routeName) : null);
            if (!url) {
                return;
            }
            router.get(url, { ...queryParams, page: model.page + 1 }, { preserveScroll: true, preserveState: true, ...inertiaOptions });
        },
        [inertiaOptions, queryParams, routeName, routeUrl],
    );

    const serverPaginationProps = useMemo(() => {
        if (!isServerPaginated) {
            return {};
        }

        const perPage = paginator.per_page ?? resolvedRows.length ?? 10;
        const currentPage = Math.max(0, (paginator.current_page ?? 1) - 1);

        return {
            rowCount: paginator.total ?? resolvedRows.length,
            paginationMode: 'server',
            paginationModel: { page: currentPage, pageSize: perPage },
            pageSizeOptions: pageSizeOptions ?? [perPage],
            onPaginationModelChange: (model) => handleServerPaginationChange(model, currentPage),
        };
    }, [handleServerPaginationChange, isServerPaginated, pageSizeOptions, paginator, resolvedRows.length]);

    const mergedSx = useMemo(() => ({ ...baseSx, ...(sx ?? {}) }), [sx]);

    return (
        <div className={containerClassName} style={{ width: '100%', height, minHeight }}>
            <DataGrid
                rows={resolvedRows}
                columns={columns}
                disableRowSelectionOnClick
                disableColumnMenu
                disableColumnFilter
                rowHeight={56}
                localeText={{ noRowsLabel: emptyLabel }}
                {...serverPaginationProps}
                sx={mergedSx}
                {...dataGridProps}
            />
        </div>
    );
}
