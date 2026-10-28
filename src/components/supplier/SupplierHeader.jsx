import Button from "../common/buttons/Button";
import Icon from "../common/icons/Icon";
import PageHeader from "../common/layout/PageHeader";

// Page title with the "Create Supplier" button (only for users who can create)
const SupplierHeader = ({ canCreate, onCreate }) => (
  <PageHeader
    title="Supplier"
    subtitle="Manage all suppliers"
    actions={
      canCreate && (
        <Button onClick={onCreate}>
          <Icon name="plus" />
          Create Supplier
        </Button>
      )
    }
  />
);

export default SupplierHeader;
