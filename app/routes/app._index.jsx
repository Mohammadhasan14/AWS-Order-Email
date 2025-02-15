import { Button, Card, Page, Text } from '@shopify/polaris'
import { useCallback, useEffect, useState } from 'react';
import ConfirmationModal from '../components/ConfirmationModal';
import SmartBulkTable from '../components/SmartBulkTable';
import "../css/main.css"

export default function Index() {
  const [selectedTableData, setSelectedTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState([]);
  const [persistOrders, setPersistOrders] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState(["created desc"]);
  const [queryValue, setQueryValue] = useState('');
  const [totalOrders, setTotalOrders] = useState(0);
  const [isTableLoading, setTableLoading] = useState(false)
  const [pageInfo, setPageInfo] = useState({
    hasNextPage: false,
    hasPreviousPage: false,
    endCursor: null,
    startCursor: null
  });
  const [PageSize, setPageSize] = useState('5')
  const [emailStatus, setEmailStatus] = useState([true, false])


  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      // console.log("inside if ");
      console.log(`currentPage: ${currentPage}, queryValue: ${queryValue}, selectedFilter: ${selectedFilter}, PageSize: ${PageSize}`);

      fetchPaginatedData();
    }, 700);
    return () => {
      clearTimeout(debounceTimer);
    };
  }, [currentPage, queryValue, selectedFilter, PageSize]);


  const fetchPaginatedData = async () => {
    // console.log("Fetching page:", page, "with cursor:", cursor);
    try {
      if (!isTableLoading) {
        setTableLoading(true);
      }
      const response = await fetch('/api/getOrders', {
        method: "POST",
        body: JSON.stringify({
          endCursor: pageInfo.endCursor,
          startCursor: pageInfo.startCursor,
          PageSize: Number(PageSize),
          queryValue,
          selectedFilter: selectedFilter[0],
        }),
      });

      if (response.ok) {
        const data = await response.json();

        if (data?.allOrders) {
          console.log("Fetched data of fetchPaginatedData:", data.allOrders);
          setOrders(data.allOrders)
          setPersistOrders((pre) => ([
            ...pre,
            ...data.allOrders
          ]))
          // setTotalOrders(data.totalCount || 0);
          // setPageInfo({
          //   hasNextPage: data.pageInfo.hasNextPage,
          //   hasPreviousPage: data.pageInfo.hasPreviousPage,
          //   endCursor: data.pageInfo.endCursor,
          //   startCursor: data.pageInfo.startCursor
          // })
        }
      }
    } catch (error) {
      console.error("Error fetching paginated data:", error);
    } finally {
      setTableLoading(false);
    }

  };

  const handleSendMessageInitial = () => {
    const modal = document.getElementById('confirmation_modal') | null;
    console.log("modal", modal);
    if (modal) {
      modal.show();
    }
  }

  const hideModal = () => {
    const modal = document.getElementById('confirmation_modal') | null;
    if (modal) {
      modal.hide();
    }
  }

  const handleSendMessageConfirmed = async () => {
    // console.log("selectedTableData", selectedTableData);
    hideModal();
    const checkouts = selectedTableData.map((data) => {
      if (data && data.id) {
        return {
          name: (data.firstName || data.lastName) ? (data.firstName ? `${data.firstName} ` : "") + (data.lastName || "") : "N/A",
          phoneNumber: data.phone ? data.phone : "N/A",
          messageContent: "",
        };
      }
    });

    // console.log("data3", data3);
  }

  const handleEmailStatusChange = useCallback((v) => {
    console.log("handleEmailStatusChange v", v);
    if (v?.length) {
      setEmailStatus(v)
    }
  }, [])

  return (
    <Page fullWidth>
      <div className="container">
        <div className="header">
          <div className="text-section">
            <Text variant="headingLg" as="p">
              Orders list
            </Text>
            <div className="sub-text"></div>
            <Text variant="bodyLg" as="p">
              Select multiple orders in bulk with checkboxes, then click 'Send Message'
            </Text>
          </div>
          <div className="button-container">
            <Button
              variant="primary"
              // disabled={selectedTableData?.length}
              onClick={handleSendMessageConfirmed}
            >
              Send Message
            </Button>
          </div>
        </div>
        <Card padding={{ xs: '190', sm: '190' }}>
          <SmartBulkTable
            setSelectedTableData={setSelectedTableData}
            sortSelected={selectedFilter}
            setSortSelected={setSelectedFilter}
            orders={orders}
            persistOrders={persistOrders}
            currentPage={currentPage}
            PageSize={PageSize}
            totalOrders={totalOrders}
            setCurrentPage={setCurrentPage}
            pageInfo={pageInfo}
            isTableLoading={isTableLoading}
            setQueryValue={setQueryValue}
            queryValue={queryValue}
            handleEmailStatusChange={handleEmailStatusChange}
            emailStatus={emailStatus}
          />
        </Card>
        {/* <ConfirmationModal
          handlePrimaryClick={handleSendMessageConfirmed}
          handleSecondClick={hideModal}
          primaryButtonText={"Send Message"}
          secondaryButtonText={"Cancel"}
          content={"Are you sure you want to send the message to the selected customers?"}
          title={"Send Message"}
        /> */}
      </div>
    </Page>
  )
}
