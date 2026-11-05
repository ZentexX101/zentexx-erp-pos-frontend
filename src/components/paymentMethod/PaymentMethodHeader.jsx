import PageHeader from "../common/layout/PageHeader";

// Page title. Payment forms only offer Cash and Bank, so no new accounts are made here; older ones stay with their history.
const PaymentMethodHeader = () => (
  <PageHeader title="Payment Method" subtitle="Cash and Bank are what payment forms use. Older accounts stay here with their history." />
);

export default PaymentMethodHeader;
