import { Button, Card, Page, Text } from '@shopify/polaris';
import { useCallback, useEffect, useState } from 'react';
import ConfirmationModal from '../components/ConfirmationModal';
import SmartBulkTable from '../components/SmartBulkTable';
import "../css/main.css";

export default function Index() {
  const [selectedTableData, setSelectedTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState([]);
  const [persistOrders, setPersistOrders] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState(["created desc"]);
  const [queryValue, setQueryValue] = useState('');
  const [isTableLoading, setTableLoading] = useState(false);
  const [pageInfo, setPageInfo] = useState({
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [PageSize, setPageSize] = useState('5');
  const [emailStatus, setEmailStatus] = useState([true, false]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      console.log(
        `currentPage: ${currentPage}, queryValue: ${queryValue}, selectedFilter: ${selectedFilter}, PageSize: ${PageSize}, emailStatus: ${emailStatus}`
      );
      fetchPaginatedData();
    }, 700);
    return () => {
      clearTimeout(debounceTimer);
    };
  }, [currentPage, queryValue, selectedFilter, PageSize, emailStatus]);

  const fetchPaginatedData = async () => {
    try {
      if (!isTableLoading) {
        setTableLoading(true);
      }
      const response = await fetch('/api/getOrders', {
        method: "POST",
        body: JSON.stringify({
          page: currentPage,
          PageSize: Number(PageSize),
          queryValue,
          selectedFilter: selectedFilter[0],
          emailStatus,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.allOrders) {
          console.log("Fetched data:", data.allOrders);
          setOrders(data.allOrders);
          setPersistOrders((prev) => ([...prev, ...data.allOrders]));
          if (data.pageInfo) {
            setPageInfo(data.pageInfo);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching paginated data:", error);
    } finally {
      setTableLoading(false);
    }
  };

  const handleSendMessageInitial = () => {
    const modal = document.getElementById('confirmation_modal');
    if (modal) {
      modal.show();
    }
  };

  const hideModal = () => {
    const modal = document.getElementById('confirmation_modal');
    if (modal) {
      modal.hide();
    }
  };

  const handleSendMessageConfirmed = async () => {
    hideModal();
    console.log("selectedTableData", selectedTableData);
    const orders = selectedTableData;
  
    if (!orders || orders.length === 0) {
      shopify.toast.show("No orders selected");
      return;
    }
  
    try {
      const response = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orders }),
      });
  
      const data = await response.json();
      if (data?.success) {
        shopify.toast.show("Emails sent successfully");
        console.log("Emails sent successfully", data);
      } else {
        shopify.toast.show("Failed to send emails");
        console.error("Failed to send emails:", data?.message);
      }
    } catch (error) {
      shopify.toast.show("Error sending emails");
      console.error("Error sending emails:", error);
    }
  };
  
  

  const handleEmailStatusChange = useCallback((v) => {
    console.log("handleEmailStatusChange v", v);
    if (v?.length) {
      setEmailStatus(v);
    }
  }, []);

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
            <Button variant="primary" onClick={handleSendMessageConfirmed}>
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
            setCurrentPage={setCurrentPage}
            isTableLoading={isTableLoading}
            setQueryValue={setQueryValue}
            queryValue={queryValue}
            handleEmailStatusChange={handleEmailStatusChange}
            emailStatus={emailStatus}
            pageInfo={pageInfo}
          />
        </Card>
      </div>
    </Page>
  );
}
