import Button from "../common/buttons/Button";
import Icon from "../common/icons/Icon";
import PageHeader from "../common/layout/PageHeader";

// Page title with the "Create Customer" button (only for users who can create)
const CustomerHeader = ({ canCreate, onCreate }) => (
  <PageHeader
    title="Customer"
    subtitle="Manage all customers"
    actions={
      canCreate && (
        <Button onClick={onCreate}>
          <Icon name="plus" />
          Create Customer
        </Button>
      )
    }
  />
);

export default CustomerHeader;
