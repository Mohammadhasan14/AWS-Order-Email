import {
    IndexTable,
    IndexFilters,
    useSetIndexFiltersMode,
    useIndexResourceState,
    Text,
    useBreakpoints,
    Card,
    Badge,
    EmptySearchResult,
    ChoiceList
} from '@shopify/polaris';
import { useState, useCallback, useEffect, Fragment } from 'react';

const emptyStateMarkup = (
    <EmptySearchResult
        title={'No abandoned carts found'}
        description={'Try changing the filters or search term'}
        withIllustration
    />
);

export default function SmartBulkTable({
    setSelectedTableData,
    sortSelected,
    setSortSelected,
    orders,
    persistOrders,
    currentPage,
    setCurrentPage,
    pageInfo,
    isTableLoading,
    queryValue,
    setQueryValue,
    handleEmailStatusChange,
    emailStatus
}) {
    const [selected, setSelected] = useState(0);
    const sortOptions = [
        { label: 'Created at', value: 'created asc', directionLabel: 'Oldest to newest' },
        { label: 'Created at', value: 'created desc', directionLabel: 'Newest to oldest' }
    ];
    const { mode, setMode } = useSetIndexFiltersMode();

    const onHandleCancel = () => { };

    const handleFiltersQueryChange = useCallback(
        (value) => {
            console.log("value", value);
            setQueryValue(value)
        },
        [],
    );

    const handleNext = () => {
        if (pageInfo.hasNextPage) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevious = () => {
        if (pageInfo.hasPreviousPage) {
            setCurrentPage(currentPage - 1);
        }
    };

    const resourceName = {
        singular: 'order',
        plural: 'orders',
    };

    const { selectedResources, allResourcesSelected, handleSelectionChange } =
        useIndexResourceState(orders);

    useEffect(() => {
        console.log("selectedResources", selectedResources);
        const filteredOrders = persistOrders.filter((data) => selectedResources.includes(data.id));
        console.log("filteredOrders", filteredOrders);
        setSelectedTableData(filteredOrders);
    }, [selectedResources]);

    const filters = [
        {
            key: 'emailStatus',
            label: 'Email Status',
            filter: (
                <ChoiceList
                    title="Choose the email status"
                    titleHidden
                    choices={[
                        { label: 'Success', value: true },
                        { label: 'Failed', value: false }
                    ]}
                    selected={emailStatus || []}
                    onChange={handleEmailStatusChange}
                    allowMultiple
                />
            ),
            shortcut: true,
        }]

    const rowMarkup = orders?.length ? orders.map(
        (
            data,
            index,
        ) => {
            const splittedID = data?.id?.split("/")
            const orderID = splittedID?.[splittedID?.length - 1]
            return (
                <Fragment key={orderID}>
                    <IndexTable.Row
                        id={data?.id}
                        key={data?.id}
                        selected={selectedResources.includes(data?.id)}
                        position={index}
                    >
                        <IndexTable.Cell>
                            <Text variant="bodyMd" fontWeight="bold" as="span">
                                {data?.dbData?.createdAt?.split("T")[0] || 'N/A'}
                            </Text>
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                            {orderID}
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                            {data?.shippingAddress?.firstName}
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                            {data?.shippingAddress?.lastName}
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                            {data?.email || data?.customer?.email || "N/A"}
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                            <Badge
                                tone={data?.dbData?.isEmailSent ? "success" : "attention"}
                            >
                                {data?.dbData?.isEmailSent ? "Sent" : "Failed"}
                            </Badge>
                        </IndexTable.Cell>
                    </IndexTable.Row>
                </Fragment>
            );
        }
    ) : []

    return (
        <>
            <IndexFilters
                sortOptions={sortOptions}
                sortSelected={sortSelected}
                queryPlaceholder="Search By Order ID"
                onQueryChange={handleFiltersQueryChange}
                queryValue={queryValue}
                onQueryClear={() => setQueryValue('')}
                onSort={setSortSelected}
                cancelAction={{
                    onAction: onHandleCancel,
                    disabled: false,
                    loading: false,
                }}
                tabs={[]}
                selected={selected}
                onSelect={setSelected}
                loading={isTableLoading}
                filters={filters}
                onClearAll={() => { }}
                mode={mode}
                setMode={setMode}
            />
            <IndexTable
                condensed={useBreakpoints().smDown}
                resourceName={resourceName}
                itemCount={orders?.length}
                selectedItemsCount={
                    allResourcesSelected ? 'All' : selectedResources?.length
                }
                onSelectionChange={handleSelectionChange}
                emptyState={emptyStateMarkup}
                headings={[
                    { title: 'Date' },
                    { title: 'Order ID' },
                    { title: "First Name" },
                    { title: "Last Name" },
                    { title: 'Email' },
                    { title: 'Email Status' }
                ]}
                pagination={{
                    hasNext: isTableLoading ? false : pageInfo.hasNextPage,
                    hasPrevious: isTableLoading ? false : pageInfo.hasPreviousPage,
                    onNext: handleNext,
                    onPrevious: handlePrevious,
                    label: "  "
                }}
            >
                {rowMarkup}
            </IndexTable>
        </>
    );

}